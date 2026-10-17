declare module '@glimmer/validator' {
    export { trackedArray } from "@glimmer/validator/lib/collections/array";
    export { trackedMap } from "@glimmer/validator/lib/collections/map";
    export { trackedObject } from "@glimmer/validator/lib/collections/object";
    export { trackedSet } from "@glimmer/validator/lib/collections/set";
    export { trackedWeakMap } from "@glimmer/validator/lib/collections/weak-map";
    export { trackedWeakSet } from "@glimmer/validator/lib/collections/weak-set";
    export { debug } from "@glimmer/validator/lib/debug";
    export { dirtyTagFor, tagFor, type TagMeta, tagMetaFor } from "@glimmer/validator/lib/meta";
    export { trackedData } from "@glimmer/validator/lib/tracked-data";
    export { type Reactive, type ReadOnlyReactive, TrackedValue, trackedValue, } from "@glimmer/validator/lib/tracked-value";
    export { beginTrackFrame, beginUntrackFrame, type Cache, consumeTag, createCache, endTrackFrame, endUntrackFrame, getValue, isConst, isTracking, resetTracking, track, untrack, } from "@glimmer/validator/lib/tracking";
    export { ALLOW_CYCLES, bump, combine, COMPUTE, CONSTANT, CONSTANT_TAG, createTag, createUpdatableTag, CURRENT_TAG, CurrentTag, DIRTY_TAG as dirtyTag, INITIAL, isConstTag, type Revision, UPDATE_TAG as updateTag, validateTag, valueForTag, VOLATILE, VOLATILE_TAG, VolatileTag, } from "@glimmer/validator/lib/validators";
    export type { CombinatorTag, ConstantTag, DirtyableTag, Tag, UpdatableTag, } from "@glimmer/interfaces";
}