declare module '@glimmer/validator/lib/validators' {
    import type { ConstantTag, DirtyableTag, MonomorphicTagId, Tag, TagComputeSymbol, TagTypeSymbol, UpdatableTag } from "@glimmer/interfaces";
    export type Revision = number;
    export const CONSTANT: Revision;
    export const INITIAL: Revision;
    export const VOLATILE: Revision;
    export let $REVISION: number;
    export function bump(): void;
    export const COMPUTE: TagComputeSymbol;
    /**
     * `value` receives a tag and returns an opaque Revision based on that tag. This
     * snapshot can then later be passed to `validate` with the same tag to
     * determine if the tag has changed at all since the time that `value` was
     * called.
     *
     * @param tag
     */
    export function valueForTag(tag: Tag): Revision;
    /**
     * `validate` receives a tag and a snapshot from a previous call to `value` with
     * the same tag, and determines if the tag is still valid compared to the
     * snapshot. If the tag's state has changed at all since then, `validate` will
     * return false, otherwise it will return true. This is used to determine if a
     * calculation related to the tags should be rerun.
     *
     * @param tag
     * @param snapshot
     */
    export function validateTag(tag: Tag, snapshot: Revision): boolean;
    const TYPE: TagTypeSymbol;
    export let ALLOW_CYCLES: WeakMap<Tag, boolean> | undefined;
    class MonomorphicTagImpl<T extends MonomorphicTagId = MonomorphicTagId> {
        static combine(this: void, tags: Tag[]): Tag;
        private revision;
        private lastChecked;
        private lastValue;
        private isUpdating;
        subtag: Tag | Tag[] | null;
        private subtagBufferCache;
        [TYPE]: T;
        constructor(type: T);
        [COMPUTE](): Revision;
        static updateTag(this: void, _tag: UpdatableTag, _subtag: Tag): void;
        static dirtyTag(this: void, tag: DirtyableTag | UpdatableTag, disableConsumptionAssertion?: boolean): void;
    }
    export const DIRTY_TAG: typeof MonomorphicTagImpl.dirtyTag;
    export const UPDATE_TAG: typeof MonomorphicTagImpl.updateTag;
    export function createTag(): DirtyableTag;
    export function createUpdatableTag(): UpdatableTag;
    export const CONSTANT_TAG: ConstantTag;
    export function isConstTag(tag: Tag): tag is ConstantTag;
    export class VolatileTag implements Tag {
        readonly [TYPE]: 100;
        [COMPUTE](): Revision;
    }
    export const VOLATILE_TAG: VolatileTag;
    export class CurrentTag implements Tag {
        readonly [TYPE]: 101;
        [COMPUTE](): Revision;
    }
    export const CURRENT_TAG: CurrentTag;
    export const combine: typeof MonomorphicTagImpl.combine;
    export {};
}