declare module '@ember/object/computed' {
    export { ComputedProperty as default } from "@ember/-internals/metal/lib/computed";
    export { default as expandProperties } from "@ember/-internals/metal/lib/expand_properties";
    export { default as alias } from "@ember/-internals/metal/lib/alias";
    export { empty, notEmpty, none, not, bool, match, equal, gt, gte, lt, lte, oneWay, oneWay as reads, readOnly, deprecatingAlias, and, or, } from "@ember/object/lib/computed/computed_macros";
    export { sum, min, max, map, sort, setDiff, mapBy, filter, filterBy, uniq, uniqBy, union, intersect, collect, } from "@ember/object/lib/computed/reduce_computed_macros";
}