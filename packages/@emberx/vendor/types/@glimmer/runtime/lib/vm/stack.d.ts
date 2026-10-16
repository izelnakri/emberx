declare module '@glimmer/runtime/lib/vm/stack' {
    import type { LowLevelRegisters } from "@glimmer/runtime/lib/vm/low-level";
    export interface EvaluationStack {
        readonly registers: LowLevelRegisters;
        push(value: unknown): void;
        dup(position?: number): void;
        copy(from: number, to: number): void;
        pop<T>(n?: number): T;
        peek<T>(offset?: number): T;
        get<T>(offset: number, base?: number): T;
        set(value: unknown, offset: number, base?: number): void;
        slice<T = unknown>(start: number, end: number): T[];
        capture(items: number): unknown[];
        reset(): void;
        snapshot?(): unknown[];
    }
    export default class EvaluationStackImpl implements EvaluationStack {
        private stack;
        static restore(snapshot: unknown[], pc: number): EvaluationStackImpl;
        readonly registers: LowLevelRegisters;
        constructor(stack: unknown[] | undefined, registers: LowLevelRegisters);
        push(value: unknown): void;
        dup(position?: number): void;
        copy(from: number, to: number): void;
        pop<T>(n?: number): T;
        peek<T>(offset?: number): T;
        get<T>(offset: number, base?: number): T;
        set(value: unknown, offset: number, base?: number): void;
        slice<T = unknown>(start: number, end: number): T[];
        capture(items: number): unknown[];
        reset(): void;
        snapshot?: (this: EvaluationStackImpl) => unknown[];
    }
}