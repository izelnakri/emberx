declare module '@glimmer/compiler/lib/builder/builder' {
    import type { AttrNamespace, Expressions, GetContextualFreeOpcode, Nullable, PresentArray, WireFormat } from "@glimmer/interfaces";
    import { BUILDER_LITERAL } from "@glimmer/constants/lib/builder-constants";
    import { resolution as VariableResolutionContext } from "@glimmer/wire-format/lib/resolution";
    import type { BuilderComment, BuilderStatement, NormalizedAngleInvocation, NormalizedAttrs, NormalizedBlocks, NormalizedExpression, NormalizedHash, NormalizedHead, NormalizedParams, NormalizedPath, NormalizedStatement, Variable } from "@glimmer/compiler/lib/builder/builder-interface";
    interface Symbols {
        top: ProgramSymbols;
        freeVar(name: string): number;
        arg(name: string): number;
        block(name: string): number;
        local(name: string): number;
        this(): number;
        hasLocal(name: string): boolean;
        child(params: string[]): LocalSymbols;
    }
    export class ProgramSymbols implements Symbols {
        _freeVariables: string[];
        _symbols: string[];
        top: this;
        toSymbols(): string[];
        toUpvars(): string[];
        freeVar(name: string): number;
        block(name: string): number;
        arg(name: string): number;
        local(name: string): never;
        this(): number;
        hasLocal(_name: string): false;
        symbol(name: string): number;
        child(locals: string[]): LocalSymbols;
    }
    class LocalSymbols implements Symbols {
        private parent;
        private locals;
        constructor(parent: Symbols, locals: string[]);
        get paramSymbols(): number[];
        get top(): ProgramSymbols;
        freeVar(name: string): number;
        arg(name: string): number;
        block(name: string): number;
        local(name: string): number;
        this(): number;
        hasLocal(name: string): boolean;
        child(locals: string[]): LocalSymbols;
    }
    export interface BuilderGetFree {
        type: "GetFree";
        head: string;
        tail: string[];
    }
    export function buildStatements(statements: BuilderStatement[], symbols: Symbols): WireFormat.Statement[];
    export function buildNormalizedStatements(statements: NormalizedStatement[], symbols: Symbols): WireFormat.Statement[];
    export function buildStatement(normalized: NormalizedStatement, symbols?: Symbols): WireFormat.Statement[];
    export function s(arr: TemplateStringsArray, ...interpolated: unknown[]): [BUILDER_LITERAL, string];
    export function c(arr: TemplateStringsArray, ...interpolated: unknown[]): BuilderComment;
    export function unicode(charCode: string): string;
    export const NEWLINE = "\n";
    export function buildAngleInvocation({ attrs, block, head }: NormalizedAngleInvocation, symbols: Symbols): WireFormat.Statements.Component;
    export function buildElementParams(attrs: NormalizedAttrs, symbols: Symbols): {
        params: WireFormat.ElementParameter[];
        args: WireFormat.Core.Hash;
    };
    export function extractNamespace(name: string): Nullable<AttrNamespace>;
    export function buildAttributeValue(
        name: string,
        value: NormalizedExpression,
        namespace: Nullable<AttrNamespace>,
        symbols: Symbols
    ): WireFormat.Attribute[];
    type ExprResolution = VariableResolutionContext | "Append" | "TrustedAppend" | "AttrValue" | "SubExpression" | "Strict";
    export function buildExpression(expr: NormalizedExpression, context: ExprResolution, symbols: Symbols): WireFormat.Expression;
    export function buildCallHead(callHead: NormalizedHead, context: VarResolution, symbols: Symbols): Expressions.GetVar | Expressions.GetPath;
    export function buildGetPath(head: NormalizedPath, symbols: Symbols): Expressions.GetPath;
    type VarResolution = VariableResolutionContext | "AppendBare" | "AppendInvoke" | "TrustedAppendBare" | "TrustedAppendInvoke" | "AttrValueBare" | "AttrValueInvoke" | "SubExpression" | "Strict";
    export function buildVar(
        head: Variable,
        context: VarResolution,
        symbols: Symbols,
        path: PresentArray<string>
    ): Expressions.GetPath;
    export function buildVar(head: Variable, context: VarResolution, symbols: Symbols): Expressions.GetVar;
    export function expressionContextOp(context: VariableResolutionContext): GetContextualFreeOpcode;
    export function buildParams(exprs: Nullable<NormalizedParams>, symbols: Symbols): Nullable<WireFormat.Core.Params>;
    export function buildConcat(exprs: [NormalizedExpression, ...NormalizedExpression[]], symbols: Symbols): WireFormat.Core.ConcatParams;
    export function buildHash(exprs: Nullable<NormalizedHash>, symbols: Symbols): WireFormat.Core.Hash;
    export function buildBlocks(blocks: NormalizedBlocks, blockParams: Nullable<string[]>, parent: Symbols): WireFormat.Core.Blocks;
    export {};
}