// NOTE: params could be manipulated if needed during routeWillChange and routeDidChange
// TODO: make this sticky params if needed
import RouterService, { type GlobalWithQUnit } from './router-service';
import Router from './index';
import Owner from './owner';
import EmberXComponent, { renderComponent, service } from '@emberx/component';

interface FreeObject {
  [propName: string]: any;
}

/**
 * router_js does not call the `events` handlers as free functions: it looks them
 * up on the resolved route and `.apply()`s them with that route as the receiver
 * (see `RouterJSRouter#triggerEvent`). Since routes are resolved to the *class*,
 * the receiver is the static side, which is where `router` lives.
 */
interface RouteEventContext {
  router: RouterService;
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
 * Query-param values are genuinely dynamic: they arrive off the URL as strings,
 * or as arrays/nested objects of strings, and leave as whatever JS value the
 * string denoted — number, boolean, null, or the string itself.
 */
type QueryParamValue = any;

// class Args implements FreeObject {};

// TODO: maybe provide the associated routeInfo for router_js hacking and expose the Route itself on didTransition
// TODO: serialize() model hook might be needed to make default params and queryParams for the route links
// TODO: this must have .refresh() // NOTE: this has to be both on static and instance
// TODO: implement didTransition, error, loading, willTransition hooks // this has to be on the static? how will it interact with the instance
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

  /** The model of `routeKey` in the transition under way, whether it resolved it or the route stays active. */
  static modelFor(routeKey: string) {
    const transition = this.router.activeTransition;
    if (!transition || !transition.resolvedModels[routeKey]) {
      throw new Error(`@emberx/router Route: ${routeKey} not found on current transition!`);
    }

    return transition.resolvedModels[routeKey];
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

  static getQueryParams() {
    return {}; // TODO: build this up
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

    await renderComponent(target.route as typeof Route, {
      element: containerElement as HTMLElement,
      args: {
        model: (target === routeInfos[routeInfos.length - 1] ? model : target.context) || {},
        params: Object.assign({}, ...routeInfos.map((routeInfo) => routeInfo.params)),
        queryParams: this.getQueryParams(),
      },
      owner: Owner,
    });
  }

  static events = {
    finalizeQueryParamChange(this: RouteEventContext, queryParams: FreeObject, finalQueryParams: FreeObject[]): void {
      if (this.router.activeTransition) {
        this.router.queryParams = queryParams;
      }

      for (const key in queryParams) {
        const value = castCorrectValueFromString(queryParams[key]);
        if (value === null) {
          delete queryParams[key];
          // NOTE: `finalQueryParams` is router_js's array of `{ key, value }`
          // records and `key` is a query-param name, not an index, so this
          // delete does nothing. Kept verbatim; the cast only restates that.
          delete (finalQueryParams as FreeObject)[key];
          delete this.router.queryParams[key];
        } else {
          Object.assign(this.router.queryParams, { [key]: value });
          finalQueryParams.push({ key: key, value });
        }
      }
    },

    queryParamsDidChange(this: RouteEventContext, _changed: FreeObject, _all: FreeObject, _removed: FreeObject) {
      return this.router.refresh(); // NOTE: this might cause a history registry problem for some queryParam routes
    },
  };

  get routeName(): string {
    return this.router.currentRouteName as string; // NOTE: there is also a this.router.routeName most likely
  }

  get model(): any {
    return this.args.model;
  }

  get params(): FreeObject {
    return this.args.params;
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

function castCorrectValueFromString(value: QueryParamValue): QueryParamValue {
  if (Array.isArray(value)) {
    return value.map((element) => castCorrectValueFromString(element));
  } else if (Number(value) && parseInt(value, 10)) {
    return Number(value);
  } else if (value === 'false') {
    return false;
  } else if (value === 'true') {
    return true;
  } else if (['null', 'undefined'].includes(value)) {
    return null;
  }

  return nilifyStrings(value);
}

function nilifyStrings(value: QueryParamValue): QueryParamValue {
  if (value !== null && typeof value === 'object') {
    return Object.keys(value).reduce((object, key) => {
      return Object.assign(object, { [key]: nilifyStrings(value[key]) });
    }, {});
  } else if (value === '') {
    return null;
  }

  return value;
}
