import DefaultResolver from './resolvers/default';
import router, { Route as RouterJSRoute } from 'router_js';
import Owner from './owner';
import EmberXRouter from './index';
import { tracked } from '@emberx/component';
import LocationBar from './vendor/location-bar';
import { buildQueryParams, formatQueryParamValue, getQueryParamConfig, isEqual, isHiddenFromURL } from './query-params';

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

  triggerEvent(routeInfos: any[], _ignoreFailure: boolean, name: string, args: any[]) {
    if (name === 'finalizeQueryParamChange') {
      return this.#finalizeQueryParams(routeInfos, args[0], args[1], args[2]);
    } else if (name === 'queryParamsDidChange') {
      return this.#refreshForQueryParams(routeInfos, args[0], args[2]);
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
      // return logAbort(transition);
    } else {
      transition.trigger(false, 'error', error.error, this, error.route);
      transition.abort();
      return error.error;
    }
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

  async visit(path: string): Promise<void> {
    return this.transitionTo(path).followRedirects();
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
}
