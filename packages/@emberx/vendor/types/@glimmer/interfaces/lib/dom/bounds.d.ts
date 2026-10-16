declare module '@glimmer/interfaces/lib/dom/bounds' {
    import type { Nullable } from "@glimmer/interfaces/lib/core.js";
    import type { SimpleElement, SimpleNode } from "@glimmer/interfaces/lib/dom/simple.js";

    export interface Bounds {
      // a method to future-proof for wormholing; may not be needed ultimately
      parentElement(): SimpleElement;
      firstNode(): SimpleNode;
      lastNode(): SimpleNode;
    }

    export interface Cursor {
      readonly element: SimpleElement;
      readonly nextSibling: Nullable<SimpleNode>;
    }
}