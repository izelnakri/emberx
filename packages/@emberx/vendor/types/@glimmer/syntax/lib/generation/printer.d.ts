declare module '@glimmer/syntax/lib/generation/printer' {
    import type * as ASTv1 from "@glimmer/syntax/lib/v1/api";
    export const voidMap: Set<string>;
    export function getVoidTags(): string[];
    export interface PrinterOptions {
        entityEncoding: ASTv1.EntityEncodingState;
        /**
         * Used to override the mechanism of printing a given AST.Node.
         *
         * This will generally only be useful to source -> source codemods
         * where you would like to specialize/override the way a given node is
         * printed (e.g. you would like to preserve as much of the original
         * formatting as possible).
         *
         * When the provided override returns undefined, the default built in printing
         * will be done for the AST.Node.
         *
         * @param ast the ast node to be printed
         * @param options the options specified during the print() invocation
         */
        override?(ast: ASTv1.Node, options: PrinterOptions): void | string;
    }
    /**
     * Examples when true:
     *  - link
     *  - liNK
     *
     * Examples when false:
     *  - Link (component)
     */
    export function isVoidTag(tag: string): boolean;
    export default class Printer {
        private buffer;
        private options;
        constructor(options: PrinterOptions);
        handledByOverride(node: ASTv1.Node, ensureLeadingWhitespace?: boolean): boolean;
        Node(node: ASTv1.Node): void;
        Expression(expression: ASTv1.Expression): void;
        Literal(literal: ASTv1.Literal): void;
        TopLevelStatement(statement: ASTv1.TopLevelStatement | ASTv1.Template | ASTv1.AttrNode): void;
        Template(template: ASTv1.Template): void;
        Block(block: ASTv1.Block): void;
        TopLevelStatements(statements: ASTv1.TopLevelStatement[]): void;
        ElementNode(el: ASTv1.ElementNode): void;
        OpenElementNode(el: ASTv1.ElementNode): void;
        CloseElementNode(el: ASTv1.ElementNode): void;
        AttrNode(attr: ASTv1.AttrNode): void;
        AttrNodeValue(value: ASTv1.AttrNode["value"]): void;
        TextNode(text: ASTv1.TextNode, isInAttr?: "'" | "\""): void;
        MustacheStatement(mustache: ASTv1.MustacheStatement): void;
        BlockStatement(block: ASTv1.BlockStatement): void;
        BlockParams(blockParams: string[]): void;
        ConcatStatement(concat: ASTv1.ConcatStatement): void;
        MustacheCommentStatement(comment: ASTv1.MustacheCommentStatement): void;
        ElementModifierStatement(mod: ASTv1.ElementModifierStatement): void;
        CommentStatement(comment: ASTv1.CommentStatement): void;
        PathExpression(path: ASTv1.PathExpression): void;
        SubExpression(sexp: ASTv1.SubExpression): void;
        Params(params: ASTv1.Expression[]): void;
        Hash(hash: ASTv1.Hash): void;
        HashPair(pair: ASTv1.HashPair): void;
        StringLiteral(str: ASTv1.StringLiteral): void;
        BooleanLiteral(bool: ASTv1.BooleanLiteral): void;
        NumberLiteral(number: ASTv1.NumberLiteral): void;
        UndefinedLiteral(node: ASTv1.UndefinedLiteral): void;
        NullLiteral(node: ASTv1.NullLiteral): void;
        print(node: ASTv1.Node): string;
    }
}