// NOTE: params could be manipulated if needed during routeWillChange and routeDidChange
// TODO: make this sticky params if needed
import type RouterService from './router-service.ts';
import { ROUTE_ABOVE_PAGE } from './route-above-page.ts';
import Router from './index.ts';
import Owner from './owner.ts';
import { buildQueryParams, type QueryParamDeclarations } from './query-params.ts';
import type { Body, Head } from './head.ts';
import EmberXComponent, { action, hbs, service, type PrecompiledTemplate } from '@emberx/component';
import { QUERY_PARAMS_SYMBOL } from 'router_js';

interface FreeObject {
  [propName: string]: any;
}

/**
 * The route-info fields router_js hands its hooks. `route` is the resolved
 * route class; `context` its resolved model.
 */
interface RouteInfo {
  name: string;
  params: FreeObject;
  route?: typeof Route;
  context?: unknown;
}

/**
 * The statics a route declares: template and includes, title, head and body,
 * queryParams, and the model hooks. Typed here rather than declared on Route,
 * so a route setting one needs no `override` under noImplicitOverride, Deno's
 * default; Route sets their defaults when it is defined.
 */
export interface RouteHooks {
  includes?: FreeObject;
  template?: string | PrecompiledTemplate;

  /**
   * The page's title, or a function of its model that returns it: the
   * deepest active route that has one names the page. The router puts it in
   * `document.title` after each transition, which a screen reader announces,
   * and @emberx/ssr's renderURL returns it for the document a server sends.
   *
   *   static title = (post) => `${post.title} | Blog`;
   */
  title?: string | ((model: any) => string);

  /**
   * What the page puts in `<head>`, or a function of the route's model, what
   * its model hook resolved to, that returns it: its `title` and
   * `description`, `meta`, `link` and `script` elements. Routes merge from the
   * application route down: a deeper route's element replaces one above it
   * with the same `<meta>` name, the canonical `<link>`, or the same script
   * `id` or `src`, so the application route has the app's defaults and a page
   * what is its own.
   *
   *   static head = (post) => ({
   *     description: post.summary,
   *     meta: [{ property: 'og:image', content: post.image }],
   *     link: [{ rel: 'canonical', href: `https://blog.example/posts/${post.id}` }],
   *   });
   *
   * The router applies it after each transition, changing only the elements
   * that changed, and @emberx/ssr's renderURL renders it for the server's
   * document. See ./head.ts for every field.
   */
  head?: Head | ((model: any) => Head);

  /**
   * Elements the page puts first or last in `<body>`, around it, or a
   * function of its model that returns them, merged as `head` is: an
   * analytics script, a `<noscript>` for one.
   *
   *   static body = { end: [{ tag: 'script', src: '/analytics.js', async: true }] };
   */
  body?: Body | ((model: any) => Body);

  /**
   * The query params this route reads, and how a change to each is handled.
   * See ./query-params.ts for the shape.
   */
  queryParams?: QueryParamDeclarations;

  /** What the page shows, from its params: a promise is waited for. `{}` by default. */
  model?(params: FreeObject, transition: any): unknown;
  /** Runs when the route becomes active. */
  activate?(): void;
  /** Runs when the route stops being active. */
  deactivate?(transition: any): void;
}

// TODO: maybe provide the associated routeInfo for router_js hacking and expose the Route itself on didTransition
// TODO: serialize() model hook might be needed to make default params and queryParams for the route links
export default class Route extends EmberXComponent<FreeObject> {
  static router: RouterService;

  @service router: RouterService;

  static {
    // Defaults rather than declarations: see RouteHooks.
    Object.assign(this, {
      includes: {},
      template: hbs`
        <div id="intro">
          <h1 data-test-route-title>Route: {{this.routeName}}. This route is missing a template!</h1>
          <h5>Route params: {{debug @params}}</h5>
          <h5>Route queryParams: {{debug @queryParams}}</h5>
        </div>
      `,
      queryParams: {},
      model: () => ({}),
      activate() {},
      deactivate() {},
    } satisfies RouteHooks);
  }

  /**
   * Runs the model hooks of this route, and of the active routes below it,
   * again and sets them up with the new models. The URL, the routes above and
   * the query params stay. For data that changed on the server, after a save
   * for example. Returns the transition.
   */
  static refresh() {
    // The running router, rather than this.router: that is set when a router
    // resolves this route, so for a route the running one never entered it is
    // an earlier router, or nothing.
    const router = Owner.lookup('service:router') as RouterService;
    if (!currentRouteInfos(router).some((routeInfo) => routeInfo.route === this)) {
      throw new Error(`@emberx/router Route: ${this.name} cannot refresh, it is not an active route!`);
    }

    return router.refresh(this as any);
  }

  /**
   * The model of `routeKey`: from the transition under way, whether it resolved
   * it or the route stays active, or, between transitions, from the active
   * routes, as Ember's does.
   */
  static modelFor(routeKey: string) {
    const transition = this.router.activeTransition;
    if (transition) {
      if (!(routeKey in transition.resolvedModels)) {
        throw new Error(`@emberx/router Route: ${routeKey} not found on current transition!`);
      }

      return transition.resolvedModels[routeKey];
    }

    const routeInfo = currentRouteInfos(this.router).find((routeInfo) => routeInfo.name === routeKey);
    if (!routeInfo) {
      throw new Error(`@emberx/router Route: ${routeKey} not found on current transition!`);
    }

    return routeInfo.context;
  }

