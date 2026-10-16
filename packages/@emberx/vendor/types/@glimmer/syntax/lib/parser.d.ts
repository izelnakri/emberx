declare module '@glimmer/syntax/lib/parser' {
    import type { Nullable } from "@glimmer/interfaces";
    import { EntityParser, EventedTokenizer } from "simple-html-tokenizer";
    import type * as src from "@glimmer/syntax/lib/source/api";
    import type * as ASTv1 from "@glimmer/syntax/lib/v1/api";
    import type * as HBS from "@glimmer/syntax/lib/v1/handlebars-ast";
    export type ParserNodeBuilder<N extends {
        loc: src.SourceSpan;
    }> = Omit<N, "loc"> & {
        start: src.SourceOffset;
    };
    export interface StartTag {
        readonly type: "StartTag";
        name: string;
        nameStart: Nullable<src.SourceOffset>;
        nameEnd: Nullable<src.SourceOffset>;
        readonly attributes: ASTv1.AttrNode[];
        readonly modifiers: ASTv1.ElementModifierStatement[];
        readonly comments: ASTv1.MustacheCommentStatement[];
        readonly params: ASTv1.VarHead[];
        selfClosing: boolean;
        readonly loc: src.SourceSpan;
    }
    export interface EndTag {
        readonly type: "EndTag";
        name: string;
        readonly loc: src.SourceSpan;
    }
    export interface Attribute {
        name: string;
        currentPart: ASTv1.TextNode | null;
        parts: (ASTv1.MustacheStatement | ASTv1.TextNode)[];
        isQuoted: boolean;
        isDynamic: boolean;
        start: src.SourceOffset;
        valueSpan: src.SourceSpan;
    }
    export abstract class Parser {
        protected elementStack: ASTv1.ParentNode[];
        private lines;
        readonly source: src.Source;
        currentAttribute: Nullable<Attribute>;
        currentNode: Nullable<Readonly<ParserNodeBuilder<ASTv1.CommentStatement> | ParserNodeBuilder<ASTv1.TextNode> | ParserNodeBuilder<StartTag> | ParserNodeBuilder<EndTag>>>;
        tokenizer: EventedTokenizer;
        constructor(source: src.Source, entityParser?: EntityParser, mode?: "precompile" | "codemod");
        offset(): src.SourceOffset;
        pos({ line, column }: src.SourcePosition): src.SourceOffset;
        finish<T extends {
            loc: src.SourceSpan;
        }>(node: ParserNodeBuilder<T>): T;
        abstract parse(node: HBS.Program, locals: string[]): ASTv1.Template;
        abstract Program(node: HBS.Program): HBS.Output<"Program">;
        abstract MustacheStatement(node: HBS.MustacheStatement): HBS.Output<"MustacheStatement">;
        abstract Decorator(node: HBS.Decorator): HBS.Output<"Decorator">;
        abstract BlockStatement(node: HBS.BlockStatement): HBS.Output<"BlockStatement">;
        abstract DecoratorBlock(node: HBS.DecoratorBlock): HBS.Output<"DecoratorBlock">;
        abstract PartialStatement(node: HBS.PartialStatement): HBS.Output<"PartialStatement">;
        abstract PartialBlockStatement(node: HBS.PartialBlockStatement): HBS.Output<"PartialBlockStatement">;
        abstract ContentStatement(node: HBS.ContentStatement): HBS.Output<"ContentStatement">;
        abstract CommentStatement(node: HBS.CommentStatement): HBS.Output<"CommentStatement">;
        abstract SubExpression(node: HBS.SubExpression): HBS.Output<"SubExpression">;
        abstract PathExpression(node: HBS.PathExpression): HBS.Output<"PathExpression">;
        abstract StringLiteral(node: HBS.StringLiteral): HBS.Output<"StringLiteral">;
        abstract BooleanLiteral(node: HBS.BooleanLiteral): HBS.Output<"BooleanLiteral">;
        abstract NumberLiteral(node: HBS.NumberLiteral): HBS.Output<"NumberLiteral">;
        abstract UndefinedLiteral(node: HBS.UndefinedLiteral): HBS.Output<"UndefinedLiteral">;
        abstract NullLiteral(node: HBS.NullLiteral): HBS.Output<"NullLiteral">;
        abstract reset(): void;
        abstract finishData(): void;
        abstract tagOpen(): void;
        abstract beginData(): void;
        abstract appendToData(char: string): void;
        abstract beginStartTag(): void;
        abstract appendToTagName(char: string): void;
        abstract beginAttribute(): void;
        abstract appendToAttributeName(char: string): void;
        abstract beginAttributeValue(quoted: boolean): void;
        abstract appendToAttributeValue(char: string): void;
        abstract finishAttributeValue(): void;
        abstract markTagAsSelfClosing(): void;
        abstract beginEndTag(): void;
        abstract finishTag(): void;
        abstract beginComment(): void;
        abstract appendToCommentData(char: string): void;
        abstract finishComment(): void;
        abstract reportSyntaxError(error: string): void;
        get currentAttr(): Attribute;
        get currentTag(): ParserNodeBuilder<StartTag> | ParserNodeBuilder<EndTag>;
        get currentStartTag(): ParserNodeBuilder<StartTag>;
        get currentEndTag(): ParserNodeBuilder<EndTag>;
        get currentComment(): ParserNodeBuilder<ASTv1.CommentStatement>;
        get currentData(): ParserNodeBuilder<ASTv1.TextNode>;
        acceptNode<T extends HBS.NodeType>(node: HBS.Node<T>): HBS.Output<T>;
        currentElement(): ASTv1.ParentNode;
        sourceForNode(node: HBS.Node, endNode?: {
            loc: HBS.SourceLocation;
        }): string;
    }
}