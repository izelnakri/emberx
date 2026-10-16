declare module '@glimmer/syntax/lib/v2/objects/content' {
    import type { SourceSlice } from "@glimmer/syntax/lib/source/slice";
    import type { SymbolTable } from "@glimmer/syntax/lib/symbol-table";
    import type { ComponentArg, ElementModifier, HtmlOrSplatAttr } from "@glimmer/syntax/lib/v2/objects/attr-block";
    import type { CallFields } from "@glimmer/syntax/lib/v2/objects/base";
    import type { ExpressionNode } from "@glimmer/syntax/lib/v2/objects/expr";
    import type { NamedBlock, NamedBlocks } from "@glimmer/syntax/lib/v2/objects/internal-node";
    import type { BaseNodeFields } from "@glimmer/syntax/lib/v2/objects/node";
    import { Args } from "@glimmer/syntax/lib/v2/objects/args";
    /**
     * Content Nodes are allowed in content positions in templates. They correspond to behavior in the
     * [Data][data] tokenization state in HTML.
     *
     * [data]: https://html.spec.whatwg.org/multipage/parsing.html#data-state
     */
    export type ContentNode = HtmlText | HtmlComment | AppendContent | InvokeBlock | InvokeComponent | SimpleElement | GlimmerComment;
    const GlimmerComment_base: import("@glimmer/syntax/lib/v2/objects/node").TypedNodeConstructor<"GlimmerComment", {
        text: SourceSlice;
    } & BaseNodeFields>;
    export class GlimmerComment extends GlimmerComment_base {
    }
    const HtmlText_base: import("@glimmer/syntax/lib/v2/objects/node").TypedNodeConstructor<"HtmlText", {
        chars: string;
    } & BaseNodeFields>;
    export class HtmlText extends HtmlText_base {
    }
    const HtmlComment_base: import("@glimmer/syntax/lib/v2/objects/node").TypedNodeConstructor<"HtmlComment", {
        text: SourceSlice;
    } & BaseNodeFields>;
    export class HtmlComment extends HtmlComment_base {
    }
    const AppendContent_base: import("@glimmer/syntax/lib/v2/objects/node").TypedNodeConstructor<"AppendContent", {
        value: ExpressionNode;
        trusting: boolean;
        table: SymbolTable;
    } & BaseNodeFields>;
    export class AppendContent extends AppendContent_base {
        get callee(): ExpressionNode;
        get args(): Args;
    }
    const InvokeBlock_base: import("@glimmer/syntax/lib/v2/objects/node").TypedNodeConstructor<"InvokeBlock", CallFields & {
        blocks: NamedBlocks;
    } & BaseNodeFields>;
    export class InvokeBlock extends InvokeBlock_base {
    }
    interface InvokeComponentFields {
        callee: ExpressionNode;
        blocks: NamedBlocks;
        attrs: readonly HtmlOrSplatAttr[];
        componentArgs: readonly ComponentArg[];
        modifiers: readonly ElementModifier[];
    }
    const InvokeComponent_base: import("@glimmer/syntax/lib/v2/objects/node").TypedNodeConstructor<"InvokeComponent", InvokeComponentFields & BaseNodeFields>;
    /**
     * Corresponds to a component invocation. When the content of a component invocation contains no
     * named blocks, `blocks` contains a single named block named `"default"`. When a component
     * invocation is self-closing, `blocks` is empty.
     */
    export class InvokeComponent extends InvokeComponent_base {
        get args(): Args;
    }
    interface SimpleElementOptions extends BaseNodeFields {
        tag: SourceSlice;
        body: readonly ContentNode[];
        attrs: readonly HtmlOrSplatAttr[];
        componentArgs: readonly ComponentArg[];
        modifiers: readonly ElementModifier[];
    }
    const SimpleElement_base: import("@glimmer/syntax/lib/v2/objects/node").TypedNodeConstructor<"SimpleElement", SimpleElementOptions & BaseNodeFields>;
    /**
     * Corresponds to a simple HTML element. The AST allows component arguments and modifiers to support
     * future extensions.
     */
    export class SimpleElement extends SimpleElement_base {
        get args(): Args;
    }
    export type ElementNode = NamedBlock | InvokeComponent | SimpleElement;
    export {};
}