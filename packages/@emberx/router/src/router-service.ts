import Router, { Route } from 'router_js';
import EmberXRouter from './index';
import { tracked } from '@emberx/component';
import DefaultRoute from './route';
import LocationBar from './vendor/location-bar';

interface FreeObject {
  [propName: string]: any;
}

// currentRoute
// currentRouteName
// currentURL
// isDestroyed
// isDestroying
// location
// mergedProperties
// rootURL
// routeWillChange

// recognize
// replaceWith
// transitionTo
// urlFor
export default class RouterJSRouter extends Router<Route> {
  // @ts-ignore
  testing: boolean = !!globalThis.QUnit;
  locationBar: any;
  path: string | null = null;

  @tracked currentRoute: string | undefined;
  @tracked currentRouteName: string | undefined;
  @tracked currentURL: string | undefined; // TODO: this as well

  get currentPath() {
    // NOTE: maybe just have currentPath instead of path
    return this.path;
  }

  constructor() {
    super();

    this.locationBar = new LocationBar();
    this.locationBar.start({ pushState: true });
  }

  triggerEvent(): void {
    return;
  }

  replaceURL(): void {
    return;
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
    this.currentURL = targetRouteInfo.router.path;
  }

  didTransition(routeInfos: any) {
    let targetRouteInfo = routeInfos[routeInfos.length - 1];

    this.currentRoute = targetRouteInfo._route;
    this.currentRouteName = targetRouteInfo.name;
    this.currentURL = targetRouteInfo.router.path;
  }

  getRoute(name: string): any {
    if (EmberXRouter.LOG_ROUTES) {
      console.log('iz debug', name);
    }

    let targetRoute = EmberXRouter.ROUTE_REGISTRY[name].route || DefaultRoute;

    return Object.assign(targetRoute, EmberXRouter.SERVICES); // NOTE: maybe optimize this in future
  }

  updateURL(url: string): void {
    this.path = url;

    if (!this.testing) {
      this.locationBar.update(url);
    }
  }

  async visit(path: string): Promise<void> {
    const targetHandlers = this.recognizer.recognize(path);

    if (targetHandlers) {
      const targetHandler: FreeObject = targetHandlers[targetHandlers.length - 1] as FreeObject;
      const params = Object.keys(targetHandler.params);

      if (params.length > 0) {
        const handler: string = targetHandler.handler;
        // TODO: params is an object but it needs just the value it needs
        let targetParams = [handler].concat(params.map((key) => targetHandler.params[key]));

        // @ts-ignore
        console.log('targetParams', targetParams);
        try {
          // @ts-ignore
          await this.transitionTo(...targetParams);
        } catch (error) {
          debugger;
        }
      } else {
        console.log('targetHandler', targetHandler);
        try {
          await this.transitionTo(targetHandler.handler);
        } catch (error) {
          debugger;
        }
      }
    } else {
      console.log(
        'NO ROUTE FOUND. This is probably a bug, please report it to: https://github.com/izelnakri/emberx/issues/new'
      );
    }
  }

  // transitionTo(routeName: string, params: object, options: object): object {
  //   return this.router.transitionTo(routeName, params, options);
  // }
}
