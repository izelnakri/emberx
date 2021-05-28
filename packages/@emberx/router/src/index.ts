import RouterJSRouter from './services/router';
import EmberXRoute from '@emberx/route';

interface FreeObject {
  [propName: string]: any;
}

interface RouteDefinition {
  path: string;
  route: EmberXRoute;
  routeName: string;
  indexRoute?: EmberXRoute;
}

interface RouteRegistry {
  [propName: string]: RouteDefinition;
}

interface routerJSRouteDefinition {
  path: string;
  route: EmberXRoute;
  routeName: string;
  nestedRoutes: [routerJSRouteDefinition];
}

// NOTE: check Route.toReadOnlyRouteInfo
// NOTE: there is this.recognizer.add (when recognizer is an instance via new RouteRecognizer())

// TODO: { path: '/' } resets the path, by default route($segment) is { path: /$segment }, also people can use '/:dynamic' or ':dynamic';
export default class EmberXRouter {
  static LOG_ROUTES = true;
  static LOG_MODELS = true;
  static SERVICES: FreeObject = {};
  static _ROUTE_REGISTRY = {};
  static _parentRoute: string | null = null;
  static routerjs: RouterJSRouter = null;

  // static IS_TESTING() {
  //   return !!globalThis.QUnit;
  // }

  static start(
    arrayOfRouteDefinitions: Array<RouteDefinition> = [],
    routeMap: any = undefined
  ): RouterJSRouter {
    this._ROUTE_REGISTRY = {};

    if (routeMap) {
      this.map(routeMap); // move this to super.map since it just mutates the module
    }

    let routeMapRegistry = routeMap ? this.map(routeMap) : {};
    let registry = this.definitionsToRegistry(arrayOfRouteDefinitions);
    let routerJSRouteArray = this.convertToRouterJSRouteArray(
      Object.assign(routeMapRegistry, registry)
    );
    let runRegistryMap = this.runRegistryMap;

    this.routerjs = new RouterJSRouter();
    this.routerjs.map(function (match) {
      runRegistryMap(runRegistryMap, match, routerJSRouteArray);
    });
    this.SERVICES.router = this.routerjs;

    return this.routerjs;
  }

  static definitionsToRegistry(
    arrayOfRouteDefinitions: Array<RouteDefinition> = []
  ): RouteRegistry {
    arrayOfRouteDefinitions.forEach((routeElement) => {
      const routeName =
        routeElement.routeName ||
        createRouteNameFromRouteClass(routeElement.route) ||
        createRouteNameFromPath(routeElement.path); // NOTE: when /create-user type of paths are defined create a better routeName guess, should I replace order?
      const routeNameSegments = routeName.split('.');
      const normalizedPath = routeElement.path.startsWith('/')
        ? routeElement.path.slice(1)
        : routeElement.path;
      const routePathSegments = normalizedPath.split('/');

      routeNameSegments.reduce((currentSegment, routeSegment, index) => {
        const targetSegmentName = currentSegment
          ? `${currentSegment}.${routeSegment}`
          : routeSegment;
        const targetIndex =
          index >= routePathSegments.length ? routePathSegments.length - 1 : index;

        checkInRouteRegistryOrCreateRoute(this._ROUTE_REGISTRY, {
          routeName: targetSegmentName,
          options: { path: `/${routePathSegments[targetIndex]}` },
          route: index === routeNameSegments.length - 1 ? routeElement.route : undefined,
        });

        if (currentSegment && !this._ROUTE_REGISTRY[`${currentSegment}.index`]) {
          this._ROUTE_REGISTRY[`${currentSegment}.index`] = {
            routeName: `${currentSegment}.index`,
            options: { path: '/' },
            route: undefined,
          };
        }

        return targetSegmentName;
      }, null);

      if (routeElement.indexRoute && routeName !== 'index') {
        this._ROUTE_REGISTRY[`${routeName}.index`] = {
          routeName: `${routeName}.index`,
          options: { path: '/' },
          route: routeElement.indexRoute,
        };
      }
    });

    return this._ROUTE_REGISTRY;
  }

  static convertToRouterJSRouteArray(
    routerRegistry: RouteRegistry
  ): Array<routerJSRouteDefinition> {
    return Object.keys(routerRegistry)
      .sort()
      .reduce((result, routeName) => {
        const routeSegments = routeName.split('.');

        routeSegments.pop();

        if (routeSegments.length === 0) {
          return result.concat([
            Object.assign({}, routerRegistry[routeName], { nestedRoutes: [] }),
          ]);
        }

        const foundParentRoute = findNestedRoute(result, routeSegments);

        if (!foundParentRoute) {
          return result.concat([
            Object.assign({}, routerRegistry[routeName], { nestedRoutes: [] }),
          ]);
        }

        foundParentRoute.nestedRoutes.push(
          Object.assign({}, routerRegistry[routeName], { nestedRoutes: [] })
        );

        return result;
      }, []);
  }

