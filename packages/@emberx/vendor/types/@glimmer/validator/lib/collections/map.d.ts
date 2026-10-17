declare module '@glimmer/validator/lib/collections/map' {
    export function trackedMap<Key = any, Value = any>(
        data?: Map<Key, Value> | Iterable<readonly [Key, Value]> | readonly (readonly [Key, Value])[] | null,
        options?: {
            equals?: (a: Value, b: Value) => boolean;
            description?: string;
        }
    ): Map<Key, Value>;
}