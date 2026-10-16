declare module '@glimmer/validator/lib/meta' {
    import type { ConstantTag, UpdatableTag } from "@glimmer/interfaces";
    export type TagMeta = Map<PropertyKey, UpdatableTag>;
    export function dirtyTagFor<T extends object>(obj: T, key: keyof T | string | symbol, meta?: TagMeta): void;
    export function tagMetaFor(obj: object): TagMeta;
    export function tagFor<T extends object>(obj: T, key: keyof T | string | symbol, meta?: TagMeta): UpdatableTag | ConstantTag;
}