import type { RouteRegistry, routerJSRouteDefinition } from './router';
interface FreeObject {
  [propName: string]: any;
}

export default class RouteMapContext {
  static ROUTE_REGISTRY: RouteRegistry = {};
  static _parentRoute: string | null = null;

  static map(
    map: (any: any, match: any, routerJSRouteArray: FreeObject) => {},
    match: (param: any) => any,
    routerJSRouteArray: FreeObject
  ): Array<routerJSRouteDefinition> {
    return Object.keys(routerJSRouteArray).map((registryRoute) => {
      let route = routerJSRouteArray[registryRoute];
      if (route.nestedRoutes.length > 0) {
        return match(route.options.path).to(route.name, function (match: any) {
          map(map, match, route.nestedRoutes);
        });
      }

      match(route.options.path).to(route.name);
    });
  }

  static route(routeName: string, options: FreeObject, subRoute?: () => {}): any {
    this._parentRoute = this._parentRoute ? `${this._parentRoute}.${routeName}` : routeName;

    let targetOptions =
      typeof options === 'object' && options !== null
        ? Object.assign(options, { path: options.path || getLastPath(this._parentRoute) })
        : { path: getLastPath(this._parentRoute) };

    let targetSubRoute = subRoute || returnOptionsAsSubRouteIfFunction(options);
    if (targetSubRoute) {
      targetSubRoute.apply(this);

      const existingIndexRoute = this.ROUTE_REGISTRY[`${this._parentRoute}.index`];

      this.ROUTE_REGISTRY[`${this._parentRoute}.index`] = existingIndexRoute || {
        name: `${this._parentRoute}.index`,
        options: { path: '/' },
        route: undefined,
      };
    }

    this.ROUTE_REGISTRY[this._parentRoute] = {
      name: this._parentRoute,
      options: targetOptions,
      route: undefined,
    };

    const segments = this._parentRoute.split('.');

    segments.length = segments.length - 1;

    this._parentRoute = segments.join('.');

    return this.ROUTE_REGISTRY;
  }
}

function returnOptionsAsSubRouteIfFunction(options: Function | object | undefined) {
  return typeof options === 'function' ? options : undefined;
}

function getLastPath(path: string) {
  const paths = path.split('.');

  return `/${paths[paths.length - 1]}`;
}
