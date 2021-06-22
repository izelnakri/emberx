export { hbs } from '@emberx/component';
import RouterService from './router-service';
import Route from './route';
import RouteMapContext from './route-map-context';

export interface FreeObject {
  [propName: string]: any;
}

export interface RouteDefinition {
  path?: string;
  route: Route | undefined;
  name: string;
  options?: FreeObject;
  indexRoute?: Route;
}

export interface RouteRegistry {
  [propName: string]: RouteDefinition;
}

export interface routerJSRouteDefinition {
  path?: string;
  route: Route | undefined;
  options?: FreeObject;
  name: string;
  nestedRoutes?: [routerJSRouteDefinition?];
}

// NOTE: check Route.toReadOnlyRouteInfo
// NOTE: there is this.recognizer.add (when recognizer is an instance via new RouteRecognizer())
// TODO: { path: '/' } resets the path, by default route($segment) is { path: /$segment }, also people can use '/:dynamic' or ':dynamic';
export default class Router {
  static LOG_ROUTES = true;
  static LOG_MODELS = true;
  static SERVICES: FreeObject = {};
  static ROUTE_REGISTRY: RouteRegistry = {};
  static ROUTER_SERVICE: RouterService;

  // static IS_TESTING() {
  //   return !!globalThis.QUnit;
  // }

  static visit() {
    // @ts-ignore
    return this.ROUTER_SERVICE.visit(...arguments);
  }

  static start(arrayOfRouteDefinitions: Array<RouteDefinition> = [], routeMap: any = undefined): Router {
    this.ROUTE_REGISTRY = {};

    let routeMapRegistry = routeMap ? this.map(routeMap) : {}; // move this to super.map since it just mutates the module
    let registry = this.definitionsToRegistry(arrayOfRouteDefinitions);
    let routerJSRouteArray = this.convertToRouterJSRouteArray(Object.assign(routeMapRegistry, registry));

    this.ROUTER_SERVICE = new RouterService();
    this.ROUTER_SERVICE.map(function (match) {
      RouteMapContext.map(RouteMapContext.map, match, routerJSRouteArray);
    });
    this.SERVICES.router = this.ROUTER_SERVICE;

    return this;
  }

  static reset() {
    [this.SERVICES, this.ROUTE_REGISTRY, this.ROUTER_SERVICE].forEach((object) => {
      for (var key in object) delete object[key];
    });
  }

  static definitionsToRegistry(arrayOfRouteDefinitions: Array<RouteDefinition> = []): RouteRegistry {
    arrayOfRouteDefinitions.forEach((routeDefinition: RouteDefinition) => {
      if (!routeDefinition.path) {
        throw new Error('One of the RouteDefinition on Router.start(RouteDefinition[]) misses "path" key');
      } else if (!routeDefinition.name) {
        throw new Error('One of the RouteDefinition on Router.start(RouteDefinition[]) misses "name" key');
      }

      let routeName = routeDefinition.name; // || createRouteNameFromRouteClass(routeDefinition.route); // || createRouteNameFromPath(routeDefinition.path as string); // NOTE: when /create-user type of paths are defined create a better routeName guess, should I replace order?
      let routeNameSegments = routeName.split('.');

      let normalizedPath = routeDefinition.path.startsWith('/')
        ? routeDefinition.path.slice(1)
        : routeDefinition.path;
      let routePathSegments = normalizedPath.split('/');

      routeNameSegments.reduce((currentSegment, routeSegment, index) => {
        const targetSegmentName = currentSegment ? `${currentSegment}.${routeSegment}` : routeSegment;
        const targetIndex = index >= routePathSegments.length ? routePathSegments.length - 1 : index;

        checkInRouteRegistryOrCreateRoute(this.ROUTE_REGISTRY, {
          name: targetSegmentName,
          options: { path: `/${routePathSegments[targetIndex]}` },
          route: index === routeNameSegments.length - 1 ? routeDefinition.route : undefined,
        } as routerJSRouteDefinition);

        if (currentSegment && !this.ROUTE_REGISTRY[`${currentSegment}.index`]) {
          this.ROUTE_REGISTRY[`${currentSegment}.index`] = {
            name: `${currentSegment}.index`,
            options: { path: '/' },
            route: undefined, // TODO: add index route from parent by default
          };
        }

        return targetSegmentName;
      }, null);

      if (routeDefinition.indexRoute && routeName !== 'index') {
        this.ROUTE_REGISTRY[`${routeName}.index`] = {
          name: `${routeName}.index`,
          options: { path: '/' },
          route: routeDefinition.indexRoute,
        };
      }
    });

    // @ts-ignore
    if (!arrayOfRouteDefinitions.find((routeDefinition) => routeDefinition.path.startsWith('/*'))) {
      this.ROUTE_REGISTRY['not-found'] = {
        name: 'not-found',
        options: { path: '/*slug' },
        // @ts-ignore
        route: class NotFoundRoute extends Route {},
      };
    }

    return this.ROUTE_REGISTRY;
  }

