declare module '@glimmer/interfaces' {
    import type * as WireFormat from "@glimmer/interfaces/lib/compile/wire-format/api";

    export type * from "@glimmer/interfaces/lib/array";
    export type * from "@glimmer/interfaces/lib/compile/index";
    export type * from "@glimmer/interfaces/lib/components";
    export type * from "@glimmer/interfaces/lib/content";
    export type * from "@glimmer/interfaces/lib/core";
    export type * from "@glimmer/interfaces/lib/curry";
    export type * from "@glimmer/interfaces/lib/dom/attributes";
    export type * from "@glimmer/interfaces/lib/dom/bounds";
    export type * from "@glimmer/interfaces/lib/dom/changes";
    export type * from "@glimmer/interfaces/lib/dom/simple";
    export type * from "@glimmer/interfaces/lib/dom/tree-construction";
    export type * from "@glimmer/interfaces/lib/managers";
    export type * from "@glimmer/interfaces/lib/program";
    export type * from "@glimmer/interfaces/lib/references";
    export type * from "@glimmer/interfaces/lib/runtime";
    export type * from "@glimmer/interfaces/lib/runtime/vm";
    export type * from "@glimmer/interfaces/lib/serialize";
    export type * from "@glimmer/interfaces/lib/stack";
    export type * from "@glimmer/interfaces/lib/tags";
    export type * from "@glimmer/interfaces/lib/template";
    export type * from "@glimmer/interfaces/lib/tier1/symbol-table";
    export type * from "@glimmer/interfaces/lib/type-utils";
    export type * from "@glimmer/interfaces/lib/vm-opcodes";

    export { WireFormat };
}