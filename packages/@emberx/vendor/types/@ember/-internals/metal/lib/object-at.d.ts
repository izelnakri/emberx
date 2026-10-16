declare module '@ember/-internals/metal/lib/object-at' {
    import type EmberArray from "@ember/array";
    export function objectAt<T>(array: T[] | EmberArray<T>, index: number): T | undefined;
}