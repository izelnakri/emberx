declare module '@glimmer/validator/lib/collections/set' {
    export function trackedSet<Value = unknown>(
        data?: Set<Value> | Value[] | Iterable<Value> | null,
        options?: {
            equals?: (a: Value, b: Value) => boolean;
            description?: string;
        }
    ): Set<Value>;
}