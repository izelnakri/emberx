declare module '@glimmer/compiler/lib/builder/builder-interface' {
    import type { VariableKind } from "@glimmer/constants/lib/builder-constants";
    import type { Dict, Nullable, PresentArray } from "@glimmer/interfaces";
    import { APPEND_EXPR_HEAD, APPEND_PATH_HEAD, BLOCK_HEAD, BUILDER_APPEND, BUILDER_COMMENT, BUILDER_CONCAT, BUILDER_DYNAMIC_COMPONENT, BUILDER_GET, BUILDER_HAS_BLOCK, BUILDER_HAS_BLOCK_PARAMS, BUILDER_LITERAL, BUILDER_MODIFIER, CALL_EXPR, CALL_HEAD, COMMENT_HEAD, CONCAT_EXPR, DYNAMIC_COMPONENT_HEAD, ELEMENT_HEAD, GET_PATH_EXPR, GET_VAR_EXPR, HAS_BLOCK_EXPR, HAS_BLOCK_PARAMS_EXPR, KEYWORD_HEAD, LITERAL_EXPR, LITERAL_HEAD, MODIFIER_HEAD, SPLAT_HEAD } from "@glimmer/constants/lib/builder-constants";
    export type BuilderParams = BuilderExpression[];
    export type BuilderHash = Nullable<Dict<BuilderExpression>>;
    export type BuilderBlockHash = BuilderHash | {
        as: string | string[];
    };
    export type BuilderBlocks = Dict<BuilderBlock>;
    export type BuilderAttrs = Dict<BuilderAttr>;
    export type NormalizedParams = NormalizedExpression[];
    export type NormalizedHash = Dict<NormalizedExpression>;
    export type NormalizedBlock = NormalizedStatement[];
    export type NormalizedBlocks = Dict<NormalizedBlock>;
    export type NormalizedAttrs = Dict<NormalizedAttr>;
    export type NormalizedAttr = SPLAT_HEAD | NormalizedExpression;
    export interface NormalizedElement {
        name: string;
        attrs: Nullable<NormalizedAttrs>;
        block: Nullable<NormalizedBlock>;
    }
    export interface NormalizedAngleInvocation {
        head: NormalizedExpression;
        attrs: Nullable<NormalizedAttrs>;
        block: Nullable<NormalizedBlock>;
    }
    export interface Variable {
        kind: VariableKind;
        name: string;
        /**
         * Differences:
         *
         * - strict mode variables always refer to in-scope variables
         * - loose mode variables use this algorithm:
         *   1. otherwise, fall back to `this.<name>`
         */
        mode: "loose" | "strict";
    }
    export interface Path {
        head: Variable;
        tail: PresentArray<string>;
    }
    export interface AppendExpr {
        kind: APPEND_EXPR_HEAD;
        expr: NormalizedExpression;
        trusted: boolean;
    }
    export interface AppendPath {
        kind: APPEND_PATH_HEAD;
        path: NormalizedPath;
        trusted: boolean;
    }
    export interface NormalizedKeywordStatement {
        kind: KEYWORD_HEAD;
        name: string;
        params: Nullable<NormalizedParams>;
        hash: Nullable<NormalizedHash>;
        blockParams: Nullable<string[]>;
        blocks: NormalizedBlocks;
    }
    export type NormalizedStatement = {
        kind: CALL_HEAD;
        head: NormalizedHead;
        params: Nullable<NormalizedParams>;
        hash: Nullable<NormalizedHash>;
        trusted: boolean;
    } | {
        kind: BLOCK_HEAD;
        head: NormalizedHead;
        params: Nullable<NormalizedParams>;
        hash: Nullable<NormalizedHash>;
        blockParams: Nullable<string[]>;
        blocks: NormalizedBlocks;
    } | NormalizedKeywordStatement | {
        kind: ELEMENT_HEAD;
        name: string;
        attrs: NormalizedAttrs;
        block: NormalizedBlock;
    } | {
        kind: COMMENT_HEAD;
        value: string;
    } | {
        kind: LITERAL_HEAD;
        value: string;
    } | AppendPath | AppendExpr | {
        kind: MODIFIER_HEAD;
        params: NormalizedParams;
        hash: Nullable<NormalizedHash>;
    } | {
        kind: DYNAMIC_COMPONENT_HEAD;
        expr: NormalizedExpression;
        hash: Nullable<NormalizedHash>;
        block: NormalizedBlock;
    };
    export function normalizeStatement(statement: BuilderStatement): NormalizedStatement;
    export function normalizeAppendHead(head: NormalizedHead, trusted: boolean): AppendExpr | AppendPath;
    export type SugaryArrayStatement = BuilderCallExpression | BuilderElement | BuilderBlockStatement;
    export function normalizeSugaryArrayStatement(statement: SugaryArrayStatement): NormalizedStatement;
    export function normalizePathHead(whole: string): Variable;
    export type BuilderBlockStatement = [string, BuilderBlock | BuilderBlocks] | [string, BuilderParams | BuilderBlockHash, BuilderBlock | BuilderBlocks] | [string, BuilderParams, BuilderBlockHash, BuilderBlock | BuilderBlocks];
    export interface NormalizedBuilderBlockStatement {
        head: NormalizedHead;
        params: Nullable<NormalizedParams>;
        hash: Nullable<NormalizedHash>;
        blockParams: Nullable<string[]>;
        blocks: NormalizedBlocks;
    }
    export function normalizeBuilderBlockStatement(statement: BuilderBlockStatement): NormalizedBuilderBlockStatement;
    type Entry<T> = {
        [K in keyof T]: [K, T[K]];
    }[keyof T];
    export function entries<D extends Dict>(dict: D, callback: (...entry: Entry<D>) => void): void;
    export type BuilderElement = [string] | [string, BuilderAttrs, BuilderBlock] | [string, BuilderBlock] | [string, BuilderAttrs];
    export type BuilderComment = [BUILDER_COMMENT, string];
    export type InvocationElement = [string] | [string, BuilderAttrs, BuilderBlock] | [string, BuilderBlock] | [string, BuilderAttrs];
    export function isElement(input: [string, ...unknown[]]): input is BuilderElement;
    export function extractElement(input: string): Nullable<string>;
    export function isAngleInvocation(input: [string, ...unknown[]]): input is InvocationElement;
    export function isBlock(input: [string, ...unknown[]]): input is BuilderBlockStatement;
    export type VerboseStatement = [BUILDER_LITERAL, string] | [BUILDER_COMMENT, string] | [BUILDER_APPEND, BuilderExpression, true] | [BUILDER_APPEND, BuilderExpression] | [BUILDER_MODIFIER, Params, Hash] | [BUILDER_DYNAMIC_COMPONENT, BuilderExpression, Hash, BuilderBlock];
    export type BuilderStatement = VerboseStatement | SugaryArrayStatement | TupleBuilderExpression | string;
    /**
     * The special value 'splat' is used to indicate that the attribute is a splat
     */
    export type BuilderAttr = BuilderExpression;
    export type TupleBuilderExpression = [BUILDER_LITERAL, string | boolean | null | undefined] | [BUILDER_GET, string] | [BUILDER_GET, string, string[]] | [BUILDER_CONCAT, ...BuilderExpression[]] | [BUILDER_HAS_BLOCK, string] | [BUILDER_HAS_BLOCK_PARAMS, string] | BuilderCallExpression;
    type Params = BuilderParams;
    type Hash = Dict<BuilderExpression>;
    export interface NormalizedCallExpression {
        type: CALL_EXPR;
        head: NormalizedHead;
        params: Nullable<NormalizedParams>;
        hash: Nullable<NormalizedHash>;
    }
    export interface NormalizedPath {
        type: GET_PATH_EXPR;
        path: Path;
    }
    export interface NormalizedVar {
        type: GET_VAR_EXPR;
        variable: Variable;
    }
    export type NormalizedHead = NormalizedPath | NormalizedVar;
    export interface NormalizedConcat {
        type: CONCAT_EXPR;
        params: [NormalizedExpression, ...NormalizedExpression[]];
    }
    export type NormalizedExpression = {
        type: LITERAL_EXPR;
        value: null | undefined | boolean | string | number;
    } | NormalizedCallExpression | NormalizedPath | NormalizedVar | NormalizedConcat | {
        type: HAS_BLOCK_EXPR;
        name: string;
    } | {
        type: HAS_BLOCK_PARAMS_EXPR;
        name: string;
    };
    export function normalizeAppendExpression(expression: BuilderExpression, forceTrusted?: boolean): AppendExpr | AppendPath;
    export function normalizeExpression(expression: BuilderExpression): NormalizedExpression;
    export type BuilderExpression = TupleBuilderExpression | BuilderCallExpression | null | undefined | boolean | string | number;
    export function isBuilderExpression(expr: BuilderExpression | BuilderCallExpression): expr is TupleBuilderExpression | BuilderCallExpression;
    export function isLiteral(expr: BuilderExpression | BuilderCallExpression): expr is [BUILDER_LITERAL, string | boolean | undefined];
    export function statementIsExpression(statement: BuilderStatement): statement is TupleBuilderExpression;
    export function isBuilderCallExpression(value: TupleBuilderExpression | BuilderCallExpression): value is BuilderCallExpression;
    export type MiniBuilderBlock = BuilderStatement[];
    export type BuilderBlock = MiniBuilderBlock;
    export type BuilderCallExpression = [string] | [string, Params | Hash] | [string, Params, Hash];
    export function normalizeParams(input: Params): NormalizedParams;
    export function normalizeHash(input: Nullable<Hash>): Nullable<NormalizedHash>;
    export function normalizeCallExpression(expr: BuilderCallExpression): NormalizedCallExpression;
    export {};
}