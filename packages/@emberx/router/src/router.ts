export { hbs } from '@emberx/component';
import RouterService from './router-service.ts';
import Route from './route.ts';
import NotFoundRoute from './not-found-route.ts';
import Owner, { type RouteRegistry } from './owner.ts';
import RouteMapContext from './route-map-context.ts';
import DefaultResolver from './resolvers/default.ts';
import { isSubstateName, getSubstatePath } from './substates.ts';

/** The name of the route above every route. */
const APPLICATION = 'application';
/** The id of the element a server leaves the page's models in: see StartOptions.shoebox. */
const SHOEBOX = 'shoebox';

export interface FreeObject {
  [propName: string]: any;
}

/**
 * A route's module, loaded when a transition first enters the route, so that a
 * bundler gives it a chunk of its own: `() => import('./routes/post.ts')`.
 */
export type RouteLoader = () => Promise<typeof Route | { default: typeof Route }>;

export interface RouteDefinition {
  path?: string;
  /** The route's class, or a RouteLoader that imports it. */
  route: typeof Route | RouteLoader | undefined;
  /** What LinkTo, transitionTo and modelFor call the route. Without one, it comes from the path: see routeNameFromPath. */
  name?: string;
  options?: FreeObject;
  /** What the route's own URL shows, when it has routes under it and should not show `route`. */
  indexRoute?: typeof Route | RouteLoader;
  /**
   * Shown while this route, or a route under it without a loadingRoute of its
   * own, is loading. Ember's `<name>_loading` substate.
   */
  loadingRoute?: typeof Route | RouteLoader;
  /**
   * Shown when this route, or a route under it without an errorRoute of its
   * own, fails, with the error as its model. Ember's `<name>_error` substate.
   */
  errorRoute?: typeof Route | RouteLoader;
}

/**
 * A route class, a module whose default export is one, or a RouteLoader that
 * imports it, as `import.meta.glob` returns them, eager or not.
 */
export type ResolvedRoute = typeof Route | { default: typeof Route } | RouteLoader | null | undefined;

export interface StartOptions {
  /**
   * Finds a route by name, the way Ember finds `app/routes/posts/loading.js`:
   * called for every route declared without a class (a Router.map() route, an
   * index route) and for the loading and error substates of every route, by
   * Ember's names (`posts_loading`, `posts.loading`, top-level `loading`). An
   * explicit declaration always wins over what it returns.
   */
  resolve?: (name: string) => ResolvedRoute;
  /**
   * Where the URL lives: `history`, the address bar (the default in a
   * browser), or `none`, only in the router, for rendering on a server (the
   * default without a `window`).
   */
  location?: 'history' | 'none';
  /**
   * The element the pages render into, or a selector for it: `#app` by
   * default. With `location: 'none'`, an emberx app lives in one element of
   * a page another framework's app owns, and leaves its URL alone.
   */
  rootElement?: Element | string;
  /**
   * The models a server rendered the page with, by route name, as
   * @emberx/ssr's renderURL returns them: the first transition's routes take
   * these instead of running their model hooks, so the browser does not fetch
   * again what the page it hydrates already shows. Their other hooks run.
   * Without them, they are read from the shoebox.
   */
  models?: Record<string, unknown>;
  /**
   * The id of the `<script type="application/json">` element a server left
   * the models in: `shoebox` by default. Router.start() reads it, when the
   * document has one and no `models` are given, and removes it.
   */
  shoebox?: string;
}

export interface InstanceOptions {
  /**
   * Services of this instance's own, beside the ones Router.addServices()
   * registered for every router, which they replace where they share a name:
   * a request's cookies and headers on a server, for example.
   */
  services?: FreeObject;
  /** Where the URL lives: `none`, only in the router, by default. */
  location?: 'history' | 'none';
}

export interface routerJSRouteDefinition {
  path?: string;
  route: typeof Route | RouteLoader | undefined;
  options?: FreeObject;
  name: string;
  nestedRoutes?: [routerJSRouteDefinition?];
}

// NOTE: check Route.toReadOnlyRouteInfo
// NOTE: there is this.recognizer.add (when recognizer is an instance via new RouteRecognizer())
export default class Router {
  static Resolver = DefaultResolver;
  /** Whether the router logs each route it looks up: off by default, on to debug a transition. */
  static LOG_ROUTES = false;
  /** Whether the router logs each model and transition its routes set up: off by default, as LOG_ROUTES. */
  static LOG_MODELS = false;
  /**
   * Whether the routers started from now on run under test, as `Ember.testing`
   * says for Ember: @emberx/test-helpers' setupTest() turns it on for each test.
   * Such a router renders into `#ember-testing` instead of `#app`, and keeps
   * its URL off the address bar.
   */
  static testing = false;

