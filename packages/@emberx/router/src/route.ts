// NOTE: params could be manipulated if needed during routeWillChange and routeDidChange
// TODO: make this sticky params if needed
import RouterService, { type GlobalWithQUnit } from './router-service.ts';
import { ROUTE_ABOVE_PAGE } from './route-above-page.ts';
import Router from './index.ts';
import Owner from './owner.ts';
import { buildQueryParams, type QueryParamDeclarations } from './query-params.ts';
import EmberXComponent, { action, renderComponent, service } from '@emberx/component';
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

// Bumped by every route render, so a route can tell whether it is still the one on screen.
let renderCount = 0;

// TODO: maybe provide the associated routeInfo for router_js hacking and expose the Route itself on didTransition
// TODO: serialize() model hook might be needed to make default params and queryParams for the route links
export default class Route extends EmberXComponent<FreeObject> {
  static router: RouterService;

  @service router: RouterService;

  static includes = {};
  static template = `
    <div id="intro">
      <h1 data-test-route-title>Route: {{this.routeName}}. This route is missing a template!</h1>
      <h5>Route params: {{debug @params}}</h5>
      <h5>Route queryParams: {{debug @queryParams}}</h5>
    </div>
  `;

  /**
   * The query params this route reads, and how a change to each is handled.
   * See ./query-params.ts for the shape.
   */
  static queryParams: QueryParamDeclarations = {};

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
    const { queryParams, ...segmentParams } = params;

    return this.model(
      { ...segmentParams, queryParams: buildQueryParams(queryParams ?? {}, transition.routeInfos) },
      transition,
    );
  }

  // NOTE: maybe move these to instance methods only?
  static activate() {}

  static enter() {
    this.activate();
  }

  static deactivate(_transition: any) {}

  static exit(transition: any) {
    this.deactivate(transition);
  }

  static model(_params?: FreeObject, _transition?: any): unknown {
    return {};
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

    const containerElement: HTMLElement | null = (globalThis as GlobalWithQUnit).QUnit
      ? document.getElementById('ember-testing')
      : document.getElementById('app');

    if (!containerElement) {
      throw new Error('#app or #ember-testing not found for the @emberx/router to boot/render the application!');
    }

    containerElement.innerHTML = ''; // TODO: temporary solution, clear previously rendered route

    const target = getRenderedRouteInfo(routeInfos);
    const router = this.router;
    const render = ++renderCount;
    let queryParams = router.queryParamsWithDefaults;

    await renderComponent(target.route as typeof Route, {
      element: containerElement as HTMLElement,
      args: {
        model: (target === routeInfos[routeInfos.length - 1] ? model : target.context) || {},
        params: Object.assign({}, ...routeInfos.map((routeInfo) => routeInfo.params)),
        // A getter, so a query-param change that keeps the route updates it in
        // place through the tracked router state. Only while it is on screen:
        // @glimmer/core never lets go of a replaced route's root and re-renders
        // it on every change (ROADMAP.md), and a list changing in its detached
        // DOM throws.
        get queryParams() {
          if (render === renderCount) {
            queryParams = router.queryParamsWithDefaults;
          }

          return queryParams;
        },
      },
      owner: Owner,
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
