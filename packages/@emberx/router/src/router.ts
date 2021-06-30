export { hbs } from '@emberx/component';
import RouterService from './router-service';
import Route from './route';
import Owner, { RouteRegistry } from './owner';
import RouteMapContext from './route-map-context';
import DefaultResolver from './resolvers/default';

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

export interface routerJSRouteDefinition {
  path?: string;
  route: Route | undefined;
  options?: FreeObject;
  name: string;
  nestedRoutes?: [routerJSRouteDefinition?];
}

// NOTE: check Route.toReadOnlyRouteInfo
// NOTE: there is this.recognizer.add (when recognizer is an instance via new RouteRecognizer())
export default class Router {
  static Resolver = DefaultResolver;
  static LOG_ROUTES = true;
  static LOG_MODELS = true;

  static get owner() {
    return Owner;
  }

  static addServices(object: FreeObject): Owner {
    Object.keys(object).forEach((key) => {
      Owner.register(`service:${key}`, object[key]);
    });

    return Owner;
  }

  static visit(url: string) {
    // @ts-ignore
    try {
      debugger;
      let result = Owner.lookup('service:router').visit(url);
      return result;
    } catch (error) {
      // debuger;
    }
  }

  static start(arrayOfRouteDefinitions: Array<RouteDefinition> = [], routeMap: any = undefined): Router {
    Owner.clear('routes');

    let routeMapRegistry = routeMap ? this.map(routeMap) : Owner.routes; // NOTE: move this to super.map since it just mutates the module
    let ROUTE_REGISTRY = this.convertDefinitionsToRegistry(arrayOfRouteDefinitions);
    let routerJSRouteArray = this.convertToRouterJSRouteArray(
      Object.assign(routeMapRegistry, ROUTE_REGISTRY)
    );
    let routerService = Owner.register('service:router', new RouterService({ Resolver: this.Resolver }));
    routerService.map(function (match: any) {
      RouteMapContext.map(RouteMapContext.map, match, routerJSRouteArray);
    });

    return this;
  }

  static map(routerDefinition: () => {}): RouteRegistry {
    routerDefinition.apply(RouteMapContext); // TODO: this uses this.route

    return Owner.routes;
  }

  static reset() {
    Owner.clear('routes');
    Owner.clear('services');
    Owner.clear('components');
    Owner.clear('helpers');

    return this;
  }

  static convertDefinitionsToRegistry(arrayOfRouteDefinitions: Array<RouteDefinition> = []): RouteRegistry {
    arrayOfRouteDefinitions.forEach((routeDefinition: RouteDefinition) => {
      if (!routeDefinition.path) {
        throw new Error('One of the RouteDefinition on Router.start(RouteDefinition[]) misses "path" key');
      } else if (!routeDefinition.path.startsWith('/')) {
        throw new Error(`RouteDefinition paths must start with "/". Eg: { path: /${routeDefinition.path} }`);
      } else if (!routeDefinition.name) {
        throw new Error('One of the RouteDefinition on Router.start(RouteDefinition[]) misses "name" key');
      } else if (routeDefinition.name.endsWith('.index')) {
        let routeName = routeDefinition.name;
        let parentRouteName = routeName.slice(0, routeName.length - 6);

        throw new Error(
          `RouteDefinition{ name: ${routeName} } cannot end with ".index". Instead specify it as "indexRoute" of its parent route: ${parentRouteName}`
        );
      }

      let routeName = routeDefinition.name; // || createRouteNameFromRouteClass(routeDefinition.route); // || createRouteNameFromPath(routeDefinition.path as string); // NOTE: when /create-user type of paths are defined create a better routeName guess, should I replace order?
      let routeNameSegments = routeName.split('.') as string[]; // eg: 'public.posts.post.index'
      let routePathSegments = routeDefinition.path.slice(1).split('/') as string[]; // eg: ['posts', ':post_id']

      routeNameSegments.reduce((parentSegment, routeSegment, index) => {
        let targetSegmentName = parentSegment ? `${parentSegment}.${routeSegment}` : routeSegment;
        let targetRouteSegmentIndex = index < routePathSegments.length ? index : routePathSegments.length - 1;

        checkInRouteRegistryOrCreateRoute(Owner.routes, {
          name: targetSegmentName,
          options: { path: `/${routePathSegments[targetRouteSegmentIndex]}` },
          route: index === routeNameSegments.length - 1 ? routeDefinition.route : undefined,
        } as routerJSRouteDefinition);

        if (parentSegment && !Owner.routes[`${parentSegment}.index`]) {
          // NOTE: this lazily registers index routes, than actual definition has to be registered during mapping:
          Owner.routes[`${parentSegment}.index`] = {
            name: `${parentSegment}.index`,
            options: { path: '/' },
            route: undefined,
          };
        }

        return targetSegmentName;
      }, null);

      if (routeDefinition.indexRoute && routeName !== 'index') {
        Owner.routes[`${routeName}.index`] = {
          name: `${routeName}.index`,
          options: { path: '/' },
          route: routeDefinition.indexRoute,
        };
      }
    });

    // @ts-ignore
    if (!arrayOfRouteDefinitions.find((routeDefinition) => routeDefinition.path.startsWith('/*'))) {
      Owner.routes['not-found'] = {
        name: 'not-found',
        options: { path: '/*slug' },
        // @ts-ignore
        route: class NotFoundRoute extends Route {},
      };
    }

    return Owner.routes;
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

  // NOTE: add to registry by demand
  // NOTE: add to actual router by demand
}

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

// window.Router = Router;
