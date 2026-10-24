declare module '@glimmer/program/lib/opcode' {
    import type { ProgramHeap, RuntimeOp, SomeVmOp } from "@glimmer/interfaces";
    export class RuntimeOpImpl implements RuntimeOp {
        readonly heap: ProgramHeap;
        offset: number;
        constructor(heap: ProgramHeap);
        get size(): number;
        get isMachine(): 0 | 1;
        get type(): SomeVmOp;
        get op1(): number;
        get op2(): number;
        get op3(): number;
    }
}