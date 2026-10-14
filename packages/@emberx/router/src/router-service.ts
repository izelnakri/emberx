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

  /** Errors an error substate dealt with; visit() resolves for these instead of rejecting. */
  #handledErrors = new Set<unknown>();
  #loadingTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(options: FreeObject | undefined) {
    super();

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        (this as FreeObject)[key] = value;
      });
    }

    this.locationBar = new LocationBar();
    this.locationBar.start({ pushState: true });
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
      return logAbort(transition);
    }

    transition.trigger(false, 'error', error.error, transition, error.route);
    transition.abort();

    return error.error;
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

  routeWillChange(): void {
    return;
  }

  routeDidChange(): void {
    return;
  }

  getSerializer(): any {
    return;
  }

  willTransition(_oldRouteInfos: any, _newRouteInfos: any, transition: any) {
    const targetRouteInfo = transition.routeInfos[transition.resolveIndex];

    this.currentRoute = targetRouteInfo._route;
    this.currentRouteName = targetRouteInfo.name;
    this.currentURL = transition.intent.url;
  }

  didTransition(routeInfos: any) {
    const targetRouteInfo = routeInfos[routeInfos.length - 1];

    this.currentRoute = targetRouteInfo._route;
    this.currentRouteName = targetRouteInfo.name;
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
