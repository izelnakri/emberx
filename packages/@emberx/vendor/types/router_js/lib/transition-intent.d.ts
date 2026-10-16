declare module 'router_js/lib/transition-intent' {
    import type { Route } from "router_js/lib/route-info";
    import type Router from "router_js/lib/router";
    import type TransitionState from "router_js/lib/transition-state";
    export type OpaqueIntent = TransitionIntent<any>;
    export abstract class TransitionIntent<R extends Route> {
        data: object;
        router: Router<R>;
        constructor(router: Router<R>, data?: object);
        preTransitionState?: TransitionState<R>;
        abstract applyToState(oldState: TransitionState<R>, isIntermediate: boolean): TransitionState<R>;
    }
}