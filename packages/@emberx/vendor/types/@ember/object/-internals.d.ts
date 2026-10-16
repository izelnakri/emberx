declare module '@ember/object/-internals' {
    export { getCachedValueFor as cacheFor } from "@ember/-internals/metal/lib/computed_cache";
    export { guidFor } from "@ember/-internals/utils/lib/guid";
    import EmberObject from "@ember/object";
    interface FrameworkObject extends EmberObject {
    }
    let FrameworkObject: typeof EmberObject;
    export { FrameworkObject };
}