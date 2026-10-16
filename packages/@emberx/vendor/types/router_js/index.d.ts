declare module 'router_js' {
    export { default } from "router_js/lib/router";
    export { default as InternalTransition, logAbort, STATE_SYMBOL, PARAMS_SYMBOL, QUERY_PARAMS_SYMBOL, } from "router_js/lib/transition";
    export type { PublicTransition as Transition } from "router_js/lib/transition";
    export { default as TransitionState, TransitionError } from "router_js/lib/transition-state";
    export { default as InternalRouteInfo, type Route, type RouteInfo, type RouteInfoWithAttributes, type ModelFor, } from "router_js/lib/route-info";
}