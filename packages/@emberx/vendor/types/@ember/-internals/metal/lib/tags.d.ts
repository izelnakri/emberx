declare module '@ember/-internals/metal/lib/tags' {
    import type { Tag } from "@glimmer/interfaces";
    import type { TagMeta } from "@glimmer/validator/lib/meta";
    export const SELF_TAG: string | symbol;
    export function tagForProperty(
      obj: object,
      propertyKey: string | symbol,
      addMandatorySetter?: boolean,
      meta?: TagMeta
    ): Tag;
    export function tagForObject(obj: unknown | null): Tag;
    export function markObjectAsDirty(obj: object, propertyKey: string): void;
}