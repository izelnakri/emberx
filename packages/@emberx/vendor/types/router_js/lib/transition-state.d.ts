declare module 'router_js/lib/transition-state' {
    import { Promise } from "rsvp";
    import type { Dict } from "router_js/lib/core";
    import type { Route } from "router_js/lib/route-info";
    import type InternalRouteInfo from "router_js/lib/route-info";
    import type Transition from "router_js/lib/transition";
    interface IParams {
        [key: string]: unknown;
    }
    export default class TransitionState<R extends Route> {
        routeInfos: InternalRouteInfo<R>[];
        queryParams: Dict<unknown>;
        params: IParams;
        promiseLabel(label: string): string;
        resolve(transition: Transition<R>): Promise<TransitionState<R>>;
    }
    export class TransitionError {
        error: Error;
        route: Route;
        wasAborted: boolean;
        state: TransitionState<any>;
        constructor(error: Error, route: Route, wasAborted: boolean, state: TransitionState<any>);
    }
    export {};
}