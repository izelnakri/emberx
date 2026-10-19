/**
 * Marks the args of a route instance the router makes for a route above the
 * page on screen, so the instance knows it is not the page. Its own module, as
 * route.ts and router-service.ts both need it and import each other already.
 *
 * A registered symbol, as @emberx/vendor's @glimmer/component reads it too:
 * with EMBERX_DEBUG on, it lets these args, made outside a render, pass for
 * the ones Glimmer makes.
 */
export const ROUTE_ABOVE_PAGE = Symbol.for('emberx.route-above-page');
