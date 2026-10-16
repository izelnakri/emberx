declare module '@glimmer/interfaces/lib/runtime/runtime' {
    import type { ProgramConstants, ProgramHeap, RuntimeOp } from "@glimmer/interfaces/lib/program.js";

    export interface Program {
      readonly constants: ProgramConstants;
      readonly heap: ProgramHeap;

      opcode(offset: number): RuntimeOp;
    }

    export interface RuntimeArtifacts {
      readonly constants: ProgramConstants;
      readonly heap: ProgramHeap;
    }
}