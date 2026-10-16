declare module '@glimmer/runtime/lib/dom/helper' {
    import type { GlimmerTreeChanges, Nullable, SimpleDocument, SimpleElement, SimpleNode } from "@glimmer/interfaces";
    import { DOMOperations } from "@glimmer/runtime/lib/dom/operations";
    export function isWhitespace(string: string): boolean;
    export class DOMChangesImpl extends DOMOperations implements GlimmerTreeChanges {
        protected document: SimpleDocument;
        protected namespace: Nullable<string>;
        constructor(document: SimpleDocument);
        setAttribute(element: SimpleElement, name: string, value: string): void;
        removeAttribute(element: SimpleElement, name: string): void;
        insertAfter(element: SimpleElement, node: SimpleNode, reference: SimpleNode): void;
    }
    export const DOMChanges: typeof DOMChangesImpl;
    export { DOMTreeConstruction } from "@glimmer/runtime/lib/dom/api";
}