declare module '@glimmer/runtime/lib/vm/update' {
    import type { AppendingBlock, Bounds, DynamicScope, Environment, EvaluationContext, ExceptionHandler, GlimmerTreeChanges, Nullable, ResettableBlock, Scope, UpdatingOpcode, UpdatingVM as IUpdatingVM } from "@glimmer/interfaces";
    import type { OpaqueIterator } from "@glimmer/reference/lib/iterable";
    import type { Reference } from "@glimmer/reference/lib/reference";
    import type { Closure } from "@glimmer/runtime/lib/vm/append";
    import type { AppendingBlockList } from "@glimmer/runtime/lib/vm/element-builder";
    export class UpdatingVM implements IUpdatingVM {
        env: Environment;
        dom: GlimmerTreeChanges;
        alwaysRevalidate: boolean;
        private frameStack;
        constructor(env: Environment, { alwaysRevalidate }: {
            alwaysRevalidate?: boolean | undefined;
        });
        execute(opcodes: UpdatingOpcode[], handler: ExceptionHandler): void;
        private _execute;
        private get frame();
        goto(index: number): void;
        try(ops: UpdatingOpcode[], handler: Nullable<ExceptionHandler>): void;
        throw(): void;
    }
    export interface VMState {
        readonly pc: number;
        readonly scope: Scope;
        readonly dynamicScope: DynamicScope;
        readonly stack: unknown[];
    }
    export abstract class BlockOpcode implements UpdatingOpcode, Bounds {
        protected state: Closure;
        protected context: EvaluationContext;
        children: UpdatingOpcode[];
        protected readonly bounds: AppendingBlock;
        constructor(state: Closure, context: EvaluationContext, bounds: AppendingBlock, children: UpdatingOpcode[]);
        parentElement(): import("@simple-dom/interface").SimpleElement;
        firstNode(): import("@simple-dom/interface").SimpleNode;
        lastNode(): import("@simple-dom/interface").SimpleNode;
        evaluate(vm: UpdatingVM): void;
    }
    export class TryOpcode extends BlockOpcode implements ExceptionHandler {
        type: string;
        protected bounds: ResettableBlock;
        evaluate(vm: UpdatingVM): void;
        handleException(): void;
    }
    export class ListItemOpcode extends TryOpcode {
        key: unknown;
        memo: Reference;
        value: Reference;
        retained: boolean;
        index: number;
        constructor(state: Closure, context: EvaluationContext, bounds: ResettableBlock, key: unknown, memo: Reference, value: Reference);
        shouldRemove(): boolean;
        reset(): void;
    }
    export class ListBlockOpcode extends BlockOpcode {
        private iterableRef;
        type: string;
        children: ListItemOpcode[];
        private opcodeMap;
        private marker;
        private lastIterator;
        protected readonly bounds: AppendingBlockList;
        constructor(state: Closure, context: EvaluationContext, bounds: AppendingBlockList, children: ListItemOpcode[], iterableRef: Reference<OpaqueIterator>);
        initializeChild(opcode: ListItemOpcode): void;
        evaluate(vm: UpdatingVM): void;
        private sync;
        private retainItem;
        private insertItem;
        private moveItem;
        private deleteItem;
    }
}