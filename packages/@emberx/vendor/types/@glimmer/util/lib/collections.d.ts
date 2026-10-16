declare module '@glimmer/util/lib/collections' {
    import type { Dict, Nullable, Stack } from "@glimmer/interfaces";
    export function dict<T = unknown>(): Dict<T>;
    export function isDict<T>(u: T): u is Dict & T;
    export function isIndexable<T>(u: T): u is object & T;
    export class StackImpl<T> implements Stack<T> {
        private stack;
        current: Nullable<T>;
        constructor(values?: T[]);
        get size(): number;
        push(item: T): void;
        pop(): Nullable<T>;
        nth(from: number): Nullable<T>;
        isEmpty(): boolean;
        snapshot(): T[];
        toArray(): T[];
    }
}