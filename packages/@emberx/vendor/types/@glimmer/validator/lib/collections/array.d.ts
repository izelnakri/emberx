declare module '@glimmer/validator/lib/collections/array' {
    export function trackedArray<T = unknown>(
        data?: T[],
        options?: {
            equals?: (a: T, b: T) => boolean;
            description?: string;
        }
    ): T[];
}