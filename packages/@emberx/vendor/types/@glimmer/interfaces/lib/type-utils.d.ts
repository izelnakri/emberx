declare module '@glimmer/interfaces/lib/type-utils' {
    export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
}