  /** The dynamic-segment params of `routeName`, which must be active or part of the current transition. */
  static paramsFor(routeName: string): FreeObject {
    const routeInfo = currentRouteInfos(this.router).find((routeInfo) => routeInfo.name === routeName);
    if (!routeInfo) {
      throw new Error(`@emberx/router Route: ${routeName} is not part of the current transition!`);
    }

    return { ...routeInfo.params };
  }

  /** The dynamic-segment params of every route in the current transition, merged. */
  static getParams(): FreeObject {
    return Object.assign({}, ...currentRouteInfos(this.router).map((routeInfo) => routeInfo.params));
  }

  /** The query params of the current transition, cast, with the declared defaults filled in. */
  static getQueryParams(): FreeObject {
    const transition = this.router.activeTransition;
    if (transition) {
      return buildQueryParams(transition[QUERY_PARAMS_SYMBOL] ?? {}, transition.routeInfos);
    }

    return this.router.queryParamsWithDefaults;
  }

  /**
   * router_js calls `deserialize`, when a route has one, in place of `model`.
   * It is used to hand `model` its query params cast and with their declared
   * defaults, rather than the raw strings off the URL.
   */
  static deserialize(params: FreeObject, transition: any) {
    // The model a server rendered the page with, which the first transition takes instead.
    const resolving = transition.routeInfos.find((routeInfo: any) => !routeInfo.isResolved && routeInfo.route === this);
    const preloaded = resolving && this.router.takePreloadedModel(resolving.name);
    if (preloaded) {
      return preloaded.model;
    }

    const { queryParams, ...segmentParams } = params;

    return (this as RouteHooks).model!(
      { ...segmentParams, queryParams: buildQueryParams(queryParams ?? {}, transition.routeInfos) },
      transition,
    );
  }

  static enter() {
    (this as RouteHooks).activate!();
  }

  static exit(transition: any) {
    (this as RouteHooks).deactivate!(transition);
  }

  static async setup(model: object, transition: FreeObject): Promise<any> {
    if (Router.LOG_MODELS) {
      console.log(`'${transition.targetName}' Route[model] is`, model);
      console.log(`'${transition.targetName}' Route[transition] is`, transition);
    }

    const routeInfos: RouteInfo[] = transition.routeInfos;
    if (routeInfos[routeInfos.length - 1].route !== this) {
      return;
    }

    // No manual clearing: renderComponent replaces what it rendered before.
    // Clearing innerHTML behind its back removes nodes it still owns, and its
    // asynchronous teardown then fails to find them.
    const target = getRenderedRouteInfo(routeInfos);
    const router = this.router;

    await router.renderPage(classOf(target.route), {
      model: (target === routeInfos[routeInfos.length - 1] ? model : target.context) || {},
      params: Object.assign({}, ...routeInfos.map((routeInfo) => routeInfo.params)),
      // A getter, so a query-param change that keeps the route updates it in
      // place through the tracked router state.
      get queryParams() {
        return router.queryParamsWithDefaults;
      },
    });
  }

  constructor(owner: object, args: FreeObject) {
    super(owner, args);

    // The latest route rendered is the page on screen. The router also makes
    // instances of the routes above it, for actions sent their way.
    if (!(args as any)?.[ROUTE_ABOVE_PAGE]) {
      this.router.currentPage = this;
    }
  }

  /**
   * Sends an action to this page, then to the routes above it: router.send()
   * as an action, so a template can pass arguments with fn:
   * `{{on "click" (fn this.send "share" this.model)}}`. Async, so click() in
   * tests waits for an async action to finish.
   */
  @action
  async send(name: string, ...args: unknown[]): Promise<unknown> {
    return await this.router.send(name, ...args);
  }

  /** Route.refresh() for the route on screen, as an action: `{{on "click" this.refresh}}`. */
  @action
  async refresh(): Promise<void> {
    await (this.constructor as typeof Route).refresh();
  }

  get routeName(): string {
    return this.router.currentRouteName as string; // NOTE: there is also a this.router.routeName most likely
  }

  get model(): any {
    return this.args.model;
  }

  get params(): FreeObject {
    return this.args.params;
  }

  get queryParams(): FreeObject {
    return this.args.queryParams;
  }
}

/** The class of a route router_js resolved: the class itself, or the object a router with an owner of its own made of it. */
export function classOf(route: any): any {
  return route?.prototype?.constructor;
}

function currentRouteInfos(router: RouterService): RouteInfo[] {
  return (router.activeTransition?.routeInfos ?? router.state?.routeInfos ?? []) as RouteInfo[];
}

/**
 * The route whose template shows for `routeInfos`: the deepest one, unless it is
 * an index route nobody gave a class, in which case its parent renders. Without
 * this, visiting a parent route such as /posts rendered the placeholder route.
 */
function getRenderedRouteInfo(routeInfos: RouteInfo[]): RouteInfo {
  const leaf = routeInfos[routeInfos.length - 1];
  const parent = routeInfos[routeInfos.length - 2];
  const hasOwnClass = !!Owner.routes[leaf.name]?.route;

  return leaf.name.endsWith('.index') && !hasOwnClass && parent ? parent : leaf;
}
