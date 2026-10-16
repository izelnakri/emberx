declare module 'router_js/lib/utils' {
    import type { QueryParams } from "route-recognizer";
    import type { Promise } from "rsvp";
    import type { Dict } from "router_js/lib/core";
    import type Router from "router_js/lib/router";
    export const slice: (start?: number, end?: number) => any[];
    /**
      Determines if an object is Promise by checking if it is "thenable".
    **/
    export function isPromise<T>(p: any): p is Promise<T>;
    export function merge(hash: Dict<unknown>, other?: Dict<unknown>): void;
    export type ModelsAndQueryParams<T> = T[] | [...T[], QueryParamsContainer];
    /**
      @private

      Extracts query params from the end of an array
    **/
    export function extractQueryParams<T>(array: ModelsAndQueryParams<T>): [T[], QueryParams | null];
    export type QueryParamsContainer = {
        queryParams: QueryParams;
    };
    /**
      @private

      Coerces query param properties and array elements into strings.
    **/
    export function coerceQueryParamsToString(queryParams: Dict<unknown>): void;
    /**
      @private
     */
    export function log(router: Router<any>, ...args: (string | number)[]): void;
    export function isParam(object: any): object is string | number;
    export function forEach<T>(array: T[], callback: (item: T) => boolean): void;
    export interface ChangeList {
        all: Dict<unknown>;
        changed: Dict<unknown>;
        removed: Dict<unknown>;
    }
    export function getChangelist(oldObject: Dict<unknown>, newObject: Dict<unknown>): ChangeList | undefined;
    export function promiseLabel(label: string): string;
}