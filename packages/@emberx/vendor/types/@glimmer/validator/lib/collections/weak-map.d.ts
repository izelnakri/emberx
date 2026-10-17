declare module '@glimmer/validator/lib/collections/weak-map' {
    export function trackedWeakMap<Key extends WeakKey, Value = unknown>(
        data?: WeakMap<Key, Value> | [Key, Value][] | Iterable<readonly [Key, Value]> | null,
        options?: {
            equals?: (a: Value, b: Value) => boolean;
            description?: string;
        }
    ): WeakMap<Key, Value>;
}