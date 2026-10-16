declare module '@glimmer/interfaces/lib/dom/changes' {
    import type { Nullable } from "@glimmer/interfaces/lib/core.js";
    import type { Bounds } from "@glimmer/interfaces/lib/dom/bounds.js";
    import type { Namespace, SimpleComment, SimpleElement, SimpleNode, SimpleText } from "@glimmer/interfaces/lib/dom/simple.js";

    export interface GlimmerDOMOperations {
      createElement(tag: string, context?: SimpleElement): SimpleElement;
      insertBefore(parent: SimpleElement, node: SimpleNode, reference: Nullable<SimpleNode>): void;
      insertHTMLBefore(parent: SimpleElement, nextSibling: Nullable<SimpleNode>, html: string): Bounds;
      createTextNode(text: string): SimpleText;
      createComment(data: string): SimpleComment;
    }

    export interface GlimmerTreeChanges extends GlimmerDOMOperations {
      setAttribute(element: SimpleElement, name: string, value: string): void;
      removeAttribute(element: SimpleElement, name: string): void;
      insertAfter(element: SimpleElement, node: SimpleNode, reference: SimpleNode): void;
    }

    export interface GlimmerTreeConstruction extends GlimmerDOMOperations {
      setAttribute(
        element: SimpleElement,
        name: string,
        value: string,
        namespace?: Nullable<Namespace>
      ): void;
    }
}