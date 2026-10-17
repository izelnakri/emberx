declare module '@glimmer/validator/lib/collections/object' {
    export function trackedObject<ObjectType extends object>(
        data?: ObjectType,
        options?: {
            equals?: (a: ObjectType[keyof ObjectType], b: ObjectType[keyof ObjectType]) => boolean;
            description?: string;
        }
    ): ObjectType;
}