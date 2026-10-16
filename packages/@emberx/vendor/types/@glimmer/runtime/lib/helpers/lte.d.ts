declare module '@glimmer/runtime/lib/helpers/lte' {
    /**
     * Performs a less than or equal comparison.
     *
     * left <= right
     */
    export function lte<T>(left: T, right: T): boolean;
}