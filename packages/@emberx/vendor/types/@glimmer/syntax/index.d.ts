declare module '@glimmer/syntax' {
    export { default as print } from "@glimmer/syntax/lib/generation/print";
    export { getVoidTags, isVoidTag } from "@glimmer/syntax/lib/generation/printer";
    export { sortByLoc } from "@glimmer/syntax/lib/generation/util";
    export { getTemplateLocals } from "@glimmer/syntax/lib/get-template-locals";
    export { isKeyword, KEYWORDS_TYPES, type KeywordType } from "@glimmer/syntax/lib/keywords";
    export type { PreprocessOptions } from "@glimmer/syntax/lib/parser/tokenizer-event-handlers";
    export { type ASTPlugin, type ASTPluginBuilder, type ASTPluginEnvironment, type PrecompileOptions, type PrecompileOptionsWithLexicalScope, preprocess, type Syntax, type TemplateIdFn, } from "@glimmer/syntax/lib/parser/tokenizer-event-handlers";
    export * as src from "@glimmer/syntax/lib/source/api";
    export { SourceSlice } from "@glimmer/syntax/lib/source/slice";
    export { type HasSourceSpan, hasSpan, loc, type MaybeHasSourceSpan, maybeLoc, SpanList, } from "@glimmer/syntax/lib/source/span-list";
    export { BlockSymbolTable, ProgramSymbolTable, SymbolTable } from "@glimmer/syntax/lib/symbol-table";
    export { generateSyntaxError, type GlimmerSyntaxError } from "@glimmer/syntax/lib/syntax-error";
    export { cannotRemoveNode, cannotReplaceNode } from "@glimmer/syntax/lib/traversal/errors";
    export { default as WalkerPath } from "@glimmer/syntax/lib/traversal/path";
    export { default as traverse } from "@glimmer/syntax/lib/traversal/traverse";
    export type { NodeVisitor } from "@glimmer/syntax/lib/traversal/visitor";
    export { default as Walker } from "@glimmer/syntax/lib/traversal/walker";
    export type * as ASTv1 from "@glimmer/syntax/lib/v1/api";
    export { default as builders } from "@glimmer/syntax/lib/v1/public-builders";
    export { default as visitorKeys } from "@glimmer/syntax/lib/v1/visitor-keys";
    export * as ASTv2 from "@glimmer/syntax/lib/v2/api";
    export { normalize } from "@glimmer/syntax/lib/v2/normalize";
    export { node } from "@glimmer/syntax/lib/v2/objects/node";
    /** @deprecated use WalkerPath instead */
    export { default as Path } from "@glimmer/syntax/lib/traversal/walker";
    /** @deprecated use ASTv1 instead */
    export type * as AST from "@glimmer/syntax/lib/v1/api";
}