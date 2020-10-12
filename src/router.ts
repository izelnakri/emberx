import Router, { Route } from 'router_js';
import LocationBar from 'location-bar';
import DefaultRoute from './route';

interface FreeObject {
  [propName: string]: any;
}

interface RouteDefinition {}

interface RouteTemplate {}

interface createRouteDefinition {
  path: string;
  route: RouteDefinition;
  indexRoute: RouteDefinition;
  template: RouteTemplate;
  indexTemplate: RouteTemplate;
}

// NOTE: check Route.toReadOnlyRouteInfo
// NOTE: router.map() esentially calls this.recognizer.map(callback, fun(recognizer routes))
// NOTE: there is this.recognizer.add (when recognizer is an instance via new RouteRecognizer())
// NOTE: what is router-recognizer handler is exactly? model hook? one object with beforeModel, model?

// NOTE: all about receiving route definitions and generating the registry
// TODO: { path: '/' } resets the path, by default route($segment) is { path: /$segment }, also people can use '/:dynamic' or ':dynamic';
export default class EmberXRouter extends Router<Route> {
  static LOG_ROUTES = true;
  static LOG_MODELS = true;
  static ROUTE_REGISTRY = {};
  static SERVICES = {};

  static convertToRouterJSRouteArray(routerRegistry: FreeObject | void): Array<object> {
    const targetRegistry = routerRegistry || EmberXRouter.ROUTE_REGISTRY;

    return Object.keys(targetRegistry)
      .sort()
      .reduce((result, routeName) => {
        const routeSegments = routeName.split('.');

        routeSegments.pop();

        if (routeSegments.length === 0) {
          return result.concat([
            Object.assign({}, targetRegistry[routeName], { nestedRoutes: [] }),
          ]);
        }

        const foundParentRoute = findNestedRoute(result, routeSegments);

        if (!foundParentRoute) {
          return result.concat([
            Object.assign({}, targetRegistry[routeName], { nestedRoutes: [] }),
          ]);
        }

        foundParentRoute.nestedRoutes.push(
          Object.assign({}, targetRegistry[routeName], { nestedRoutes: [] })
        );

        return result;
      }, []);
  }

  static registryToRouterJSString() {
    return '';
  }

