declare module 'router_js/lib/transition-aborted-error' {
    export interface TransitionAbortedError extends Error {
        name: "TransitionAborted";
        code: "TRANSITION_ABORTED";
    }
    export function buildTransitionAborted(): TransitionAbortedError;
    export function isTransitionAborted(maybeError: unknown): maybeError is TransitionAbortedError;
    interface Abortable<T extends boolean> {
        isAborted: T;
        [key: string]: unknown;
    }
    export function throwIfAborted(maybe: Abortable<true>): never;
    export function throwIfAborted(maybe: unknown): void;
    export {};
}