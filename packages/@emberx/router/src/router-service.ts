import DefaultResolver from './resolvers/default.ts';
import router, { logAbort, Route as RouterJSRoute } from 'router_js';
import Owner from './owner.ts';
import EmberXRouter from './index.ts';
import { tracked } from '@emberx/component';
import LocationBar from './vendor/location-bar.js';
import {
  buildQueryParams,
  formatQueryParamValue,
  getQueryParamConfig,
  isEqual,
  isHiddenFromURL,
} from './query-params.ts';
import { findSubstate, type Substate } from './substates.ts';

/**
 * router_js publishes both an ESM and a CJS build; under the CJS interop shape
 * the class sits one level down on `.default`. Both branches denote the very
 * same constructor, so a single alias describes either.
 */
type RouterJSConstructor = typeof router;
const routerModule = router as RouterJSConstructor & { default?: RouterJSConstructor };

const Router = routerModule.default ? routerModule.default : routerModule;

interface FreeObject {
  [propName: string]: any;
}

/**
 * QUnit installs itself as a global while the test suite runs, and its mere
 * presence is how emberx detects that it is running under test. `QUnit` is typed
 * as `unknown` because only its existence is ever checked.
 *
 * This is a cast at the use site rather than a `declare global`, which would be
 * published in this package's .d.ts and then clash with `@types/qunit` in any
 * consumer that has it installed.
 */
export type GlobalWithQUnit = typeof globalThis & { QUnit?: unknown };

/** The events the router service emits through on() and off(). */
export type RouterEventName = 'routeWillChange' | 'routeDidChange';

/** A listener for router events. `this` is the router service. */
export type RouterEventListener = (this: RouterJSRouter, transition: any) => void;

// handleURL accepts slash-less URLs
// route recognize and recognizeAndLoad
export default class RouterJSRouter extends Router<RouterJSRoute> {
  // @ts-ignore
  activeTransition: FreeObject;
  testing: boolean = !!(globalThis as GlobalWithQUnit).QUnit;
  locationBar: any;

  Resolver = DefaultResolver;

  /** The query params in the URL, cast to the values they denote. Declared defaults are not in here. */
  @tracked queryParams: FreeObject = {};
  @tracked currentRoute: string | undefined;
  @tracked currentRouteName: string | undefined;
  @tracked currentURL: string | undefined;
  /** Whether a transition is under way. currentURL is already its destination by then. */
  @tracked isTransitioning = false;
  /** The URL the transition under way is leaving. */
  @tracked transitionFromURL: string | undefined;

