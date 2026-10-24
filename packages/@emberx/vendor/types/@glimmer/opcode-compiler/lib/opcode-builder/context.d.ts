declare module '@glimmer/opcode-compiler/lib/opcode-builder/context' {
    import type { BlockMetadata, CompilationContext, EvaluationContext } from "@glimmer/interfaces";
    export function templateCompilationContext(evaluation: EvaluationContext, meta: BlockMetadata): CompilationContext;
}