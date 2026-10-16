declare module '@glimmer/reference/lib/iterable' {
    import type { Nullable } from "@glimmer/interfaces";
    import type { Reference, ReferenceEnvironment } from "@glimmer/reference/lib/reference";
    export interface IterationItem<T, U> {
        key: unknown;
        value: T;
        memo: U;
    }
    export interface AbstractIterator<T, U, V extends IterationItem<T, U>> {
        isEmpty(): boolean;
        next(): Nullable<V>;
    }
    export type OpaqueIterationItem = IterationItem<unknown, unknown>;
    export type OpaqueIterator = AbstractIterator<unknown, unknown, OpaqueIterationItem>;
    export interface IteratorDelegate {
        isEmpty(): boolean;
        next(): {
            value: unknown;
            memo: unknown;
        } | null;
    }
    export interface IteratorReferenceEnvironment extends ReferenceEnvironment {
        getPath(obj: unknown, path: string): unknown;
        toIterator(obj: unknown): Nullable<IteratorDelegate>;
    }
    type KeyFor = (item: unknown, index: unknown) => unknown;
    export function createIteratorRef(listRef: Reference, key: string): Reference<ArrayIterator | IteratorWrapper>;
    export function createIteratorItemRef(_value: unknown): Reference<unknown>;
    class IteratorWrapper implements OpaqueIterator {
        private inner;
        private keyFor;
        constructor(inner: IteratorDelegate, keyFor: KeyFor);
        isEmpty(): boolean;
        next(): OpaqueIterationItem | null;
    }
    class ArrayIterator implements OpaqueIterator {
        private iterator;
        private keyFor;
        private current;
        private pos;
        constructor(iterator: unknown[] | readonly unknown[], keyFor: KeyFor);
        isEmpty(): boolean;
        next(): Nullable<IterationItem<unknown, number>>;
    }
    export {};
}