  static runRegistryMap(
    runRegistryMap: (any, match, routerJSRouteArray: FreeObject) => {},
    match: (param: any) => any,
    routerJSRouteArray: FreeObject
  ): Array<routerJSRouteDefinition> {
    return Object.keys(routerJSRouteArray).map((registryRoute) => {
      const route = routerJSRouteArray[registryRoute];

      if (route.nestedRoutes.length > 0) {
        return match(route.options.path).to(route.routeName, function (match) {
          runRegistryMap(runRegistryMap, match, route.nestedRoutes);
        });
      }

      match(route.options.path).to(route.routeName);
    });
  }

  static route(routeName: string, options: FreeObject, subRoute?: () => {}): any {
    this._parentRoute = this._parentRoute ? `${this._parentRoute}.${routeName}` : routeName;

    const targetOptions =
      typeof options === 'object' && options !== null
        ? Object.assign(options, {
            path: options.path || getLastPath(this._parentRoute),
          })
        : { path: getLastPath(this._parentRoute) };
    const targetSubRoute = subRoute || returnOptionsAsSubRouteIfFunction(options);

    if (targetSubRoute) {
      targetSubRoute.apply(this);

      const existingIndexRoute = this._ROUTE_REGISTRY[`${this._parentRoute}.index`];

      this._ROUTE_REGISTRY[`${this._parentRoute}.index`] = existingIndexRoute || {
        routeName: `${this._parentRoute}.index`,
        options: { path: '/' },
        route: undefined,
      };
    }

    this._ROUTE_REGISTRY[this._parentRoute] = {
      routeName: this._parentRoute,
      options: targetOptions,
      route: undefined,
    };

    const segments = this._parentRoute.split('.');

    segments.length = segments.length - 1;

    this._parentRoute = segments.join('.');

    return this._ROUTE_REGISTRY;
  }

  static map(routerDefinition: () => {}): RouteRegistry {
    this._ROUTE_REGISTRY = {};

    routerDefinition.apply(this);

    return this._ROUTE_REGISTRY;
  }

  // NOTE: add to registry by demand
  // NOTE: add to actual router by demand
}

function returnOptionsAsSubRouteIfFunction(options) {
  return typeof options === 'function' ? options : undefined;
}

export function createRouteNameFromRouteClass(routeClass: EmberXRoute | void): string | void {
  if (routeClass) {
    return routeClass.constructor.name
      .replace(/Route$/g, '')
      .split('')
      .reduce((result, character, index) => {
        if (index === 0) {
          return character.toLowerCase();
        } else if (character.toUpperCase() === character) {
          return `${result}.${character.toLowerCase()}`;
        }

        return `${result}${character}`;
      }, '');
  }
}

export function createRouteNameFromPath(routePath: string): string {
  const targetPath = routePath[0] === '/' ? routePath.slice(1) : routePath;

  return targetPath.replace(/\//g, '.').replace(/:/g, '');
}

function checkInRouteRegistryOrCreateRoute(registry, targetRoute) {
  const routeName = targetRoute.routeName;
  const foundRoute = registry[targetRoute.routeName];

  if (!foundRoute) {
    registry[routeName] = targetRoute;

    return registry[routeName];
  }

  if (targetRoute.route) {
    if (foundRoute.route && foundRoute.route.name !== targetRoute.route.name) {
      console.log(
        `[WARNING]: ${routeName}.route already has ${foundRoute.route}. You tried to overwrite ${routeName}.route with ${targetRoute.route}`
      );
    }

    registry[routeName] = Object.assign(foundRoute, { route: targetRoute.route });
  }

  return registry[routeName];
}

function getLastPath(path) {
  const paths = path.split('.');

  return `/${paths[paths.length - 1]}`;
}

function findNestedRoute(routerJSRouteArray, routeNameSegments) {
  return routeNameSegments.reduce((result, routeNameSegment, index) => {
    const target = result.nestedRoutes ? result.nestedRoutes : routerJSRouteArray;
    const targetRouteName =
      index === 0 ? routeNameSegment : routeNameSegments.slice(0, index + 1).join('.');

    return target.find((routeObject) => routeObject.routeName === targetRouteName);
  }, {});
}
