declare module '@glimmer/runtime/lib/vm/append' {
    import type { CompilableTemplate, DebugVmSnapshot, DebugVmTrace, Destroyable, DynamicScope, Environment, EvaluationContext, Owner, Program, ProgramConstants, RenderResult, RichIteratorResult, Scope, TreeBuilder, UpdatingOpcode } from "@glimmer/interfaces";
    import type { OpaqueIterationItem, OpaqueIterator } from "@glimmer/reference/lib/iterable";
    import type { Reference } from "@glimmer/reference/lib/reference";
    import type { MachineRegister, Register, SyscallRegister } from "@glimmer/vm/lib/registers";
    import type { ScopeOptions } from "@glimmer/runtime/lib/scope";
    import type { EvaluationStack } from "@glimmer/runtime/lib/vm/stack";
    import { VMArgumentsImpl } from "@glimmer/runtime/lib/vm/arguments";
    import { LowLevelVM } from "@glimmer/runtime/lib/vm/low-level";
    import { ListItemOpcode } from "@glimmer/runtime/lib/vm/update";
    export class VM {
        #private;
        readonly args: VMArgumentsImpl;
        readonly lowlevel: LowLevelVM;
        readonly debug?: () => DebugVmSnapshot;
        readonly trace?: () => DebugVmTrace;
        get stack(): EvaluationStack;
        get pc(): number;
        /**
         * Fetch a value from a syscall register onto the stack.
         *
         * ## Opcodes
         *
         * - Append: `Fetch`
         *
         * ## State changes
         *
         * [!] push Eval Stack <- $register
         */
        fetch(register: SyscallRegister): void;
        /**
         * Load a value from the stack into a syscall register.
         *
         * ## Opcodes
         *
         * - Append: `Load`
         *
         * ## State changes
         *
         * [!] pop Eval Stack -> `value`
         * [$] $register <- `value`
         */
        load(register: SyscallRegister): void;
        /**
         * Load a value into a syscall register.
         *
         * ## State changes
         *
         * [$] $register <- `value`
         *
         * @utility
         */
        loadValue<T>(register: SyscallRegister, value: T): void;
        /**
         * Fetch a value from a register (machine or syscall).
         *
         * ## State changes
         *
         * [ ] get $register
         *
         * @utility
         */
        fetchValue(register: MachineRegister): number;
        fetchValue<T>(register: Register): T;
        call(handle: number | null): void;
        return(): void;
        readonly context: EvaluationContext;
        constructor({ scope, dynamicScope, stack, pc }: ClosureState, context: EvaluationContext, tree: TreeBuilder);
        static initial(context: EvaluationContext, options: InitialVmState): VM;
        compile(block: CompilableTemplate): number;
        get constants(): ProgramConstants;
        get program(): Program;
        get env(): Environment;
        private captureClosure;
        capture(args: number, pc?: number): Closure;
        /**
         * ## Opcodes
         *
         * - Append: `BeginComponentTransaction`
         *
         * ## State Changes
         *
         * [ ] create `guard` (`JumpIfNotModifiedOpcode`)
         * [ ] create `tracker` (`BeginTrackFrameOpcode`)
         * [!] push Updating Stack <- `guard`
         * [!] push Updating Stack <- `tracker`
         * [!] push Cache Stack <- `guard`
         * [!] push Tracking Stack
         */
        beginCacheGroup(name?: string): void;
        /**
         * ## Opcodes
         *
         * - Append: `CommitComponentTransaction`
         *
         * ## State Changes
         *
         * Create a new `EndTrackFrameOpcode` (`end`)
         *
         * [!] pop CacheStack -> `guard`
         * [!] pop Tracking Stack -> `tag`
         * [ ] create `end` (`EndTrackFrameOpcode`) with `guard`
         * [-] consume `tag`
         */
        commitCacheGroup(): void;
        /**
         * ## Opcodes
         *
         * - Append: `Enter`
         *
         * ## State changes
         *
         * [!] push Element Stack as `block`
         * [ ] create `try` (`TryOpcode`) with `block`, capturing `args` from the Eval Stack
         *
         * Did Enter (`try`):
         * [-] associate destroyable `try`
         * [!] push Destroyable Stack <- `try`
         * [!] push Updating List <- `try`
         * [!] push Updating Stack <- `try.children`
         */
        enter(args: number): void;
        /**
         * ## Opcodes
         *
         * - Append: `Iterate`
         * - Update: `ListBlock`
         *
         * ## State changes
         *
         * Create a new ref for the iterator item (`value`).
         * Create a new ref for the iterator key (`key`).
         *
         * [ ] create `valueRef` (`Reference`) from `value`
         * [ ] create `keyRef` (`Reference`) from `key`
         * [!] push Eval Stack <- `valueRef`
         * [!] push Eval Stack <- `keyRef`
         * [!] push Element Stack <- `UpdatableBlock` as `block`
         * [ ] capture `closure` with *2* items from the Eval Stack
         * [ ] create `iteration` (`ListItemOpcode`) with `closure`, `block`, `key`, `keyRef` and `valueRef`
         *
         * Did Enter (`iteration`):
         * [-] associate destroyable `iteration`
         * [!] push Destroyable Stack <- `iteration`
         * [!] push Updating List <- `iteration`
         * [!] push Updating Stack <- `iteration.children`
         */
        enterItem({ key, value, memo }: OpaqueIterationItem): ListItemOpcode;
        registerItem(opcode: ListItemOpcode): void;
        /**
         * ## Opcodes
         *
         * - Append: `EnterList`
         *
         * ## State changes
         *
         * [ ] capture `closure` with *0* items from the Eval Stack, and `$pc` from `offset`
         * [ ] create `updating` (empty `Array`)
         * [!] push Element Stack <- `list` (`BlockList`) with `updating`
         * [ ] create `list` (`ListBlockOpcode`) with `closure`, `list`, `updating` and `iterableRef`
         * [!] push List Stack <- `list`
         *
         * Did Enter (`list`):
         * [-] associate destroyable `list`
         * [!] push Destroyable Stack <- `list`
         * [!] push Updating List <- `list`
         * [!] push Updating Stack <- `list.children`
         */
        enterList(iterableRef: Reference<OpaqueIterator>, offset: number): void;
        /**
         * ## Opcodes
         *
         * - Append: `Enter`
         * - Append: `Iterate`
         * - Append: `EnterList`
         * - Update: `ListBlock`
         *
         * ## State changes
         *
         * [-] associate destroyable `opcode`
         * [!] push Destroyable Stack <- `opcode`
         * [!] push Updating List <- `opcode`
         * [!] push Updating Stack <- `opcode.children`
         *
         */
        private didEnter;
        /**
         * ## Opcodes
         *
         * - Append: `Exit`
         * - Append: `ExitList`
         *
         * ## State changes
         *
         * [!] pop Destroyable Stack
         * [!] pop Element Stack
         * [!] pop Updating Stack
         */
        exit(): void;
        /**
         * ## Opcodes
         *
         * - Append: `ExitList`
         *
         * ## State changes
         *
         * Pop List:
         * [!] pop Destroyable Stack
         * [!] pop Element Stack
         * [!] pop Updating Stack
         *
         * [!] pop List Stack
         */
        exitList(): void;
        /**
         * ## Opcodes
         *
         * - Append: `RootScope`
         * - Append: `VirtualRootScope`
         *
         * ## State changes
         *
         * [!] push Scope Stack
         */
        pushRootScope(size: number, owner: Owner): Scope;
        /**
         * ## Opcodes
         *
         * - Append: `ChildScope`
         *
         * ## State changes
         *
         * [!] push Scope Stack <- `child` of current Scope
         */
        pushChildScope(): void;
        /**
         * ## Opcodes
         *
         * - Append: `Yield`
         *
         * ## State changes
         *
         * [!] push Scope Stack <- `scope`
         */
        pushScope(scope: Scope): void;
        /**
         * ## Opcodes
         *
         * - Append: `PopScope`
         *
         * ## State changes
         *
         * [!] pop Scope Stack
         */
        popScope(): void;
        /**
         * ## Opcodes
         *
         * - Append: `PushDynamicScope`
         *
         * ## State changes:
         *
         * [!] push Dynamic Scope Stack <- child of current Dynamic Scope
         */
        pushDynamicScope(): DynamicScope;
        /**
         * ## Opcodes
         *
         * - Append: `BindDynamicScope`
         *
         * ## State changes:
         *
         * [!] pop Dynamic Scope Stack `names.length` times
         */
        bindDynamicScope(names: string[]): void;
        /**
         * ## State changes
         *
         * - [!] push Updating Stack
         *
         * @utility
         */
        pushUpdating(list?: UpdatingOpcode[]): void;
        /**
         * ## State changes
         *
         * [!] pop Updating Stack
         *
         * @utility
         */
        popUpdating(): UpdatingOpcode[];
        /**
         * ## State changes
         *
         * [!] push Updating List
         *
         * @utility
         */
        updateWith(opcode: UpdatingOpcode): void;
        private listBlock;
        /**
         * ## State changes
         *
         * [-] associate destroyable `child`
         *
         * @utility
         */
        associateDestroyable(child: Destroyable): void;
        private updating;
        /**
         * Get Tree Builder
         */
        tree(): TreeBuilder;
        /**
         * Get current Scope
         */
        scope(): Scope;
        /**
         * Get current Dynamic Scope
         */
        dynamicScope(): DynamicScope;
        popDynamicScope(): void;
        getOwner(): Owner;
        getSelf(): Reference<any>;
        referenceForSymbol(symbol: number): Reference;
        execute(initialize?: (vm: this) => void): RenderResult;
        private _execute;
        next(): RichIteratorResult<null, RenderResult>;
    }
    export interface InitialVmState {
        /**
         * The address of the compiled template. This is converted into a
         * pc when the VM is created.
         */
        handle: number;
        /**
         * Optionally, specify the root scope for the VM. If not specified,
         * the VM will use a root scope with no `this` reference and no
         * symbols.
         */
        scope?: ScopeOptions;
        /**
         *
         */
        tree: TreeBuilder;
        dynamicScope: DynamicScope;
        owner: Owner;
    }
    export interface ClosureState {
        /**
         * The program counter that subsequent evaluations should start from.
         */
        readonly pc: number;
        /**
         * The current value of the VM's scope (which changes whenever a component is invoked or a block
         * with block params is entered).
         */
        readonly scope: Scope;
        /**
         * The current value of the VM's dynamic scope
         */
        readonly dynamicScope: DynamicScope;
        /**
         * A number of stack elements captured during the initial evaluation, and which should be restored
         * to the stack when the block is re-evaluated.
         */
        readonly stack: unknown[];
    }
    /**
     * A closure captures the state of the VM for a particular block of code that is necessary to
     * re-invoke the block in the future.
     *
     * In practice, this allows us to clear the previous render and "replay" the block's execution,
     * rendering content in the same position as the first render.
     */
    export class Closure {
        private state;
        private context;
        constructor(state: ClosureState, context: EvaluationContext);
        evaluate(tree: TreeBuilder): VM;
    }
}