  runRegistryMap(runRegistryMap, match, routerJSRouteArray) {
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

  parentRoute: string | null;
  // _map(callback) {}

  // NOTE: maybe these below are redundant if I separate static/lazy stuff from router_js.Route methods below
  didTransition(something) {}
  willTransition() {}
  updateURL(url: string): void {}
  replaceURL(_url: string): void {}
  triggerEvent(handlerInfos: any, ignoreFailure: boolean, name: string, args: any[]) {}
  routeDidChange() {}
  routeWillChange() {}
  getSerializer(_name: string): any {
    return () => {};
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
  getRoute(name: string): any {
    if (this.constructor.LOG_ROUTES) {
      console.log(name);
    }

    debugger;

    return this.constructor.ROUTE_REGISTRY[name].route || DefaultRoute;
  }

  route(routeName: string, options, subRoute) {
    this.parentRoute = this.parentRoute ? `${this.parentRoute}.${routeName}` : routeName;

    const targetOptions =
      typeof options === 'object' && options !== null
        ? Object.assign(options, { path: options.path || getLastPath(this.parentRoute) })
        : { path: getLastPath(this.parentRoute) };
    const targetSubRoute = subRoute || returnOptionsAsSubRouteIfFunction(options);

    if (targetSubRoute) {
      targetSubRoute.apply(this);

      const existingIndexRoute = EmberXRouter.ROUTE_REGISTRY[`${this.parentRoute}.index`];

      EmberXRouter.ROUTE_REGISTRY[`${this.parentRoute}.index`] = existingIndexRoute || {
        routeName: `${this.parentRoute}.index`,
        options: { path: '/' },
        route: undefined,
        template: undefined,
      };
    }

    EmberXRouter.ROUTE_REGISTRY[this.parentRoute] = {
      routeName: this.parentRoute,
      options: targetOptions,
      route: undefined,
      template: undefined,
    };

    const segments = this.parentRoute.split('.');

    segments.length = segments.length - 1;

    this.parentRoute = segments.join('.');

    return EmberXRouter.ROUTE_REGISTRY;
  }

  mapToRegistry(callback) {}

  constructor() {
    super(...arguments);

    this.constructor.SERVICES.router = this;
    this.locationBar = new LocationBar();
    this.locationBar.start({ pushState: true });

    // this._map = this.map;

    this.mapToRegistry = (routerDefinition) => {
      routerDefinition.apply(this);

      console.log(this);

      return EmberXRouter.ROUTE_REGISTRY;
    };
  }
  updateURL(url) {
    this.locationBar.update(url);
    // window.location.pathname = url;
  }

  definitionsToRegistry(arrayOfRouteDefinitions = []) {
    arrayOfRouteDefinitions.forEach((routeElement) => {
      const routeName =
        routeElement.routeName ||
        createRouteNameFromRouteClass(routeElement.route) ||
        createRouteNameFromPath(routeElement.path); // NOTE: when /create-user type of paths are defined create a better routeName guess, should I replace order?
      const routeNameSegments = routeName.split('.');
      const routePathSegments = routeElement.path.slice(1).split('/');

      routeNameSegments.reduce((currentSegment, routeSegment, index) => {
        const targetSegmentName = currentSegment
          ? `${currentSegment}.${routeSegment}`
          : routeSegment;

        checkInRouteRegistryOrCreateRoute(EmberXRouter.ROUTE_REGISTRY, {
          routeName: targetSegmentName,
          options: { path: `/${routePathSegments[index]}` },
          route: index === routeNameSegments.length - 1 ? routeElement.route : undefined,
          template: index === routeNameSegments.length - 1 ? routeElement.template : undefined,
        });

        if (currentSegment && !EmberXRouter.ROUTE_REGISTRY[`${currentSegment}.index`]) {
          EmberXRouter.ROUTE_REGISTRY[`${currentSegment}.index`] = {
            routeName: `${currentSegment}.index`,
            options: { path: '/' },
            route: undefined,
            template: undefined,
          };
        }

        return targetSegmentName;
      }, undefined);

      if (routeElement.indexRoute) {
        EmberXRouter.ROUTE_REGISTRY[`${routeName}.index`] = {
          routeName: `${routeName}.index`,
          options: { path: '/' }, // NOTE: or should it be something else?
          route: routeElement.indexRoute,
          template: routeElement.indexTemplate,
        };
      }
    });

    return EmberXRouter.ROUTE_REGISTRY;
  }

  // add to registry by demand
  // add to actual router by demand

  start(arrayOfRouteDefinitions = [], routeMap = undefined) {
    // 4 different param entries: arrayOfRouteDefinitions, registryDef, routerJSRouteArray, routeMap
    // move it to 2: arrayOfRouteDefinitions, routeMap

    if (routeMap) {
      this.mapToRegistry(routeMap);
      // this.map(routeMap); // move this to super.map since it just mutates the module
    }

    const registry = this.definitionsToRegistry(arrayOfRouteDefinitions);
    const routerJSRouteArray = EmberXRouter.convertToRouterJSRouteArray(registry);

    const runRegistryMap = this.runRegistryMap;

    this.map(function (match) {
      runRegistryMap(runRegistryMap, match, routerJSRouteArray);
    });

    this.transitonToCurrentPath();

    return this;
  }

  transitonToCurrentPath() {
    debugger;
    const targetHandlers = this.recognizer.recognize(document.location.pathname);

    if (targetHandlers) {
      const targetHandler: FreeObject = targetHandlers[targetHandlers.length - 1];
      const params = Object.keys(targetHandler.params);

      if (params.length > 0) {
        // window.router.transitionTo(targetHandler.handler, targetHandler.params);
        // TODO: params is an object but it needs just the value it needs

        console.log(params);
        this.transitionTo.apply(
          this,
          [targetHandler.handler].concat(params.map((key) => targetHandler.params[key]))
        );
      } else {
        this.transitionTo(targetHandler.handler);
      }
    } else {
      console.log('NO ROUTE FOUND');
    }
  }
}

function returnOptionsAsSubRouteIfFunction(options) {
  return typeof options === 'function' ? options : undefined;
}

export function createRouteNameFromRouteClass(routeClass) {
  if (routeClass) {
    return routeClass.name
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

export function createRouteNameFromPath(routePath) {
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

  const valuesToUpdate: { route?: any; template?: any } = {};

  if (targetRoute.route) {
    if (foundRoute.route && foundRoute.route.name !== targetRoute.route.name) {
      console.log(
        `[WARNING]: ${routeName}.route already has ${foundRoute.route}. You tried to overwrite ${routeName}.route with ${targetRoute.route}`
      );
    }

    valuesToUpdate.route = targetRoute.route;
  }

  if (foundRoute.template) {
    if (foundRoute.template && foundRoute.template !== targetRoute.template) {
      console.log(
        `[WARNING]: ${routeName}.template already has a ${foundRoute.template}. You tried to assign to ${routeName}.template ${targetRoute.template}`
      );
    }

    valuesToUpdate.template = targetRoute.template;
  }

  if (Object.keys(valuesToUpdate).length) {
    registry[routeName] = Object.assign(foundRoute, valuesToUpdate);
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
