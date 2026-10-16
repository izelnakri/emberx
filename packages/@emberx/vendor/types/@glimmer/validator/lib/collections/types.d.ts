declare module '@glimmer/validator/lib/collections/types' {
    export interface ReactiveOptions<Value> {
        equals: (a: Value, b: Value) => boolean;
        description: string | undefined;
    }
}