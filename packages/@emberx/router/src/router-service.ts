import Router, { Route } from 'router_js';
import EmberXRouter from './index';
import DefaultRoute from './route';
import LocationBar from './vendor/location-bar';

interface FreeObject {
  [propName: string]: any;
}

export default class RouterJSRouter extends Router<Route> {
  // @ts-ignore
  testing: boolean = !!globalThis.QUnit;
  locationBar: any;
  path: string;

  // currentRoute
  // currentRouteName
  // currentURL
  // isDestroyed
  // isDestroying
  // location
  // mergedProperties
  // rootURL

  // routeDidChange
  // routeWillChange

  // recognize
  // replaceWith
  // transitionTo
  // urlFor

  constructor() {
    super();

    this.locationBar = new LocationBar();
    this.locationBar.start({ pushState: true });
  }

  triggerEvent(): void {
    return;
  }
  willTransition(): void {
    return;
  }
  didTransition(): void {
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

  replaceURL(): void {
    return;
  }
  routeWillChange(abc): void {
    // console.log('routeWillChange call for', abc);
    return;
  }
  routeDidChange(abc): void {
    // console.log('routeDidChange call for', abc);
    return;
  }
  getSerializer(): any {
    return;
  }
  getRoute(name: string): any {
    if (EmberXRouter.LOG_ROUTES) {
      console.log('iz debug', name);
    }

    // console.log('ZZZZZZZZ target route is', EmberXRouter.ROUTE_REGISTRY[name].route || DefaultRoute);
    // console.log(EmberXRouter.ROUTE_REGISTRY);
    debugger;
    return EmberXRouter.ROUTE_REGISTRY[name].route || DefaultRoute;
  }

  updateURL(url: string): void {
    this.path = url;

    if (!this.testing) {
      this.locationBar.update(url);
    }
  }

  async visit(path: string): Promise<void> {
    const targetHandlers = this.recognizer.recognize(path);

    // TODO: this logic is wrong
    if (targetHandlers) {
      const targetHandler: FreeObject = targetHandlers[targetHandlers.length - 1] as FreeObject;
      const params = Object.keys(targetHandler.params);

      if (params.length > 0) {
        const handler: string = targetHandler.handler;
        // TODO: params is an object but it needs just the value it needs
        let targetParams = [handler].concat(params.map((key) => targetHandler.params[key]));

        // @ts-ignore
        console.log('targetParams', targetParams);
        let lol = await this.transitionTo(...targetParams);
        debugger;
      } else {
        console.log('targetHandler', targetHandler);
        await this.transitionTo(targetHandler.handler);
      }
    } else {
      console.log('NO ROUTE FOUND');
    }
  }

  // transitionTo(routeName: string, params: object, options: object): object {
  //   return this.router.transitionTo(routeName, params, options);
  // }
}
