declare module '@glimmer/runtime/lib/vm/rehydrate-builder' {
    import type { AttrNamespace, Bounds, Environment, Maybe, Nullable, SimpleComment, SimpleElement, SimpleNode, SimpleText, TreeBuilder } from "@glimmer/interfaces";
    import type { StackImpl as Stack } from "@glimmer/util/lib/collections";
    import { CursorImpl } from "@glimmer/runtime/lib/bounds";
    import { NewTreeBuilder, RemoteBlock } from "@glimmer/runtime/lib/vm/element-builder";
    export const SERIALIZATION_FIRST_NODE_STRING = "%+b:0%";
    export function isSerializationFirstNode(node: SimpleNode): boolean;
    export class RehydratingCursor extends CursorImpl {
        readonly startingBlockDepth: number;
        candidate: Nullable<SimpleNode>;
        openBlockDepth: number;
        injectedOmittedNode: boolean;
        constructor(element: SimpleElement, nextSibling: Nullable<SimpleNode>, startingBlockDepth: number);
    }
    export class RehydrateTree extends NewTreeBuilder implements TreeBuilder {
        private unmatchedAttributes;
        cursors: Stack<RehydratingCursor>;
        blockDepth: number;
        startingBlockOffset: number;
        constructor(env: Environment, parentNode: SimpleElement, nextSibling: Nullable<SimpleNode>);
        get currentCursor(): Nullable<RehydratingCursor>;
        get candidate(): Nullable<SimpleNode>;
        set candidate(node: Nullable<SimpleNode>);
        disableRehydration(nextSibling: Nullable<SimpleNode>): void;
        enableRehydration(candidate: Nullable<SimpleNode>): void;
        pushElement(
        /** called from parent constructor before we initialize this */
        this: RehydrateTree | (NewTreeBuilder & Partial<Pick<RehydrateTree, "blockDepth" | "candidate">>), element: SimpleElement, nextSibling?: Maybe<SimpleNode>): void;
        private clearMismatch;
        __openBlock(): void;
        __closeBlock(): void;
        __appendNode(node: SimpleNode): SimpleNode;
        __appendHTML(html: string): Bounds;
        protected remove(node: SimpleNode): Nullable<SimpleNode>;
        private markerBounds;
        __appendText(string: string): SimpleText;
        __appendComment(string: string): SimpleComment;
        __openElement(tag: string): SimpleElement;
        __setAttribute(name: string, value: string, namespace: Nullable<AttrNamespace>): void;
        __setProperty(name: string, value: string): void;
        __flushElement(parent: SimpleElement, constructing: SimpleElement): void;
        willCloseElement(): void;
        getMarker(element: HTMLElement, guid: string): Nullable<SimpleNode>;
        __pushRemoteElement(element: SimpleElement, cursorId: string, insertBefore: Maybe<SimpleNode>): RemoteBlock;
        didAppendBounds(bounds: Bounds): Bounds;
    }
    export function rehydrationBuilder(env: Environment, cursor: CursorImpl): TreeBuilder;
}