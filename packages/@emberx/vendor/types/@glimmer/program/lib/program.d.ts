declare module '@glimmer/program/lib/program' {
    import type { Program, ProgramConstants, ProgramHeap, StdLibOperand } from "@glimmer/interfaces";
    import { RuntimeOpImpl } from "@glimmer/program/lib/opcode";
    export type Placeholder = [number, () => number];
    export type StdlibPlaceholder = [number, StdLibOperand];
    /**
     * The Program Heap is responsible for dynamically allocating
     * memory in which we read/write the VM's instructions
     * from/to. When we malloc we pass out a VMHandle, which
     * is used as an indirect way of accessing the memory during
     * execution of the VM. Internally we track the different
     * regions of the memory in an int array known as the table.
     *
     * The table 32-bit aligned and has the following layout:
     *
     * | ... | hp (u32) |       info (u32)   | size (u32) |
     * | ... |  Handle  | Scope Size | State | Size       |
     * | ... | 32bits   | 30bits     | 2bits | 32bit      |
     *
     * With this information we effectively have the ability to
     * control when we want to free memory. That being said you
     * can not free during execution as raw address are only
     * valid during the execution. This means you cannot close
     * over them as you will have a bad memory access exception.
     */
    export class ProgramHeapImpl implements ProgramHeap {
        offset: number;
        private heap;
        private handleTable;
        private handleState;
        constructor();
        entries(): number;
        pushRaw(value: number): void;
        pushOp(item: number): void;
        pushMachine(item: number): void;
        private sizeCheck;
        getbyaddr(address: number): number;
        setbyaddr(address: number, value: number): void;
        malloc(): number;
        finishMalloc(handle: number): void;
        size(): number;
        getaddr(handle: number): number;
        sizeof(handle: number): number;
        free(handle: number): void;
        /**
         * The heap uses the [Mark-Compact Algorithm](https://en.wikipedia.org/wiki/Mark-compact_algorithm) to shift
         * reachable memory to the bottom of the heap and freeable
         * memory to the top of the heap. When we have shifted all
         * the reachable memory to the top of the heap, we move the
         * offset to the next free position.
         */
        compact(): void;
    }
    export class ProgramImpl implements Program {
        constants: ProgramConstants;
        heap: ProgramHeap;
        [key: number]: never;
        private _opcode;
        constructor(constants: ProgramConstants, heap: ProgramHeap);
        opcode(offset: number): RuntimeOpImpl;
    }
}