  /** The routes Router.start() declared, as router_js maps them: each router it or createInstance() makes maps them. */
  static #routerJSRoutes: Array<routerJSRouteDefinition> = [];

  static get owner(): typeof Owner {
    return Owner;
  }

  static addServices(object: FreeObject): Owner {
    Object.keys(object).forEach((key) => {
      Owner.register(`service:${key}`, object[key]);
    });

    return Owner;
  }

  static visit(url: string): Promise<void> {
    const routerService = Owner.lookup('service:router');
    if (!routerService) {
      throw new Error('Router.visit() was called before Router.start().');
    }

    return routerService.visit(url);
  }

  static start(
    arrayOfRouteDefinitions: Array<RouteDefinition> = [],
    routeMapOrOptions?: (() => void) | StartOptions,
    startOptions: StartOptions = {},
  ): typeof Router {
    const routeMap = typeof routeMapOrOptions === 'function' ? routeMapOrOptions : undefined;
    const options = typeof routeMapOrOptions === 'object' ? routeMapOrOptions : startOptions;
    const { resolve, location, rootElement, models = readShoebox(options.shoebox ?? SHOEBOX) } = options;
    stopPreviousRouter();
    Owner.clear('routes');

    const routeMapRegistry = routeMap ? this.map(routeMap) : Owner.routes; // NOTE: move this to super.map since it just mutates the module
    const ROUTE_REGISTRY = this.convertDefinitionsToRegistry(arrayOfRouteDefinitions);
    Object.assign(routeMapRegistry, ROUTE_REGISTRY);
    if (resolve) {
      resolveByConvention(resolve);
    }
    this.#routerJSRoutes = this.convertToRouterJSRouteArray(Owner.routes);
    Owner.register(
      'service:router',
      mapRoutes(
        new RouterService({ Resolver: this.Resolver, location, rootElement, models, testing: this.testing }),
        this.#routerJSRoutes,
      ),
    );

    return this;
  }

