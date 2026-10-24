declare module '@glimmer/opcode-compiler/lib/compilable-template' {
    import type { BlockMetadata, CompilableBlock, CompilableProgram, EvaluationContext, HandleResult, LayoutWithContext, SerializedBlock, SerializedInlineBlock, Statement } from "@glimmer/interfaces";
    export const PLACEHOLDER_HANDLE = -1;
    export function compilable(layout: LayoutWithContext, moduleName: string): CompilableProgram;
    export function compileStatements(
      statements: Statement[],
      meta: BlockMetadata,
      syntaxContext: EvaluationContext
    ): HandleResult;
    export function compilableBlock(block: SerializedInlineBlock | SerializedBlock, containing: BlockMetadata): CompilableBlock;
}