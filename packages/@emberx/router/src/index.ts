import Route from './route.ts';
import NotFoundRoute from './not-found-route.ts';
import Router from './router.ts';
import LinkTo from './link-to.ts';
import Owner from './owner.ts';
import RouterService from './router-service.ts';

import { hbs, service, action, on, tracked } from '@emberx/component';

export default Router;
export { Route, NotFoundRoute, LinkTo, Owner, RouterService, hbs, service, action, on, tracked };
export type { QueryParamConfig } from './query-params.ts';
export type { RouteHooks } from './route.ts';
export type { RouteDefinition, RouteLoader, StartOptions, ResolvedRoute, InstanceOptions } from './router.ts';
export type { Head, Body, HeadAttributes, HeadScript, BodyElement, HeadElement } from './head.ts';
