declare module 'router_js/lib/route-info' {
    import { Promise } from "rsvp";
    import type { Dict } from "router_js/lib/core";
    import type { SerializerFunc } from "router_js/lib/router";
    import type Router from "router_js/lib/router";
    import type { PublicTransition as Transition } from "router_js/lib/transition";
    import type InternalTransition from "router_js/lib/transition";
    export type IModel = {} & {
        id?: string | number;
    };
    export type ModelFor<T> = T extends Route<infer V> ? V : never;
    export interface Route<T = unknown> {
        inaccessibleByURL?: boolean;
        routeName: string;
        _internalName: string;
        context: T | undefined;
        events?: Dict<(...args: unknown[]) => unknown>;
        model?(params: Dict<unknown>, transition: Transition): PromiseLike<T> | undefined | T;
        deserialize?(params: Dict<unknown>, transition: Transition): T | PromiseLike<T> | undefined;
        serialize?(model: T | undefined, params: string[]): Dict<unknown> | undefined;
        beforeModel?(transition: Transition): PromiseLike<any> | any;
        afterModel?(resolvedModel: T | undefined, transition: Transition): PromiseLike<any> | any;
        setup?(context: T | undefined, transition: Transition): void;
        enter?(transition: Transition): void;
        exit?(transition?: Transition): void;
        _internalReset?(wasReset: boolean, transition?: Transition): void;
        contextDidChange?(): void;
        redirect?(context: T | undefined, transition: Transition): void;
        buildRouteInfoMetadata?(): unknown;
    }
    export interface RouteInfo {
        readonly name: string;
        readonly parent: RouteInfo | RouteInfoWithAttributes | null;
        readonly child: RouteInfo | RouteInfoWithAttributes | null;
        readonly localName: string;
        readonly params: Dict<unknown> | undefined;
        readonly paramNames: string[];
        readonly queryParams: Dict<unknown>;
        readonly metadata: unknown;
        find(predicate: (this: any, routeInfo: RouteInfo, i: number) => boolean, thisArg?: any): RouteInfo | undefined;
    }
    export interface RouteInfoWithAttributes extends RouteInfo {
        attributes: any;
    }
    export function toReadOnlyRouteInfo<R extends Route>(
        routeInfos: InternalRouteInfo<R>[],
        queryParams?: Dict<unknown>,
        options?: {
            includeAttributes?: boolean;
            localizeMapUpdates?: boolean;
        }
    ): RouteInfoWithAttributes[] | RouteInfo[];
    export default class InternalRouteInfo<R extends Route> {
        private _routePromise?;
        private _route?;
        protected router: Router<R>;
        paramNames: string[];
        name: string;
        params: Dict<unknown> | undefined;
        queryParams?: Dict<unknown>;
        context?: ModelFor<R> | PromiseLike<ModelFor<R>> | undefined;
        isResolved: boolean;
        constructor(router: Router<R>, name: string, paramNames: string[], route?: R);
        getModel(_transition: InternalTransition<R>): import("rsvp").default.Promise<ModelFor<R>>;
        serialize(_context?: ModelFor<R> | null): Dict<unknown> | undefined;
        resolve(transition: InternalTransition<R>): Promise<ResolvedRouteInfo<R>>;
        becomeResolved(transition: InternalTransition<R> | null, resolvedContext: ModelFor<R> | undefined): ResolvedRouteInfo<R>;
        shouldSupersede(routeInfo?: InternalRouteInfo<R>): boolean;
        get route(): R | undefined;
        set route(route: R | undefined);
        get routePromise(): Promise<R>;
        set routePromise(routePromise: Promise<R>);
        protected log(transition: InternalTransition<R>, message: string): void;
        private updateRoute;
        private runBeforeModelHook;
        private runAfterModelHook;
        private stashResolvedModel;
        private fetchRoute;
        private _processRoute;
    }
    export class ResolvedRouteInfo<R extends Route> extends InternalRouteInfo<R> {
        isResolved: boolean;
        context: ModelFor<R> | undefined;
        constructor(router: Router<R>, name: string, paramNames: string[], params: Dict<unknown> | undefined, route: R, context?: ModelFor<R>);
        resolve(transition: InternalTransition<R>): Promise<this>;
    }
    export class UnresolvedRouteInfoByParam<R extends Route> extends InternalRouteInfo<R> {
        params: Dict<unknown>;
        constructor(router: Router<R>, name: string, paramNames: string[], params: Dict<unknown> | undefined, route?: R);
        getModel(transition: InternalTransition<R>): Promise<ModelFor<R>>;
    }
    export class UnresolvedRouteInfoByObject<R extends Route> extends InternalRouteInfo<R> {
        serializer?: SerializerFunc<ModelFor<R>>;
        constructor(router: Router<R>, name: string, paramNames: string[], context: ModelFor<R> | PromiseLike<ModelFor<R>> | undefined);
        getModel(transition: InternalTransition<R>): import("rsvp").default.Promise<ModelFor<R>>;
        /**
          @private
      
          Serializes a route using its custom `serialize` method or
          by a default that looks up the expected property name from
          the dynamic segment.
      
          @param {Object} model the model to be serialized for this route
        */
        serialize(model?: ModelFor<R>): Dict<unknown> | undefined;
    }
}