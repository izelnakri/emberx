declare module '@glimmer/interfaces/lib/runtime/local-debug' {
    import type { SimpleElement } from "@simple-dom/interface";

    import type { Nullable } from "@glimmer/interfaces/lib/core.js";
    import type { AppendingBlock } from "@glimmer/interfaces/lib/dom/attributes.js";
    import type { Cursor } from "@glimmer/interfaces/lib/dom/bounds.js";
    import type { EvaluationContext } from "@glimmer/interfaces/lib/program.js";
    import type { BlockMetadata } from "@glimmer/interfaces/lib/template.js";
    import type { DynamicScope, Scope, ScopeSlot } from "@glimmer/interfaces/lib/runtime/scope.js";
    import type { UpdatingBlockOpcode, UpdatingOpcode } from "@glimmer/interfaces/lib/runtime/vm.js";

    export type MachineRegisters = [$pc: number, $ra: number, $fp: number, $sp: number];

    export type DebugRegisters = readonly [
      $pc: number,
      $ra: number,
      $fp: number,
      $sp: number,
      $s0: unknown,
      $s1: unknown,
      $t0: unknown,
      $t1: unknown,
      $v0: unknown,
    ];

    type Handle = number;

    export interface DebugTemplates {
      readonly active: Nullable<BlockMetadata>;
      register(handle: Handle, metadata: BlockMetadata): void;
      willCall(handle: Handle): void;
      return(): void;
    }

    export interface DebugVmTrace {
      readonly willCall: (handle: Handle) => void;
      readonly return: () => void;
      readonly register: (handle: Handle, metadata: BlockMetadata) => void;
    }

    /**
     * All parts of `DebugVmState` are _snapshots_. They will not change if the piece of VM state that
     * they reference changes.
     */
    export interface DebugVmSnapshot {
      /**
       * These values are the same for the entire program
       */
      readonly context: EvaluationContext;

      /**
       * These values can change for each opcode. You can get a snapshot a specific stack by calling
       * `stacks.<name>.snapshot()`.
       */
      readonly stacks: DebugStacks;

      readonly elements: {
        blocks: AppendingBlock[];
        cursors: Cursor[];
        constructing: Nullable<SimpleElement>;
      };

      readonly stack: unknown[];
      readonly scope: ScopeSlot[];
      readonly registers: DebugRegisters;
      readonly template: Nullable<BlockMetadata>;
    }

    export interface DebugStacks {
      scope: Scope[];
      dynamicScope: DynamicScope[];
      updating: UpdatingOpcode[][];
      cache: UpdatingOpcode[];
      list: UpdatingBlockOpcode[];
      destroyable: object[];
    }
}