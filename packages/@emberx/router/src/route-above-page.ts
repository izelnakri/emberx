/**
 * Marks the args of a route instance the router makes for a route above the
 * page on screen, so the instance knows it is not the page. Its own module, as
 * route.ts and router-service.ts both need it and import each other already.
 */
export const ROUTE_ABOVE_PAGE = Symbol('emberx.route-above-page');
