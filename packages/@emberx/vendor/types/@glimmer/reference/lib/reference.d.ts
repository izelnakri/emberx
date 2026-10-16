declare module '@glimmer/reference/lib/reference' {
    import type { Nullable, Reference, ReferenceSymbol } from "@glimmer/interfaces";
    export const REFERENCE: ReferenceSymbol;
    export type { Reference as default };
    export type { Reference };
    export interface ReferenceEnvironment {
        getProp(obj: unknown, path: string): unknown;
        setProp(obj: unknown, path: string, value: unknown): unknown;
    }
    export function createPrimitiveRef<T extends string | symbol | number | boolean | null | undefined>(value: T): Reference<T>;
    export const UNDEFINED_REFERENCE: Reference<undefined>;
    export const NULL_REFERENCE: Reference<null>;
    export const TRUE_REFERENCE: Reference<true>;
    export const FALSE_REFERENCE: Reference<false>;
    export function createConstRef<T>(value: T, debugLabel: false | string): Reference<T>;
    export function createUnboundRef<T>(value: T, debugLabel: false | string): Reference<T>;
    export function createComputeRef<T = unknown>(
        compute: () => T,
        update?: Nullable<(value: T) => void>,
        debugLabel?: false | string
    ): Reference<T>;
    export function createReadOnlyRef(ref: Reference): Reference;
    export function isInvokableRef(ref: Reference): boolean;
    export function createInvokableRef(inner: Reference): Reference;
    export function isConstRef(_ref: Reference): boolean;
    export function isUpdatableRef(_ref: Reference): boolean;
    export function valueForRef<T>(_ref: Reference<T>): T;
    export function updateRef(_ref: Reference, value: unknown): void;
    export function childRefFor(_parentRef: Reference, path: string): Reference;
    export function childRefFromParts(root: Reference, parts: string[]): Reference;
    export let createDebugAliasRef: undefined | ((debugLabel: string, inner: Reference) => Reference);
}