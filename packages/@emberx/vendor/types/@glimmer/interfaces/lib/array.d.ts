declare module '@glimmer/interfaces/lib/array' {
    import type { Optional } from "@glimmer/interfaces/lib/core.js";

    export type PresentArray<T> = [T, ...T[]];
    export type OptionalArray<T> = Optional<PresentArray<T>>;
}