declare module '@glimmer/runtime/lib/opcodes' {
    import type { DebugOp, SomeDisassembledOperand } from "@glimmer/debug/lib/debug";
    import type { DebugVmSnapshot, Dict, Nullable, Optional, RuntimeOp, VmMachineOp, VmOp } from "@glimmer/interfaces";
    import { VmSnapshot } from "@glimmer/debug/lib/vm/snapshot";
    import type { LowLevelVM, VM } from "@glimmer/runtime/lib/vm";
    import type { Externs } from "@glimmer/runtime/lib/vm/low-level";
    export interface OpcodeJSON {
        type: number | string;
        guid?: Nullable<number>;
        deopted?: boolean;
        args?: string[];
        details?: Dict<Nullable<string>>;
        children?: OpcodeJSON[];
    }
    export type Operand1 = number;
    export type Operand2 = number;
    export type Operand3 = number;
    export type Syscall = (vm: VM, opcode: RuntimeOp) => void;
    export type MachineOpcode = (vm: LowLevelVM, opcode: RuntimeOp) => void;
    export type Evaluate = {
        syscall: true;
        evaluate: Syscall;
    } | {
        syscall: false;
        evaluate: MachineOpcode;
    };
    export type DebugState = {
        opcode: {
            type: VmMachineOp | VmOp;
            isMachine: 0 | 1;
            size: number;
        };
        closeGroup?: undefined | (() => void);
        params?: Optional<Dict<SomeDisassembledOperand>>;
        op?: Optional<DebugOp>;
        debug: DebugVmSnapshot;
        snapshot: VmSnapshot;
    };
    export class AppendOpcodes {
        private evaluateOpcode;
        debugBefore?: (vm: DebugVmSnapshot, opcode: RuntimeOp) => DebugState;
        debugAfter?: (debug: DebugVmSnapshot, pre: DebugState) => void;
        constructor();
        add<Name extends VmOp>(name: Name, evaluate: Syscall): void;
        add<Name extends VmMachineOp>(name: Name, evaluate: MachineOpcode, kind: "machine"): void;
        evaluate(vm: VM, opcode: RuntimeOp, type: number): void;
    }
    export function externs(vm: VM): Externs | undefined;
    export const APPEND_OPCODES: AppendOpcodes;
}