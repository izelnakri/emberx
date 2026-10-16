declare module '@glimmer/node/lib/node-dom-helper' {
    import type { Bounds, Nullable, SimpleDocument, SimpleElement, SimpleNode } from "@glimmer/interfaces";
    import { DOMTreeConstruction } from "@glimmer/runtime/lib/dom/api";
    export default class NodeDOMTreeConstruction extends DOMTreeConstruction {
        protected document: SimpleDocument;
        constructor(doc: Nullable<SimpleDocument>);
        protected setupUselessElement(): void;
        insertHTMLBefore(parent: SimpleElement, reference: Nullable<SimpleNode>, html: string): Bounds;
        createElement(tag: string): SimpleElement;
        setAttribute(element: SimpleElement, name: string, value: string): void;
    }
}