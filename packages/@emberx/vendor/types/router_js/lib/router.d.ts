declare module 'router_js/lib/router' {
    import type { MatchCallback } from "route-recognizer";
    import RouteRecognizer from "route-recognizer";
    import { Promise } from "rsvp";
    import type { Dict, Maybe, Option } from "router_js/lib/core";
    import type { ModelFor, Route, RouteInfo, RouteInfoWithAttributes } from "router_js/lib/route-info";
    import type InternalRouteInfo from "router_js/lib/route-info";
    import type { OpaqueTransition, PublicTransition as Transition } from "router_js/lib/transition";
    import InternalTransition from "router_js/lib/transition";
    import type { TransitionIntent } from "router_js/lib/transition-intent";
    import type { TransitionError } from "router_js/lib/transition-state";
    import TransitionState from "router_js/lib/transition-state";
    import type { ChangeList, ModelsAndQueryParams } from "router_js/lib/utils";
    export interface SerializerFunc<T> {
        (model: T, params: string[]): Dict<unknown>;
    }
    export interface ParsedHandler {
        handler: string;
        names: string[];
    }
    export default abstract class Router<R extends Route> {
        private _lastQueryParams;
        log?: (message: string) => void;
        state?: TransitionState<R>;
        oldState: Maybe<TransitionState<R>>;
        activeTransition?: InternalTransition<R>;
        currentRouteInfos?: InternalRouteInfo<R>[];
        _changedQueryParams?: Dict<unknown>;
        currentSequence: number;
        recognizer: RouteRecognizer;
        constructor(logger?: (message: string) => void);
        abstract getRoute(name: string): R | Promise<R>;
        abstract getSerializer(name: string): SerializerFunc<ModelFor<R>> | undefined;
        abstract updateURL(url: string): void;
        abstract replaceURL(url: string): void;
        abstract willTransition(oldRouteInfos: InternalRouteInfo<R>[], newRouteInfos: InternalRouteInfo<R>[], transition: Transition): void;
        abstract didTransition(routeInfos: InternalRouteInfo<R>[]): void;
        abstract triggerEvent(routeInfos: InternalRouteInfo<R>[], ignoreFailure: boolean, name: string, args: unknown[]): void;
        abstract routeWillChange(transition: Transition): void;
        abstract routeDidChange(transition: Transition): void;
        abstract transitionDidError(error: TransitionError, transition: Transition): Transition | Error;
        /**
          The main entry point into the router. The API is essentially
          the same as the `map` method in `route-recognizer`.
      
          This method extracts the String handler at the last `.to()`
          call and uses it as the name of the whole route.
      
          @param {Function} callback
        */
        map(callback: MatchCallback): void;
        hasRoute(route: string): boolean;
        queryParamsTransition(changelist: ChangeList, wasTransitioning: boolean, oldState: TransitionState<R>, newState: TransitionState<R>): OpaqueTransition;
        transitionByIntent(intent: TransitionIntent<R>, isIntermediate: boolean): InternalTransition<R>;
        recognize(url: string): Option<RouteInfo>;
        recognizeAndLoad(url: string): Promise<RouteInfoWithAttributes>;
        private generateNewState;
        private getTransitionByIntent;
        /**
        @private
      
        Begins and returns a Transition based on the provided
        arguments. Accepts arguments in the form of both URL
        transitions and named transitions.
      
        @param {Router} router
        @param {Array[Object]} args arguments passed to transitionTo,
          replaceWith, or handleURL
      */
        private doTransition;
        /**
        @private
      
        Updates the URL (if necessary) and calls `setupContexts`
        to update the router's array of `currentRouteInfos`.
       */
        private finalizeTransition;
        /**
        @private
      
        Takes an Array of `RouteInfo`s, figures out which ones are
        exiting, entering, or changing contexts, and calls the
        proper route hooks.
      
        For example, consider the following tree of routes. Each route is
        followed by the URL segment it handles.
      
        ```
        |~index ("/")
        | |~posts ("/posts")
        | | |-showPost ("/:id")
        | | |-newPost ("/new")
        | | |-editPost ("/edit")
        | |~about ("/about/:id")
        ```
      
        Consider the following transitions:
      
        1. A URL transition to `/posts/1`.
           1. Triggers the `*model` callbacks on the
              `index`, `posts`, and `showPost` routes
           2. Triggers the `enter` callback on the same
           3. Triggers the `setup` callback on the same
        2. A direct transition to `newPost`
           1. Triggers the `exit` callback on `showPost`
           2. Triggers the `enter` callback on `newPost`
           3. Triggers the `setup` callback on `newPost`
        3. A direct transition to `about` with a specified
           context object
           1. Triggers the `exit` callback on `newPost`
              and `posts`
           2. Triggers the `serialize` callback on `about`
           3. Triggers the `enter` callback on `about`
           4. Triggers the `setup` callback on `about`
      
        @param {Router} transition
        @param {TransitionState} newState
      */
        private setupContexts;
        /**
        @private
      
        Fires queryParamsDidChange event
      */
        private fireQueryParamDidChange;
        /**
        @private
      
        Helper method used by setupContexts. Handles errors or redirects
        that may happen in enter/setup.
      */
        private routeEnteredOrUpdated;
        /**
        @private
      
        This function is called when transitioning from one URL to
        another to determine which routes are no longer active,
        which routes are newly active, and which routes remain
        active but have their context changed.
      
        Take a list of old routes and new routes and partition
        them into four buckets:
      
        * unchanged: the route was active in both the old and
          new URL, and its context remains the same
        * updated context: the route was active in both the
          old and new URL, but its context changed. The route's
          `setup` method, if any, will be called with the new
          context.
        * exited: the route was active in the old URL, but is
          no longer active.
        * entered: the route was not active in the old URL, but
          is now active.
      
        The PartitionedRoutes structure has four fields:
      
        * `updatedContext`: a list of `RouteInfo` objects that
          represent routes that remain active but have a changed
          context
        * `entered`: a list of `RouteInfo` objects that represent
          routes that are newly active
        * `exited`: a list of `RouteInfo` objects that are no
          longer active.
        * `unchanged`: a list of `RouteInfo` objects that remain active.
      
        @param {Array[InternalRouteInfo]} oldRoutes a list of the route
          information for the previous URL (or `[]` if this is the
          first handled transition)
        @param {Array[InternalRouteInfo]} newRoutes a list of the route
          information for the new URL
      
        @return {Partition}
      */
        private partitionRoutes;
        private _updateURL;
        private finalizeQueryParamChange;
        private toReadOnlyInfos;
        private fromInfos;
        toInfos(newTransition: OpaqueTransition, newRouteInfos: InternalRouteInfo<R>[], includeAttributes?: boolean): void;
        private notifyExistingHandlers;
        /**
          Clears the current and target route routes and triggers exit
          on each of them starting at the leaf and traversing up through
          its ancestors.
        */
        reset(): void;
        /**
          let handler = routeInfo.handler;
          The entry point for handling a change to the URL (usually
          via the back and forward button).
      
          Returns an Array of handlers and the parameters associated
          with those parameters.
      
          @param {String} url a URL to process
      
          @return {Array} an Array of `[handler, parameter]` tuples
        */
        handleURL(url: string): InternalTransition<R>;
        /**
          Transition into the specified named route.
      
          If necessary, trigger the exit callback on any routes
          that are no longer represented by the target route.
      
          @param {String} name the name of the route
        */
        transitionTo(name: string | {
            queryParams: Dict<unknown>;
        }, ...contexts: any[]): InternalTransition<R>;
        intermediateTransitionTo(name: string, ...args: any[]): InternalTransition<R>;
        refresh(pivotRoute?: R): InternalTransition<R>;
        /**
          Identical to `transitionTo` except that the current URL will be replaced
          if possible.
      
          This method is intended primarily for use with `replaceState`.
      
          @param {String} name the name of the route
        */
        replaceWith(name: string): InternalTransition<R>;
        /**
          Take a named route and context objects and generate a
          URL.
      
          @param {String} name the name of the route to generate
            a URL for
          @param {...Object} objects a list of objects to serialize
      
          @return {String} a URL
        */
        generate(routeName: string, ...args: ModelsAndQueryParams<ModelFor<R>>): string;
        applyIntent(routeName: string, contexts: ModelFor<R>[]): TransitionState<R>;
        isActiveIntent(routeName: string, contexts: ModelFor<R>[], queryParams?: Dict<unknown> | null, _state?: TransitionState<R>): boolean;
        isActive(routeName: string, ...args: ModelsAndQueryParams<ModelFor<R>>): boolean;
        trigger(name: string, ...args: any[]): void;
    }
    export interface RoutePartition<R extends Route> {
        updatedContext: InternalRouteInfo<R>[];
        exited: InternalRouteInfo<R>[];
        entered: InternalRouteInfo<R>[];
        unchanged: InternalRouteInfo<R>[];
        reset: InternalRouteInfo<R>[];
    }
}