  /**
   * A router of its own for the routes Router.start() declared, with an owner
   * of its own: its pages, the routes' static hooks and LinkTo find it and
   * `services` as their services, where the router Router.start() started
   * finds those Router.addServices() registered. What FastBoot's application
   * instance per request is to Ember: @emberx/ssr renders each URL with one,
   * so a server renders several at once.
   *
   *   const router = Router.createInstance({ services: { request } });
   *   await router.visit('/posts/1');
   */
  static createInstance({ services = {}, location = 'none' }: InstanceOptions = {}): RouterService {
    if (!Owner.lookup('service:router')) {
      throw new Error('Router.createInstance() was called before Router.start().');
    }

    const owner = Object.create(Owner);
    const router = new RouterService({ Resolver: this.Resolver, location, testing: this.testing, owner });
    owner.services = { ...Owner.services, ...services, router };

    return mapRoutes(router, this.#routerJSRoutes);
  }

  static map(routerDefinition: () => void): RouteRegistry {
    routerDefinition.apply(RouteMapContext); // TODO: this uses this.route

    return Owner.routes;
  }

  static reset(): typeof Router {
    stopPreviousRouter();
    Owner.clear('routes');
    Owner.clear('services');
    Owner.clear('components');
    Owner.clear('helpers');

    return this;
  }

  static convertDefinitionsToRegistry(arrayOfRouteDefinitions: Array<RouteDefinition> = []): RouteRegistry {
    const substateDefinitions: Array<RouteDefinition> = [];
    // What each declaration so far claimed, to report a route declared twice.
    const pathsByName = new Map<string, string>();
    const namesByPath = new Map<string, string>();

    arrayOfRouteDefinitions.forEach((definition: RouteDefinition) => {
      const routeDefinition =
        definition.name || !definition.path ? definition : { ...definition, name: routeNameFromPath(definition.path) };

      if (routeDefinition.name === APPLICATION) {
        substateDefinitions.push(...registerApplication(routeDefinition));
        return;
      } else if (!routeDefinition.path && routeDefinition.name && isSubstateName(routeDefinition.name)) {
        // Registered once every route they could hang off is: see registerSubstate.
        substateDefinitions.push(routeDefinition);
        return;
      } else if (!routeDefinition.path) {
        throw new Error('One of the RouteDefinition on Router.start(RouteDefinition[]) misses "path" key');
      } else if (!routeDefinition.path.startsWith('/')) {
        throw new Error(`RouteDefinition paths must start with "/". Eg: { path: /${routeDefinition.path} }`);
      } else if ((routeDefinition.name as string).endsWith('.index')) {
        const routeName = routeDefinition.name as string;
        const parentRouteName = routeName.slice(0, routeName.length - 6);

        throw new Error(
          `RouteDefinition{ name: ${routeName} } cannot end with ".index". Instead specify it as "indexRoute" of its parent route: ${parentRouteName}`,
        );
      }

      const routeName = routeDefinition.name as string;
      reportDeclaredTwice(routeName, routeDefinition.path, pathsByName, namesByPath);
      const routeNameSegments = routeName.split('.') as string[]; // eg: 'public.posts.post.index'
      const routePathSegments = routeDefinition.path.slice(1).split('/') as string[]; // eg: ['posts', ':post_id']

      routeNameSegments.reduce((parentSegment, routeSegment, index) => {
        const targetSegmentName = parentSegment ? `${parentSegment}.${routeSegment}` : routeSegment;
        const targetRouteSegmentIndex = index < routePathSegments.length ? index : routePathSegments.length - 1;

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

      if (routeDefinition.loadingRoute) {
        substateDefinitions.push({ name: `${routeName}_loading`, route: routeDefinition.loadingRoute });
      }
      if (routeDefinition.errorRoute) {
        substateDefinitions.push({ name: `${routeName}_error`, route: routeDefinition.errorRoute });
      }
    });

    substateDefinitions.forEach(registerSubstate);

    if (!arrayOfRouteDefinitions.find((routeDefinition) => routeDefinition.path?.startsWith('/*'))) {
      Owner.routes['not-found'] = {
        name: 'not-found',
        options: { path: '/*slug' },
        route: NotFoundRoute,
      };
    }

    return Owner.routes;
  }

  static convertToRouterJSRouteArray(routerRegistry: RouteRegistry): Array<routerJSRouteDefinition> {
    return Object.keys(routerRegistry)
      .filter((routeName) => routeName !== APPLICATION) // the root the others are mapped under
      .sort()
      .reduce((result: Array<routerJSRouteDefinition>, routeName) => {
        const routeSegments = routeName.split('.');

        routeSegments.pop();

        if (routeSegments.length === 0) {
          return result.concat([{ ...routerRegistry[routeName], nestedRoutes: [] } as routerJSRouteDefinition]);
        }

        const foundParentRoute = findNestedRoute(result, routeSegments);
        if (!foundParentRoute) {
          return result.concat([{ ...routerRegistry[routeName], nestedRoutes: [] } as routerJSRouteDefinition]);
        }

        foundParentRoute.nestedRoutes.push({ ...routerRegistry[routeName], nestedRoutes: [] });

        return result;
      }, []);
  }

  // NOTE: add to registry by demand
  // NOTE: add to actual router by demand
}

/**
 * The name a route gets from its path when its definition has none: each path
 * segment is a name segment, and the routes of the leading segments are its
 * parents.
 *
 *   /                          index
 *   /posts                     posts
 *   /posts/:post_id            posts.post       a dynamic segment loses its _id or Id
 *   /posts/:post_id/comments   posts.post.comments
 *   /:slug                     slug
 *   /*path                     not-found        a catch-all
 */
export function routeNameFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) {
    return 'index';
  }

  return segments
    .map((segment) => {
      if (segment.startsWith('*')) {
        return 'not-found';
      } else if (segment.startsWith(':')) {
        return segment.slice(1).replace(/(?<=.)(_id|Id)$/, '');
      }

      return segment;
    })
    .join('.');
}

/**
 * Maps `routes` on `router`. Every route is under the application route, as in
 * Ember: it has no URL of its own, and the names of the routes under it are not
 * prefixed with it.
 */
function mapRoutes(router: RouterService, routes: Array<routerJSRouteDefinition>): RouterService {
  router.map(function (match: any) {
    match('/').to(APPLICATION, function (match: any) {
      RouteMapContext.map(RouteMapContext.map, match, routes);
    });
  });

  return router;
}

/** The models a server left in the element with the id `id`, which is then removed: see StartOptions.shoebox. */
function readShoebox(id: string): Record<string, unknown> | undefined {
  const element = typeof document === 'undefined' ? null : document.getElementById(id);
  if (!element) return;

  element.remove();
  return JSON.parse(element.textContent as string);
}

/**
 * A router that is replaced, by starting another or resetting, must stop
 * following the browser's history, or back and forward would drive both.
 */
function stopPreviousRouter() {
  (Owner.lookup('service:router') as RouterService | undefined)?.stopListening();
}

function checkInRouteRegistryOrCreateRoute(registry: RouteRegistry, targetRoute: routerJSRouteDefinition) {
  const routeName = targetRoute.name;
  const foundRoute = registry[routeName];

  if (!foundRoute) {
    registry[routeName] = targetRoute;
  } else if (targetRoute.route) {
    foundRoute.route = targetRoute.route;
  }

  return registry[routeName];
}

/**
 * Reports a route declared twice: one name twice, or one path under two names.
 * Not an exception, so the app still starts; the later declaration replaces the
 * earlier one.
 */
function reportDeclaredTwice(
  name: string,
  path: string | undefined,
  pathsByName: Map<string, string>,
  namesByPath: Map<string, string>,
) {
  const fullPath = path && path !== '/' ? path.replace(/\/+$/, '') : path;

  if (pathsByName.has(name)) {
    const where =
      pathsByName.get(name) === fullPath ? `at "${fullPath}"` : `at "${pathsByName.get(name)}" and at "${fullPath}"`;

    reportDeclarationError(
      `The route "${name}" is declared twice, ${where}. The later declaration replaces the earlier one.`,
    );
  } else if (fullPath && namesByPath.has(fullPath)) {
    reportDeclarationError(
      `"${fullPath}" is the path of both "${namesByPath.get(fullPath)}" and "${name}", so only one of them can be visited. Give each route its own path.`,
    );
  }

  pathsByName.set(name, fullPath as string);
  if (fullPath) {
    namesByPath.set(fullPath, name);
  }
}

function reportDeclarationError(message: string) {
  console.error(`@emberx/router: ${message}`);
}

/**
 * The application route is declared without a path: it is above every route, at
 * `/`. Its loadingRoute and errorRoute are the app-wide `loading` and `error`
 * substates, the ones a route falls back to when nothing closer is declared.
 */
function registerApplication({ path, route, indexRoute, loadingRoute, errorRoute }: RouteDefinition) {
  if (path && path !== '/') {
    throw new Error(`The application route is above every route and has no path of its own; remove path: '${path}'.`);
  } else if (indexRoute) {
    throw new Error(`The application route takes no indexRoute; declare the page at "/" as a route of its own.`);
  } else if (Owner.routes[APPLICATION]) {
    reportDeclarationError('The application route is declared twice. The later declaration replaces the earlier one.');
  }

  Owner.routes[APPLICATION] = { name: APPLICATION, options: { path: '/' }, route };

  return [
    ...(loadingRoute ? [{ name: 'loading', route: loadingRoute }] : []),
    ...(errorRoute ? [{ name: 'error', route: errorRoute }] : []),
  ] as RouteDefinition[];
}

/**
 * A loading or error substate is declared without a path (see ./substates.ts):
 * it hangs off the route its name puts it under, which therefore gains an index
 * route, and it is marked so that only declared substates are ever entered as one.
 */
function registerSubstate({ name: substateName, route }: RouteDefinition) {
  const name = substateName as string;
  const parentName = name.split('.').slice(0, -1).join('.');
  if (parentName && !Owner.routes[parentName]) {
    throw new Error(`The "${name}" substate needs its parent route "${parentName}" to be defined too.`);
  }

  // A Router.map() definition declares substates without a class, for Router.start() to give one.
  if (Owner.routes[name]?.options?.substate && Owner.routes[name].route) {
    reportDeclarationError(
      `The "${name}" substate is declared twice, by its name or by a loadingRoute or errorRoute. The later declaration replaces the earlier one.`,
    );
  }

  Owner.routes[name] = { name, options: { path: getSubstatePath(name), substate: true }, route };

  if (parentName && !Owner.routes[`${parentName}.index`]) {
    Owner.routes[`${parentName}.index`] = { name: `${parentName}.index`, options: { path: '/' }, route: undefined };
  }
}

/**
 * Gives every route declared without a class the one `resolve` finds for its
 * name, then registers each loading and error substate it finds, as Ember does
 * for the templates and routes it finds by file name. A leaf route only gets
 * `<name>_loading`: a `<name>.loading` child would give it an index route, and
 * so change its URLs.
 */
function resolveByConvention(resolve: (name: string) => ResolvedRoute) {
  const find = (name: string) => {
    const resolved = resolve(name);
    return typeof resolved === 'function' ? resolved : resolved?.default;
  };
  const names = Object.keys(Owner.routes).filter((name) => name !== 'not-found');

  for (const name of names) {
    if (!Owner.routes[name].route) {
      Owner.routes[name].route = find(name);
    }
  }
  if (Owner.routes['not-found']?.route === NotFoundRoute) {
    Owner.routes['not-found'].route = find('not-found') ?? NotFoundRoute;
  }
  if (!Owner.routes[APPLICATION]?.route) {
    const route = find(APPLICATION);
    if (route) Owner.routes[APPLICATION] = { name: APPLICATION, options: { path: '/' }, route };
  }

  const routeNames = names.filter((name) => !Owner.routes[name].options?.substate);
  for (const substate of ['loading', 'error']) {
    const candidates = [
      substate,
      ...routeNames.flatMap((name) => {
        const hasChildren = routeNames.some((other) => other.startsWith(`${name}.`));
        return hasChildren ? [`${name}_${substate}`, `${name}.${substate}`] : [`${name}_${substate}`];
      }),
    ];

    for (const candidate of candidates) {
      if (Owner.routes[candidate]?.route) continue;
      const route = find(candidate);
      if (route) registerSubstate({ name: candidate, route });
    }
  }
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
