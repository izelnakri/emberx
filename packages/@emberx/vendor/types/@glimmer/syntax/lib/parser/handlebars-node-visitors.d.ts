declare module '@glimmer/syntax/lib/parser/handlebars-node-visitors' {
    import type { Nullable } from "@glimmer/interfaces";
    import type { SourceOffset, SourceSpan } from "@glimmer/syntax/lib/source/span";
    import type * as ASTv1 from "@glimmer/syntax/lib/v1/api";
    import type * as HBS from "@glimmer/syntax/lib/v1/handlebars-ast";
    import { Parser } from "@glimmer/syntax/lib/parser";
    export interface PendingError {
        mustache(span: SourceSpan): never;
        eof(offset: SourceOffset): never;
    }
    export abstract class HandlebarsNodeVisitors extends Parser {
        protected pendingError: Nullable<PendingError>;
        abstract appendToCommentData(s: string): void;
        abstract beginAttributeValue(quoted: boolean): void;
        abstract finishAttributeValue(): void;
        parse(program: HBS.UpstreamProgram, blockParams: string[]): ASTv1.Template;
        Program(program: HBS.Program, blockParams?: ASTv1.VarHead[]): ASTv1.Block;
        private parseProgram;
        BlockStatement(block: HBS.UpstreamBlockStatement): ASTv1.BlockStatement | void;
        MustacheStatement(rawMustache: HBS.MustacheStatement): ASTv1.MustacheStatement | void;
        appendDynamicAttributeValuePart(part: ASTv1.MustacheStatement): void;
        finalizeTextPart(): void;
        startTextPart(): void;
        ContentStatement(content: HBS.ContentStatement): void;
        CommentStatement(rawComment: HBS.CommentStatement): Nullable<ASTv1.MustacheCommentStatement>;
        PartialStatement(partial: HBS.PartialStatement): never;
        PartialBlockStatement(partialBlock: HBS.PartialBlockStatement): never;
        Decorator(decorator: HBS.Decorator): never;
        DecoratorBlock(decoratorBlock: HBS.DecoratorBlock): never;
        SubExpression(sexpr: HBS.SubExpression): ASTv1.SubExpression;
        PathExpression(path: HBS.PathExpression): ASTv1.PathExpression;
        Hash(hash: HBS.Hash): ASTv1.Hash;
        StringLiteral(string: HBS.StringLiteral): ASTv1.StringLiteral;
        BooleanLiteral(boolean: HBS.BooleanLiteral): ASTv1.BooleanLiteral;
        NumberLiteral(number: HBS.NumberLiteral): ASTv1.NumberLiteral;
        UndefinedLiteral(undef: HBS.UndefinedLiteral): ASTv1.UndefinedLiteral;
        NullLiteral(nul: HBS.NullLiteral): ASTv1.NullLiteral;
    }
}