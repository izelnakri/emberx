declare module '@glimmer/validator/lib/tracked-data' {
    export type Getter<T, K extends keyof T> = (self: T) => T[K] | undefined;
    export type Setter<T, K extends keyof T> = (self: T, value: T[K]) => void;
    export function trackedData<T extends object, K extends keyof T>(key: K, initializer?: (this: T) => T[K]): {
        getter: Getter<T, K>;
        setter: Setter<T, K>;
    };
}