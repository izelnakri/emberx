declare module '@glimmer/runtime/lib/vm/low-level' {
    import type { EvaluationContext, Nullable, RuntimeOp } from "@glimmer/interfaces";
    import type { MachineRegister } from "@glimmer/vm/lib/registers";
    import type { DebugState } from "@glimmer/runtime/lib/opcodes";
    import type { VM } from "@glimmer/runtime/lib/vm/append";
    import "@glimmer/runtime/lib/bootstrap";
    export type LowLevelRegisters = [$pc: number, $ra: number, $sp: number, $fp: number];
    export function initializeRegisters(): LowLevelRegisters;
    export function restoreRegisters(pc: number, sp: number): LowLevelRegisters;
    export function initializeRegistersWithSP(sp: number): LowLevelRegisters;
    export function initializeRegistersWithPC(pc: number): LowLevelRegisters;
    export interface VmStack {
        readonly registers: LowLevelRegisters;
        push(value: unknown): void;
        get(position: number): number;
        pop<T>(): T;
        snapshot?(): unknown[];
    }
    export interface Externs {
        debugBefore: (opcode: RuntimeOp) => DebugState;
        debugAfter: (state: DebugState) => void;
    }
    export class LowLevelVM {
        stack: VmStack;
        externs: Externs | undefined;
        currentOpSize: number;
        readonly registers: LowLevelRegisters;
        readonly context: EvaluationContext;
        constructor(stack: VmStack, context: EvaluationContext, externs: Externs | undefined, registers: LowLevelRegisters);
        fetchRegister(register: MachineRegister): number;
        loadRegister(register: MachineRegister, value: number): void;
        setPc(pc: number): void;
        pushFrame(): void;
        popFrame(): void;
        pushSmallFrame(): void;
        popSmallFrame(): void;
        goto(offset: number): void;
        target(offset: number): number;
        call(handle: number): void;
        returnTo(offset: number): void;
        return(): void;
        nextStatement(): Nullable<RuntimeOp>;
        evaluateOuter(opcode: RuntimeOp, vm: VM): void;
        evaluateInner(opcode: RuntimeOp, vm: VM): void;
        evaluateMachine(opcode: RuntimeOp, vm: VM): undefined;
        evaluateSyscall(opcode: RuntimeOp, vm: VM): void;
    }
}