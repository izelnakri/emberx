declare module '@glimmer/compiler/lib/compiler' {
    import type { Nullable, SerializedTemplateBlock, TemplateJavascript } from "@glimmer/interfaces";
    import type { PrecompileOptions, PrecompileOptionsWithLexicalScope, TemplateIdFn } from "@glimmer/syntax/lib/parser/tokenizer-event-handlers";
    export const defaultId: TemplateIdFn;
    export function precompileJSON(
      string: Nullable<string>,
      options?: PrecompileOptions | PrecompileOptionsWithLexicalScope
    ): [block: SerializedTemplateBlock, usedLocals: string[]];
    export function precompile(
      source: string,
      options?: PrecompileOptions | PrecompileOptionsWithLexicalScope
    ): TemplateJavascript;
    export type { PrecompileOptions };
}