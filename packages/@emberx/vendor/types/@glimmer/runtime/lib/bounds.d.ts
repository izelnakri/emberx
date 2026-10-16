declare module '@glimmer/runtime/lib/bounds' {
    import type { Bounds, Cursor, Nullable, SimpleElement, SimpleNode } from "@glimmer/interfaces";
    export class CursorImpl implements Cursor {
        element: SimpleElement;
        nextSibling: Nullable<SimpleNode>;
        constructor(element: SimpleElement, nextSibling: Nullable<SimpleNode>);
    }
    export type DestroyableBounds = Bounds;
    export class ConcreteBounds implements Bounds {
        parentNode: SimpleElement;
        private first;
        private last;
        constructor(parentNode: SimpleElement, first: SimpleNode, last: SimpleNode);
        parentElement(): SimpleElement;
        firstNode(): SimpleNode;
        lastNode(): SimpleNode;
    }
    export function move(bounds: Bounds, reference: Nullable<SimpleNode>): Nullable<SimpleNode>;
    export function clear(bounds: Bounds): Nullable<SimpleNode>;
}