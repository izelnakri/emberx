declare module '@glimmer/syntax/lib/v1/visitor-keys' {
    import type * as ASTv1 from "@glimmer/syntax/lib/v1/api";
    const visitorKeys: {
        readonly Template: readonly ["body"];
        readonly Block: readonly ["body"];
        readonly MustacheStatement: readonly ["path", "params", "hash"];
        readonly BlockStatement: readonly ["path", "params", "hash", "program", "inverse"];
        readonly ElementModifierStatement: readonly ["path", "params", "hash"];
        readonly CommentStatement: readonly [];
        readonly MustacheCommentStatement: readonly [];
        readonly ElementNode: readonly ["attributes", "modifiers", "children", "comments"];
        readonly AttrNode: readonly ["value"];
        readonly TextNode: readonly [];
        readonly ConcatStatement: readonly ["parts"];
        readonly SubExpression: readonly ["path", "params", "hash"];
        readonly PathExpression: readonly [];
        readonly StringLiteral: readonly [];
        readonly BooleanLiteral: readonly [];
        readonly NumberLiteral: readonly [];
        readonly NullLiteral: readonly [];
        readonly UndefinedLiteral: readonly [];
        readonly Hash: readonly ["pairs"];
        readonly HashPair: readonly ["value"];
    };
    type VisitorKeysMap = typeof visitorKeys;
    export type VisitorKeys = {
        [P in keyof VisitorKeysMap]: VisitorKeysMap[P][number];
    };
    export type VisitorKey<N extends ASTv1.Node> = VisitorKeys[N["type"]] & keyof N;
    export default visitorKeys;
}