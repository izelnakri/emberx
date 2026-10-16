declare module '@glimmer/runtime/lib/vm/element-builder' {
    import type { AppendingBlock, AttrNamespace, Bounds, Cursor, ElementOperations, Environment, GlimmerTreeChanges, GlimmerTreeConstruction, Maybe, ModifierInstance, Nullable, ResettableBlock, SimpleComment, SimpleDocumentFragment, SimpleElement, SimpleNode, SimpleText, TreeBuilder } from "@glimmer/interfaces";
    import { StackImpl as Stack } from "@glimmer/util/lib/collections";
    import type { DynamicAttribute } from "@glimmer/runtime/lib/vm/attributes/dynamic";
    import { CursorImpl } from "@glimmer/runtime/lib/bounds";
    export interface FirstNode {
        debug?: {
            first: () => Nullable<SimpleNode>;
        };
        firstNode(): SimpleNode;
    }
    export interface LastNode {
        debug?: {
            last: () => Nullable<SimpleNode>;
        };
        lastNode(): SimpleNode;
    }
    export class Fragment implements Bounds {
        private bounds;
        constructor(bounds: Bounds);
        parentElement(): SimpleElement;
        firstNode(): SimpleNode;
        lastNode(): SimpleNode;
    }
    export class NewTreeBuilder implements TreeBuilder {
        debug?: () => {
            blocks: AppendingBlock[];
            constructing: Nullable<SimpleElement>;
            cursors: Cursor[];
        };
        dom: GlimmerTreeConstruction;
        updateOperations: GlimmerTreeChanges;
        constructing: Nullable<SimpleElement>;
        operations: Nullable<ElementOperations>;
        private env;
        readonly cursors: Stack<Cursor>;
        private modifierStack;
        private blockStack;
        static forInitialRender(env: Environment, cursor: CursorImpl): NewTreeBuilder;
        static resume(env: Environment, block: ResettableBlock): NewTreeBuilder;
        constructor(env: Environment, parentNode: SimpleElement, nextSibling: Nullable<SimpleNode>);
        protected initialize(): this;
        debugBlocks(): AppendingBlock[];
        get element(): SimpleElement;
        get nextSibling(): Nullable<SimpleNode>;
        get hasBlocks(): boolean;
        protected block(): AppendingBlock;
        popElement(): void;
        pushAppendingBlock(): AppendingBlock;
        pushResettableBlock(): ResettableBlockImpl;
        pushBlockList(list: AppendingBlock[]): AppendingBlockList;
        protected pushBlock<T extends AppendingBlock>(block: T, isRemote?: boolean): T;
        popBlock(): AppendingBlock;
        __openBlock(): void;
        __closeBlock(): void;
        openElement(tag: string): SimpleElement;
        __openElement(tag: string): SimpleElement;
        flushElement(modifiers: Nullable<ModifierInstance[]>): void;
        __flushElement(parent: SimpleElement, constructing: SimpleElement): void;
        closeElement(): Nullable<ModifierInstance[]>;
        pushRemoteElement(element: SimpleElement, guid: string, insertBefore: Maybe<SimpleNode>): RemoteBlock;
        __pushRemoteElement(element: SimpleElement, _guid: string, insertBefore: Maybe<SimpleNode>): RemoteBlock;
        popRemoteElement(): RemoteBlock;
        protected pushElement(element: SimpleElement, nextSibling?: Maybe<SimpleNode>): void;
        private pushModifiers;
        private popModifiers;
        didAppendBounds(bounds: Bounds): Bounds;
        didAppendNode<T extends SimpleNode>(node: T): T;
        didOpenElement(element: SimpleElement): SimpleElement;
        willCloseElement(): void;
        appendText(string: string): SimpleText;
        __appendText(text: string): SimpleText;
        __appendNode(node: SimpleNode): SimpleNode;
        __appendFragment(fragment: SimpleDocumentFragment): Bounds;
        __appendHTML(html: string): Bounds;
        appendDynamicHTML(value: string): void;
        appendDynamicText(value: string): SimpleText;
        appendDynamicFragment(value: SimpleDocumentFragment): void;
        appendDynamicNode(value: SimpleNode): void;
        private trustedContent;
        private untrustedContent;
        appendComment(string: string): SimpleComment;
        __appendComment(string: string): SimpleComment;
        __setAttribute(name: string, value: string, namespace: Nullable<AttrNamespace>): void;
        __setProperty(name: string, value: unknown): void;
        setStaticAttribute(name: string, value: string, namespace: Nullable<AttrNamespace>): void;
        setDynamicAttribute(name: string, value: unknown, trusting: boolean, namespace: Nullable<AttrNamespace>): DynamicAttribute;
    }
    export class AppendingBlockImpl implements AppendingBlock {
        private parent;
        debug?: {
            first: () => Nullable<SimpleNode>;
            last: () => Nullable<SimpleNode>;
        };
        protected first: Nullable<FirstNode>;
        protected last: Nullable<LastNode>;
        protected nesting: number;
        constructor(parent: SimpleElement);
        parentElement(): SimpleElement;
        firstNode(): SimpleNode;
        lastNode(): SimpleNode;
        openElement(element: SimpleElement): void;
        closeElement(): void;
        didAppendNode(node: SimpleNode): void;
        didAppendBounds(bounds: Bounds): void;
        finalize(stack: TreeBuilder): void;
    }
    export class RemoteBlock extends AppendingBlockImpl {
        constructor(parent: SimpleElement);
    }
    export class ResettableBlockImpl extends AppendingBlockImpl implements ResettableBlock {
        constructor(parent: SimpleElement);
        reset(): Nullable<SimpleNode>;
    }
    export class AppendingBlockList implements AppendingBlock {
        private readonly parent;
        boundList: AppendingBlock[];
        constructor(parent: SimpleElement, boundList: AppendingBlock[]);
        parentElement(): SimpleElement;
        firstNode(): SimpleNode;
        lastNode(): SimpleNode;
        openElement(_element: SimpleElement): void;
        closeElement(): void;
        didAppendNode(_node: SimpleNode): void;
        didAppendBounds(_bounds: Bounds): void;
        finalize(_stack: TreeBuilder): void;
    }
    export function clientBuilder(env: Environment, cursor: CursorImpl): TreeBuilder;
    export type MutableKey<T> = {
        [P in keyof T]-?: (<U>() => U extends {
            [K in P]: T[P];
        } ? 1 : 2) extends <U>() => U extends {
            -readonly [K in P]: T[P];
        } ? 1 : 2 ? P : never;
    }[keyof T];
}