import DefaultResolver from './resolvers/default.ts';
import router, { logAbort, type Route as RouterJSRoute } from 'router_js';
import Owner from './owner.ts';
import EmberXRouter from './index.ts';
import { renderComponent, tracked } from '@emberx/component';
import LocationBar from '@emberx/vendor/location-bar';
import {
  buildQueryParams,
  formatQueryParamValue,
  getQueryParamConfig,
  isEqual,
  isHiddenFromURL,
} from './query-params.ts';
import { findSubstate, type Substate } from './substates.ts';
import { ROUTE_ABOVE_PAGE } from './route-above-page.ts';

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
  @tracked accessor queryParams: FreeObject = {};
  @tracked accessor currentRoute: string | undefined;
  @tracked accessor currentRouteName: string | undefined;
  @tracked accessor currentURL: string | undefined;
  /** Whether a transition is under way. currentURL is already its destination by then. */
  @tracked accessor isTransitioning = false;
  /** The URL the transition under way is leaving. */
  @tracked accessor transitionFromURL: string | undefined;

  /**
   * The page on screen: the route instance whose template the router rendered
   * last. Actions sent with send(), and `willTransition`, reach it first.
   */
  currentPage: object | undefined;

  /**
   * Instances of the routes above the page, made when an action first needs
   * one. Keyed by route info, so an instance lasts while its route stays active
   * with the same model.
   */
  #routesAbovePage = new WeakMap<object, object>();

  /**
   * For each transition, the index of the deepest route that stays active
   * through it: the routes it starts with already resolved. A loading substate
   * is not looked for above it.
   */
  #pivotIndexes = new WeakMap<object, number>();

  /** Errors an error substate dealt with; visit() resolves for these instead of rejecting. */
  #handledErrors = new Set<unknown>();
  #loadingTimer: ReturnType<typeof setTimeout> | undefined;
  #listeners: Record<RouterEventName, Set<RouterEventListener>> = {
    routeWillChange: new Set(),
    routeDidChange: new Set(),
  };

  /**
   * Where the URL lives. `history`: the address bar, through pushState, with the
   * back and forward buttons followed. `none`: only here, as Ember's
   * NoneLocation keeps it, for rendering on a server. Without a `window`, `none`.
   */
  location: 'history' | 'none' = typeof window === 'undefined' ? 'none' : 'history';

  constructor(options: FreeObject | undefined) {
    super();

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) (this as FreeObject)[key] = value;
      });
    }

    if (this.location === 'history') {
      this.locationBar = new LocationBar();
      this.locationBar.start({ pushState: true });
      // Back and forward change the URL first, then fire popstate: go where they went.
      this.locationBar.onChange((path: string) => this.#followBrowserURL(path));
    }
  }

  /** Stops following the browser's back and forward buttons, for a router that is being replaced. */
  stopListening(): void {
    this.locationBar?.stop();
  }

  /**
   * Renders the page a transition ended on: into `#app`, or `#ember-testing`
   * in a test. @emberx/ssr's renderURLToString() replaces it, to render the
   * page to a string instead.
   */
  async renderPage(Page: object, args: FreeObject): Promise<void> {
    const element = document.getElementById(this.testing ? 'ember-testing' : 'app');
    if (!element) {
      throw new Error('#app or #ember-testing not found for the @emberx/router to boot/render the application!');
    }

    await renderComponent(Page as any, { element, args, owner: Owner });
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
   * query-param events and loading/error go to the router's own handling, and
   * `willTransition` goes where send() goes: the page on screen, then the routes
   * above it. Any of them can abort it.
   */
  triggerEvent(routeInfos: any[], ignoreFailure: boolean, name: string, args: any[]) {
    if (name === 'finalizeQueryParamChange') {
      return this.#finalizeQueryParams(routeInfos, args[0], args[1], args[2]);
    } else if (name === 'queryParamsDidChange') {
      return this.#refreshForQueryParams(routeInfos, args[0], args[2]);
    } else if (name === 'willResolveModel') {
      return this.#scheduleLoadingEvent(args[0], args[1]);
    } else if (name === 'willTransition') {
      return this.#dispatch('willTransition', args).result;
    } else if (name === 'loading') {
      return this.#enterSubstate(routeInfos, 'loading', args[0]);
    } else if (name === 'error') {
      return this.#enterSubstate(routeInfos, 'error', args[1], args[0]);
    } else if (!ignoreFailure) {
      throw new Error(`Nothing handles '${name}'.`);
    }
  }

  /**
   * Sends the action `name` to the page on screen, then to each route above it,
   * deepest first, as Ember's route actions go up the routes: the first with an
   * @action by that name runs it, and one that returns true passes it on.
   * Returns what the action that handled it returned, a promise for an async
   * one. Throws when none of them has the action.
   *
   * A route above the page has no template on screen; the action runs on an
   * instance of it the router makes, with that route's own model, params and
   * services, and keeps while the route stays active with that model.
   */
  send(name: string, ...args: unknown[]): unknown {
    const { handled, result } = this.#dispatch(name, args);
    if (!handled) {
      throw new Error(
        `Nothing handles the action '${name}': neither the page on screen nor a route above it has an @action by that name.`,
      );
    }

    return result;
  }

  /** router_js's name for send(). */
  trigger(name: string, ...args: unknown[]): unknown {
    return this.send(name, ...args);
  }

  replaceURL(url: string): void {
    this.currentURL = url;

    if (!this.testing) {
      this.locationBar?.update(url, { replace: true });
    }
  }

  updateURL(url: string): void {
    this.currentURL = url;

    if (!this.testing) {
      this.locationBar?.update(url);
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
    // Called as a transition starts, before any of its hooks resolve a route.
    if (!transition.isIntermediate && !this.#pivotIndexes.has(transition)) {
      const routeInfos: any[] = transition.routeInfos ?? [];
      const unresolvedIndex = routeInfos.findIndex((routeInfo) => !routeInfo.isResolved);

      this.#pivotIndexes.set(transition, (unresolvedIndex === -1 ? routeInfos.length : unresolvedIndex) - 1);
    }

    this.#emit('routeWillChange', transition);
  }

  routeDidChange(transition: any): void {
    this.#emit('routeDidChange', transition);
  }

  getSerializer(): any {
    return;
  }

  willTransition(_oldRouteInfos: any, _newRouteInfos: any, transition: any) {
    // The page's willTransition can abort the transition before this runs.
    if (transition.isAborted) {
      return;
    }

    // The route the transition is going to: the deepest of its routes.
    const targetRouteInfo = transition.routeInfos[transition.routeInfos.length - 1];

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

    warnAboutEmberRouteMethods(targetRoute);

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

  #dispatch(name: string, args: unknown[]): { handled: boolean; result?: unknown } {
    let handled = false;
    for (const target of this.#actionTargets(name)) {
      handled = true;

      const result = target[name](...args);
      if (result !== true) {
        return { handled, result };
      }
    }

    return { handled };
  }

  /** The page on screen, then the routes above it that have an action `name`, deepest first. */
  *#actionTargets(name: string): Generator<any> {
    const page = this.currentPage as any;
    if (!page) {
      return;
    }

    if (typeof page[name] === 'function') {
      yield page;
    }

    // The page is the deepest active route of its class; its index route renders it when it has none.
    const routeInfos: any[] = this.state?.routeInfos ?? [];
    let pageIndex = routeInfos.length - 1;
    while (pageIndex >= 0 && routeInfos[pageIndex].route !== page.constructor) {
      pageIndex--;
    }

    for (let index = pageIndex - 1; index >= 0; index--) {
      if (hasInstanceMethod(routeInfos[index].route, name)) {
        yield this.#routeAbovePage(routeInfos, index);
      }
    }
  }

  #routeAbovePage(routeInfos: any[], index: number): object {
    const routeInfo = routeInfos[index];
    let instance = this.#routesAbovePage.get(routeInfo);
    if (!instance) {
      const RouteClass = routeInfo.route;
      instance = new RouteClass(Owner, {
        model: routeInfo.context,
        params: Object.assign({}, ...routeInfos.slice(0, index + 1).map((info) => info.params)),
        queryParams: this.queryParamsWithDefaults,
        [ROUTE_ABOVE_PAGE]: true,
      }) as object;
      this.#routesAbovePage.set(routeInfo, instance);
    }

    return instance;
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
      transition ? this.#pivotIndexes.get(transition) : undefined,
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

/** Ember route methods emberx routes do not have, with what to use instead. */
const EMBER_ROUTE_METHODS: Record<string, string> = {
  error: 'catch the error in its model hooks, or declare an errorRoute',
  loading: "declare a loadingRoute, or time transitions with router.on('routeWillChange')",
  didTransition: "use router.on('routeDidChange'), or the page's constructor",
};

/** Route classes already checked for Ember route methods, so each is warned about once. */
const checkedRoutes = new WeakSet<object>();

/**
 * Ember routes catch loading, errors and finished transitions with methods such
 * as `@action error(error) {}`. emberx routes have no actions, so a route ported
 * from Ember would lose that handling without a sound: say so, once per route.
 */
function warnAboutEmberRouteMethods(Route: any) {
  if (!Route || checkedRoutes.has(Route)) {
    return;
  }

  checkedRoutes.add(Route);
  for (const name of Object.keys(EMBER_ROUTE_METHODS)) {
    if (hasInstanceMethod(Route, name)) {
      console.warn(
        `@emberx/router: ${Route.name} has ${/^[aeiou]/.test(name) ? 'an' : 'a'} "${name}" method, which the router does not call. ` +
          `Instead, ${EMBER_ROUTE_METHODS[name]}.`,
      );
    }
  }
}

function hasInstanceMethod(Class: any, name: string): boolean {
  for (
    let prototype = Class?.prototype;
    prototype && prototype !== Object.prototype;
    prototype = Object.getPrototypeOf(prototype)
  ) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
    if (descriptor) {
      // @action defines a getter that binds the method.
      return typeof descriptor.value === 'function' || typeof descriptor.get === 'function';
    }
  }

  return false;
}
