declare module '@glimmer/syntax/lib/v1/public-builders' {
    import type { Dict, Maybe, Nullable } from "@glimmer/interfaces";
    import type { SourceLocation, SourcePosition } from "@glimmer/syntax/lib/source/location";
    import type * as ASTv1 from "@glimmer/syntax/lib/v1/api";
    import { SourceSpan } from "@glimmer/syntax/lib/source/span";
    export type BuilderHead = string | ASTv1.CallableExpression;
    export type TagDescriptor = string | ASTv1.PathExpression | {
        path: ASTv1.PathExpression;
        selfClosing?: boolean;
    } | {
        name: string;
        selfClosing?: boolean;
    };
    function buildMustache(
        path: BuilderHead | ASTv1.Literal,
        params?: ASTv1.Expression[],
        hash?: ASTv1.Hash,
        trusting?: boolean,
        loc?: SourceLocation,
        strip?: ASTv1.StripFlags
    ): ASTv1.MustacheStatement
    type PossiblyDeprecatedBlock = ASTv1.Block | ASTv1.Template;
    function buildBlock(
        path: BuilderHead,
        params: Nullable<ASTv1.Expression[]>,
        hash: Nullable<ASTv1.Hash>,
        _defaultBlock: PossiblyDeprecatedBlock,
        _elseBlock?: Nullable<PossiblyDeprecatedBlock>,
        loc?: SourceLocation,
        openStrip?: ASTv1.StripFlags,
        inverseStrip?: ASTv1.StripFlags,
        closeStrip?: ASTv1.StripFlags
    ): ASTv1.BlockStatement
    function buildElementModifier(
        path: BuilderHead,
        params?: ASTv1.Expression[],
        hash?: ASTv1.Hash,
        loc?: Nullable<SourceLocation>
    ): ASTv1.ElementModifierStatement
    function buildComment(value: string, loc?: SourceLocation): ASTv1.CommentStatement
    function buildMustacheComment(value: string, loc?: SourceLocation): ASTv1.MustacheCommentStatement
    function buildConcat(parts: (ASTv1.TextNode | ASTv1.MustacheStatement)[], loc?: SourceLocation): ASTv1.ConcatStatement
    export type ElementParts = ["attrs", ...AttrSexp[]] | ["modifiers", ...ModifierSexp[]] | ["body", ...ASTv1.Statement[]] | ["comments", ...ElementComment[]] | ["as", ...string[]] | ["loc", SourceLocation];
    export type PathSexp = string | ["path", string, LocSexp?];
    export type ModifierSexp = string | [PathSexp, LocSexp?] | [PathSexp, ASTv1.Expression[], LocSexp?] | [PathSexp, ASTv1.Expression[], Dict<ASTv1.Expression>, LocSexp?];
    export type AttrSexp = [string, ASTv1.AttrNode["value"] | string, LocSexp?];
    export type LocSexp = ["loc", SourceLocation];
    export type ElementComment = ASTv1.MustacheCommentStatement | SourceLocation | string;
    export type SexpValue = string | ASTv1.Expression[] | Dict<ASTv1.Expression> | LocSexp | PathSexp | undefined;
    export interface BuildElementOptions {
        attrs?: ASTv1.AttrNode[];
        modifiers?: ASTv1.ElementModifierStatement[];
        children?: ASTv1.Statement[];
        comments?: ASTv1.MustacheCommentStatement[];
        blockParams?: ASTv1.VarHead[] | string[];
        openTag?: SourceLocation;
        closeTag?: Maybe<SourceLocation>;
        loc?: SourceLocation;
    }
    function buildElement(tag: TagDescriptor, options?: BuildElementOptions): ASTv1.ElementNode
    function buildAttr(name: string, value: ASTv1.AttrValue, loc?: SourceLocation): ASTv1.AttrNode
    function buildText(chars?: string, loc?: SourceLocation): ASTv1.TextNode
    function buildSexpr(
        path: BuilderHead,
        params?: ASTv1.Expression[],
        hash?: ASTv1.Hash,
        loc?: SourceLocation
    ): ASTv1.SubExpression
    function buildThis(loc?: SourceLocation): ASTv1.ThisHead
    function buildAtName(name: string, loc?: SourceLocation): ASTv1.AtHead
    function buildVar(name: string, loc?: SourceLocation): ASTv1.VarHead
    function buildHeadFromString(original: string, loc?: SourceLocation): ASTv1.PathHead
    function buildCleanPath(head: ASTv1.PathHead, tail?: string[], loc?: SourceLocation): ASTv1.PathExpression
    function buildPath(
        path: ASTv1.PathExpression | string | {
            head: string;
            tail: string[];
        },
        loc?: SourceLocation
    ): ASTv1.PathExpression
    function buildPath(path: BuilderHead, loc?: SourceLocation): ASTv1.CallableExpression
    function buildPath(path: BuilderHead | ASTv1.Literal | ASTv1.Expression, loc?: SourceLocation): ASTv1.Expression
    function buildLiteral<T extends ASTv1.Literal>(type: T["type"], value: T["value"], loc?: SourceLocation): T
    function buildHash(pairs?: ASTv1.HashPair[], loc?: SourceLocation): ASTv1.Hash
    function buildPair(key: string, value: ASTv1.Expression, loc?: SourceLocation): ASTv1.HashPair
    function buildProgram(body?: ASTv1.Statement[], blockParams?: string[], loc?: SourceLocation): ASTv1.Template | ASTv1.Block
    function buildBlockItself(
        body?: ASTv1.Statement[],
        params?: Array<ASTv1.VarHead | string>,
        chained?: boolean,
        loc?: SourceLocation
    ): ASTv1.Block
    function buildTemplate(body?: ASTv1.Statement[], blockParams?: string[], loc?: SourceLocation): ASTv1.Template
    function buildPosition(line: number, column: number): SourcePosition
    function buildLoc(loc: Nullable<SourceLocation>): SourceSpan
    function buildLoc(
        startLine: number,
        startColumn: number,
        endLine?: number,
        endColumn?: number,
        source?: string
    ): SourceSpan
    const _default: {
        mustache: typeof buildMustache;
        block: typeof buildBlock;
        comment: typeof buildComment;
        mustacheComment: typeof buildMustacheComment;
        element: typeof buildElement;
        elementModifier: typeof buildElementModifier;
        attr: typeof buildAttr;
        text: typeof buildText;
        sexpr: typeof buildSexpr;
        concat: typeof buildConcat;
        hash: typeof buildHash;
        pair: typeof buildPair;
        literal: typeof buildLiteral;
        program: typeof buildProgram;
        blockItself: typeof buildBlockItself;
        template: typeof buildTemplate;
        loc: typeof buildLoc;
        pos: typeof buildPosition;
        path: typeof buildPath;
        fullPath: typeof buildCleanPath;
        head: typeof buildHeadFromString;
        at: typeof buildAtName;
        var: typeof buildVar;
        this: typeof buildThis;
        string: (value: string) => ASTv1.StringLiteral;
        boolean: (value: boolean) => ASTv1.BooleanLiteral;
        number: (value: number) => ASTv1.NumberLiteral;
        undefined(): ASTv1.UndefinedLiteral;
        null(): ASTv1.NullLiteral;
    };
    export default _default;
}