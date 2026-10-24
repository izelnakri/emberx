declare module '@glimmer/opcode-compiler/lib/program-context' {
    import type { ClassicResolver, CreateRuntimeOp, Environment, EvaluationContext, Nullable, Program, ProgramConstants, ProgramHeap, RuntimeArtifacts, RuntimeOptions, STDLib } from "@glimmer/interfaces";
    export class EvaluationContextImpl implements EvaluationContext {
        readonly constants: ProgramConstants;
        readonly heap: ProgramHeap;
        readonly resolver: Nullable<ClassicResolver>;
        readonly stdlib: STDLib;
        readonly createOp: CreateRuntimeOp;
        readonly env: Environment;
        readonly program: Program;
        constructor({ constants, heap }: RuntimeArtifacts, createOp: CreateRuntimeOp, runtime: RuntimeOptions);
    }
}