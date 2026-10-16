declare module '@glimmer/runtime/lib/helpers/gte' {
    /**
     * Performs a greater than or equal comparison.
     *
     * left >= right
     */
    export function gte<T>(left: T, right: T): boolean;
}