  /** Errors an error substate dealt with; visit() resolves for these instead of rejecting. */
  #handledErrors = new Set<unknown>();
  #loadingTimer: ReturnType<typeof setTimeout> | undefined;
  #listeners: Record<RouterEventName, Set<RouterEventListener>> = {
    routeWillChange: new Set(),
    routeDidChange: new Set(),
  };

  constructor(options: FreeObject | undefined) {
    super();

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        (this as FreeObject)[key] = value;
      });
    }

    this.locationBar = new LocationBar();
    this.locationBar.start({ pushState: true });
    // Back and forward change the URL first, then fire popstate: go where they went.
    this.locationBar.onChange((path: string) => this.#followBrowserURL(path));
  }

  /** Stops following the browser's back and forward buttons, for a router that is being replaced. */
  stopListening(): void {
    this.locationBar.stop();
  }

  /**
   * The query params as the active routes see them: the ones in the URL, cast,
   * plus the declared defaults of the ones missing from it.
   */
  get queryParamsWithDefaults(): FreeObject {
    return buildQueryParams(this.queryParams, this.state?.routeInfos ?? []);
  }

  /**
   * router_js's hook for the events it fires during a transition. The
   * query-param events and loading/error go to the router's own handling.
   */
  triggerEvent(routeInfos: any[], ignoreFailure: boolean, name: string, args: any[]) {
    if (name === 'finalizeQueryParamChange') {
      return this.#finalizeQueryParams(routeInfos, args[0], args[1], args[2]);
    } else if (name === 'queryParamsDidChange') {
      return this.#refreshForQueryParams(routeInfos, args[0], args[2]);
    } else if (name === 'willResolveModel') {
      return this.#scheduleLoadingEvent(args[0], args[1]);
    } else if (name === 'loading') {
      return this.#enterSubstate(routeInfos, 'loading', args[0]);
    } else if (name === 'error') {
      return this.#enterSubstate(routeInfos, 'error', args[1], args[0]);
    } else if (!ignoreFailure) {
      throw new Error(`Nothing handles '${name}': emberx routes have no actions. Call a page's @action, or a service.`);
    }
  }

  replaceURL(url: string): void {
    this.currentURL = url;

    if (!this.testing) {
      this.locationBar.update(url, { replace: true });
    }
  }

  updateURL(url: string): void {
    this.currentURL = url;

    if (!this.testing) {
      this.locationBar.update(url);
    }
  }

  transitionDidError(error: any, transition: any) {
    if (error.wasAborted || transition.isAborted) {
      // A redirect aborts the transition too, and leaves the next one active.
      if (!this.activeTransition) {
        this.#endTransition();
      }

      return logAbort(transition);
    }

    transition.trigger(false, 'error', error.error, transition, error.route);
    transition.abort();
    this.#endTransition();

    return error.error;
  }

  /**
   * The URL of `routeName`, without transitioning to it, as Ember's router
   * service builds it:
   *
   *   router.urlFor('posts.post', post, { queryParams: { page: 2 } }); // '/posts/1?page=2'
   *
   * Models fill the dynamic segments, from the route's own up; those left out
   * come from the routes already active. Query params that are missing, or at
   * the default their route declares, are left out, as the router leaves them
   * out of the URL it shows.
   */
  urlFor(routeName: string, ...modelsAndOptions: any[]): string {
    const last = modelsAndOptions[modelsAndOptions.length - 1];
    const hasOptions = typeof last === 'object' && last !== null && Object.hasOwn(last, 'queryParams');
    const models = hasOptions ? modelsAndOptions.slice(0, -1) : modelsAndOptions;
    const queryParams: FreeObject = (hasOptions && last.queryParams) || {};
    const { routeInfos } = this.applyIntent(routeName, models);
    const visibleQueryParams = Object.keys(queryParams).reduce((result: FreeObject, key) => {
      if (!isHiddenFromURL(formatQueryParamValue(queryParams[key]), getQueryParamConfig(routeInfos, key))) {
        result[key] = queryParams[key];
      }

      return result;
    }, {});

    return this.generate(routeName, ...models, { queryParams: visibleQueryParams });
  }

  /** Whether an `error` handler or substate dealt with `error`. Each error is reported once. */
  isErrorHandled(error: unknown): boolean {
    return this.#handledErrors.delete(error);
  }

  intermediateTransitionTo(name: string, ...args: any[]): any {
    const transition = super.intermediateTransitionTo(name, ...args);
    const routeInfos = this.state!.routeInfos;
    const targetRouteInfo = routeInfos[routeInfos.length - 1];

    this.currentRoute = targetRouteInfo.route as any;
    this.currentRouteName = targetRouteInfo.name;

    return transition;
  }

  /**
   * Calls `listener` with the transition, as Ember's router service does, on:
   *
   * - `routeWillChange`: a transition starts, is redirected, or enters a
   *   loading or error substate;
   * - `routeDidChange`: a transition has finished and the URL is updated.
   *
   * For analytics, page titles or scroll positions:
   *
   *   router.on('routeDidChange', (transition) => analytics.trackPage(transition.to.name));
   */
  on(eventName: RouterEventName, listener: RouterEventListener): this {
    this.#listenersOf(eventName).add(listener);

    return this;
  }

  /** Stops calling `listener` on `eventName`. */
  off(eventName: RouterEventName, listener: RouterEventListener): this {
    this.#listenersOf(eventName).delete(listener);

    return this;
  }

  routeWillChange(transition: any): void {
    this.#emit('routeWillChange', transition);
  }

  routeDidChange(transition: any): void {
    this.#emit('routeDidChange', transition);
  }

  getSerializer(): any {
    return;
  }

  willTransition(_oldRouteInfos: any, _newRouteInfos: any, transition: any) {
    const targetRouteInfo = transition.routeInfos[transition.resolveIndex];

    this.isTransitioning = true;
    this.transitionFromURL = this.currentURL;
    this.currentRoute = targetRouteInfo._route;
    this.currentRouteName = targetRouteInfo.name;
    this.currentURL = transition.intent.url;
  }

  didTransition(routeInfos: any) {
    const targetRouteInfo = routeInfos[routeInfos.length - 1];

    this.currentRoute = targetRouteInfo._route;
    this.currentRouteName = targetRouteInfo.name;
    this.#endTransition();
  }

  getRoute(name: string): any {
    if (EmberXRouter.LOG_ROUTES) {
      console.log('[EmberXRouter debug]:', name);
    }

    const targetRoute = this.Resolver.resolve(name);

    return Object.assign(targetRoute, Owner.services);
  }

  /**
   * Transitions to `path`, following redirects. Resolves when an error substate
   * dealt with a failure, and rejects when nothing did.
   */
  async visit(path: string): Promise<void> {
    try {
      await this.transitionTo(path).followRedirects();
    } catch (error) {
      if (!this.isErrorHandled(error)) {
        throw error;
      }
    }
  }

  /**
   * Routes to a URL the browser already shows, so the URL is left as it is.
   * Like visit(), a failure an error handler or substate dealt with is not one.
   */
  #followBrowserURL(path: string) {
    this.handleURL(path)
      .followRedirects()
      .catch((error: any) => {
        // An aborted transition is one the app stopped on purpose, in willTransition for example.
        if (error?.name !== 'TransitionAborted' && !this.isErrorHandled(error)) {
          throw error;
        }
      });
  }

  #listenersOf(eventName: RouterEventName): Set<RouterEventListener> {
    const listeners = this.#listeners[eventName];
    if (!listeners) {
      throw new Error(`The router has no "${eventName}" event, only routeWillChange and routeDidChange.`);
    }

    return listeners;
  }

  // A copy, so a listener that adds or removes listeners does not change this round.
  #emit(eventName: RouterEventName, transition: any) {
    [...this.#listeners[eventName]].forEach((listener) => listener.call(this, transition));
  }

  #endTransition() {
    this.isTransitioning = false;
    this.transitionFromURL = undefined;
  }

  /**
   * Keeps the params in the URL that are set and not at their declared default,
   * cast to the values they denote, and switches the URL update to replaceState
   * when a changed param is declared with `replace: true`.
   */
  #finalizeQueryParams(routeInfos: any[], queryParams: FreeObject, finalQueryParams: FreeObject[], transition: any) {
    const values: FreeObject = {};

    for (const key in queryParams) {
      const value = formatQueryParamValue(queryParams[key]);
      if (!isHiddenFromURL(value, getQueryParamConfig(routeInfos, key))) {
        values[key] = value;
        finalQueryParams.push({ key, value });
      }
    }

    const keys = new Set([...Object.keys(values), ...Object.keys(this.queryParams)]);
    const replace = [...keys].some((key) => {
      return getQueryParamConfig(routeInfos, key)?.replace && !isEqual(values[key], this.queryParams[key]);
    });
    if (replace && transition) {
      transition.method('replace');
    }

    this.queryParams = values;
  }

  /**
   * Re-runs the model hooks from the topmost route that declares a changed param
   * with `refreshModel: true`. Routes the transition resolves anyway are skipped.
   */
  #refreshForQueryParams(routeInfos: any[], changed: FreeObject, removed: FreeObject) {
    const changedKeys = [...Object.keys(changed), ...Object.keys(removed)].filter((key) => {
      const defaultValue = getQueryParamConfig(routeInfos, key)?.defaultValue;
      const before = this.queryParams[key] ?? defaultValue;
      const after = formatQueryParamValue(changed[key]) ?? defaultValue;

      return !isEqual(before, after);
    });
    const pivot = routeInfos.find((routeInfo) => {
      return routeInfo.isResolved && changedKeys.some((key) => getQueryParamConfig([routeInfo], key)?.refreshModel);
    });

    if (pivot && this.currentRouteInfos) {
      this.refresh(pivot.route);
    }
  }

  /**
   * Fires `loading` once the hooks of the route being resolved have not settled
   * by the next task, which is how long Ember waits too: a model that resolves
   * right away never shows a loading substate.
   */
  #scheduleLoadingEvent(transition: any, originRoute: unknown) {
    clearTimeout(this.#loadingTimer);

    this.#loadingTimer = setTimeout(() => {
      if (this.activeTransition === transition && transition.isActive) {
        transition.trigger(true, 'loading', transition, originRoute);
      }
    });
  }

  /** Enters the nearest declared loading or error substate, which nothing above handled. */
  #enterSubstate(routeInfos: any[], substate: Substate, transition: any, error?: unknown) {
    const name = findSubstate(
      routeInfos,
      substate,
      (routeName) => {
        const definition = Owner.routes[routeName];

        // As in Ember, a substate is only entered when there is something to render.
        return !!definition?.options?.substate && !!definition.route && this.hasRoute(routeName);
      },
      transition?.pivotHandler,
    );
    if (!name) {
      return;
    }

    if (substate === 'error') {
      this.#handledErrors.add(error);
      this.intermediateTransitionTo(name, error);
    } else {
      this.intermediateTransitionTo(name);
    }
  }
}
