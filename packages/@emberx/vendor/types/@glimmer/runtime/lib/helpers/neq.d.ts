declare module '@glimmer/runtime/lib/helpers/neq' {
    /**
     * Performs a strict inequality comparison.
     *
     * left !== right
     */
    export function neq(left: unknown, right: unknown): boolean;
}