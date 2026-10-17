declare module '@glimmer/validator/lib/collections/weak-set' {
    /**
     * NOTE: we cannot pass a WeakSet because WeakSets are not iterable
     */
    /**
     * Creates an instanceof WeakSet from an optional list of entries
     *
     */
    export function trackedWeakSet<Value extends WeakKey>(
     data?: Value[],
     options?: {
         equals?: (a: Value, b: Value) => boolean;
         description?: string;
     }
    ): WeakSet<Value>;
}