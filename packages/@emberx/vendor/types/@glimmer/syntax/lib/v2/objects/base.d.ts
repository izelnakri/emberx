declare module '@glimmer/syntax/lib/v2/objects/base' {
    import type { SerializedSourceSpan } from "@glimmer/syntax/lib/source/span";
    import type { Args } from "@glimmer/syntax/lib/v2/objects/args";
    import type { ElementModifier } from "@glimmer/syntax/lib/v2/objects/attr-block";
    import type { AppendContent, ContentNode, InvokeBlock, InvokeComponent } from "@glimmer/syntax/lib/v2/objects/content";
    import type { CallExpression, KeywordExpression, PathExpression } from "@glimmer/syntax/lib/v2/objects/expr";
    import type { BaseNodeFields } from "@glimmer/syntax/lib/v2/objects/node";
    export interface SerializedBaseNode {
        loc: SerializedSourceSpan;
    }
    export interface GlimmerParentNodeOptions extends BaseNodeFields {
        body: readonly ContentNode[];
    }
    export interface CallFields extends BaseNodeFields {
        callee: CalleeNode;
        args: Args;
    }
    export type CalleeNode = KeywordExpression | PathExpression | CallExpression;
    export type CallNode = CallExpression | InvokeBlock | AppendContent | InvokeComponent | ElementModifier;
}