  static convertToRouterJSRouteArray(routerRegistry: RouteRegistry): Array<routerJSRouteDefinition> {
    return Object.keys(routerRegistry)
      .sort()
      .reduce((result: Array<routerJSRouteDefinition>, routeName) => {
        let routeSegments = routeName.split('.');

        routeSegments.pop();

        if (routeSegments.length === 0) {
          return result.concat([
            { ...routerRegistry[routeName], nestedRoutes: [] } as routerJSRouteDefinition,
          ]);
        }

        let foundParentRoute = findNestedRoute(result, routeSegments);
        if (!foundParentRoute) {
          return result.concat([
            { ...routerRegistry[routeName], nestedRoutes: [] } as routerJSRouteDefinition,
          ]);
        }

        foundParentRoute.nestedRoutes.push({ ...routerRegistry[routeName], nestedRoutes: [] });

        return result;
      }, []);
  }

  static map(routerDefinition: () => {}): RouteRegistry {
    this.ROUTE_REGISTRY = {};
    RouteMapContext.ROUTE_REGISTRY = this.ROUTE_REGISTRY;

    routerDefinition.apply(RouteMapContext); // routerDefinition.apply(this); // TODO: this uses this.route

    return this.ROUTE_REGISTRY;
  }

  // NOTE: add to registry by demand
  // NOTE: add to actual router by demand
}

// export function createRouteNameFromRouteClass(routeClass: Route | void): string | void {
//   if (routeClass) {
//     // @ts-ignore
//     return routeClass.name
//       .replace(/Route$/g, '')
//       .split('')
//       .reduce((result: string[], character: string, index: number) => {
//         if (index === 0) {
//           return character.toLowerCase();
//         } else if (character.toUpperCase() === character) {
//           return `${result}.${character.toLowerCase()}`;
//         }

//         return `${result}${character}`;
//       }, '');
//   }
// }

// export function createRouteNameFromPath(routePath: string): string {
//   const targetPath = routePath[0] === '/' ? routePath.slice(1) : routePath;

//   return targetPath.replace(/\//g, '.').replace(/:/g, '');
// }

function checkInRouteRegistryOrCreateRoute(registry: RouteRegistry, targetRoute: routerJSRouteDefinition) {
  const routeName = targetRoute.name;
  const foundRoute = registry[routeName];

  if (!foundRoute) {
    registry[routeName] = targetRoute;

    return registry[routeName];
  }

  if (targetRoute.route) {
    if (foundRoute.route && foundRoute.name !== targetRoute.name) {
      console.log(
        `[WARNING]: ${routeName}.route already has ${foundRoute.name}. You tried to overwrite ${routeName}.route with ${targetRoute.name}`
      );
    }

    registry[routeName] = Object.assign(foundRoute, { route: targetRoute.route });
  }

  return registry[routeName];
}

function findNestedRoute(routerJSRouteArray: Array<routerJSRouteDefinition>, routeNameSegments: string[]) {
  return routeNameSegments.reduce((result, routeNameSegment, index) => {
    const target = result.nestedRoutes || routerJSRouteArray;
    const targetRouteName = index === 0 ? routeNameSegment : routeNameSegments.slice(0, index + 1).join('.');

    return target.find((routeObject: routerJSRouteDefinition) => routeObject.name === targetRouteName);
  }, {} as FreeObject);
}

// window.Router = Router;
