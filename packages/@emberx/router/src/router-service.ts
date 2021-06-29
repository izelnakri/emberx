import DefaultResolver from './resolvers/default';
import router, { Route as RouterJSRoute } from 'router_js';
import EmberXRouter from './index';
import { tracked } from '@emberx/component';
import LocationBar from './vendor/location-bar';

// @ts-ignore
let Router = router.default ? router.default : router;

interface FreeObject {
  [propName: string]: any;
}

// routeWillChange handler
// routeDidChange handler

// recognize
// replaceWith
// urlFor

// handleURL accepts slash-less URLs
// route recognize and recognizeAndLoad
export default class RouterJSRouter extends Router<RouterJSRoute> {
  // @ts-ignore
  activeTransition: FreeObject;
  testing: boolean = !!globalThis.QUnit;
  locationBar: any;

  Resolver = DefaultResolver;

  @tracked queryParams: FreeObject = {};
  @tracked currentRoute: string | undefined;
  @tracked currentRouteName: string | undefined;
  @tracked currentURL: string | undefined;

  constructor(options: FreeObject | undefined) {
    super();

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        this[key] = value;
      });
    }

    this.locationBar = new LocationBar();
    this.locationBar.start({ pushState: true });
  }

  triggerEvent(handlerInfos: any[], _ignoreFailure: boolean, name: string, args: any[]) {
    if (['finalizeQueryParamChange', 'queryParamsDidChange'].includes(name)) {
      let currentHandlerInfo = handlerInfos[handlerInfos.length - 1];
      let currentHandler = currentHandlerInfo.route;

      // If there is no handler, it means the handler hasn't resolved yet which
      // means that we should trigger the event later when the handler is available
      if (!currentHandler) {
        currentHandlerInfo.routePromise!.then(function (resolvedHandler: any) {
          resolvedHandler.events![name].apply(resolvedHandler, args);
        });
      } else if (currentHandler.events[name]) {
        currentHandler.events[name].apply(currentHandler, args);
      }
    }
  }

  replaceURL(name: string): void {
    // TODO: check if additional history storage code needed
    return this.updateURL(name);
  }

  // NOTE: is there handleURL(?)
  updateURL(url: string): void {
    // console.log('updateURL call', url);
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
    // console.log('routeWillChange call for', abc);
    return;
  }

  routeDidChange(): void {
    // console.log('routeDidChange call for', abc);
    return;
  }

  getSerializer(): any {
    return;
  }

  willTransition(_oldRouteInfos: any, _newRouteInfos: any, transition: any) {
    let targetRouteInfo = transition.routeInfos[transition.resolveIndex];

    this.currentRoute = targetRouteInfo._route;
    this.currentRouteName = targetRouteInfo.name;
    this.currentURL = transition.intent.url;
  }

  didTransition(routeInfos: any) {
    let targetRouteInfo = routeInfos[routeInfos.length - 1];

    this.currentRoute = targetRouteInfo._route;
    this.currentRouteName = targetRouteInfo.name;
  }

  getRoute(name: string): any {
    if (EmberXRouter.LOG_ROUTES) {
      console.log('[EmberXRouter debug]:', name);
    }

    let targetRoute =
      EmberXRouter.ROUTE_REGISTRY[name].route ||
      (name.endsWith('.index') ? EmberXRouter.ROUTE_REGISTRY[name.slice(0, name.length - 6)].route : null) ||
      this.Resolver.resolve(name);

    return Object.assign(targetRoute, EmberXRouter.SERVICES);
  }

  // NOTE: test with queryParams
  async visit(path: string): Promise<void> {
    return this.transitionTo(path).followRedirects();
  }

  // transitionTo(routeName: string, params: object, options: object): object {
  //   return this.router.transitionTo(routeName, params, options);
  // }
}
