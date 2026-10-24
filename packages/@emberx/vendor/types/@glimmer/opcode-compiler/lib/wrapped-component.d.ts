declare module '@glimmer/opcode-compiler/lib/wrapped-component' {
    import type { BlockMetadata, CompilableProgram, EvaluationContext, HandleResult, LayoutWithContext, ProgramSymbolTable } from "@glimmer/interfaces";
    export class WrappedBuilder implements CompilableProgram {
        private readonly layout;
        moduleName: string;
        symbolTable: ProgramSymbolTable;
        private compiled;
        private attrsBlockNumber;
        readonly meta: BlockMetadata;
        constructor(layout: LayoutWithContext, moduleName: string);
        compile(syntax: EvaluationContext): HandleResult;
    }
}