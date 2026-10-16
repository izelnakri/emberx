declare module '@glimmer/runtime/lib/helpers/lt' {
    /**
     * Performs a less than comparison.
     *
     * left < right
     */
    export function lt<T>(left: T, right: T): boolean;
}