declare module '@glimmer/runtime/lib/dom/operations' {
    import type { Bounds, Dict, Nullable, SimpleComment, SimpleDocument, SimpleElement, SimpleNode, SimpleText } from "@glimmer/interfaces";
    export const BLACKLIST_TABLE: Dict<1>;
    export class DOMOperations {
        protected document: SimpleDocument;
        protected uselessElement: SimpleElement;
        constructor(document: SimpleDocument);
        protected setupUselessElement(): void;
        createElement(tag: string, context?: SimpleElement): SimpleElement;
        insertBefore(parent: SimpleElement, node: SimpleNode, reference: Nullable<SimpleNode>): void;
        insertHTMLBefore(parent: SimpleElement, nextSibling: Nullable<SimpleNode>, html: string): Bounds;
        createTextNode(text: string): SimpleText;
        createComment(data: string): SimpleComment;
    }
    export function moveNodesBefore(
        source: SimpleNode,
        target: SimpleElement,
        nextSibling: Nullable<SimpleNode>
    ): Bounds;
}