declare module 'router_js/lib/core' {
    export type Present = object | void;
    export type Option<T> = T | null;
    export type Maybe<T> = Option<T> | undefined | void;
    export type Recast<T, U> = (T & U) | U;
    export interface Dict<T> {
        [key: string]: T;
    }
}