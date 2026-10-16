declare module '@glimmer/interfaces/lib/components' {
    import type { Dict } from "@glimmer/interfaces/lib/core.js";
    import type { InternalComponentManager } from "@glimmer/interfaces/lib/managers.js";
    import type { Reference } from "@glimmer/interfaces/lib/references.js";
    import type { ScopeSlot } from "@glimmer/interfaces/lib/runtime.js";
    import type { CompilableProgram } from "@glimmer/interfaces/lib/template.js";
    import type { ProgramSymbolTable } from "@glimmer/interfaces/lib/tier1/symbol-table.js";

    export type ComponentDefinitionState = object;
    export type ComponentInstanceState = unknown;

    const CapabilityBrand: unique symbol;
    export type CapabilityMask = number & {
      [CapabilityBrand]: never;
    };

    export interface ComponentDefinition<
      D extends ComponentDefinitionState = ComponentDefinitionState,
      I = ComponentInstanceState,
      M extends InternalComponentManager<I, D> = InternalComponentManager<I, D>,
    > {
      resolvedName: string | null;
      handle: number;
      state: D;
      manager: M;
      capabilities: CapabilityMask;
      compilable: CompilableProgram | null;
      debugName?: string | undefined;
    }

    export interface ComponentInstance<
      D extends ComponentDefinitionState = ComponentDefinitionState,
      I = ComponentInstanceState,
      M extends InternalComponentManager<I, D> = InternalComponentManager<I, D>,
    > {
      definition: ComponentDefinition<D, I>;
      manager: M;
      capabilities: CapabilityMask;
      state: I;
      handle: number;
      table: ProgramSymbolTable;
      lookup: Record<string, ScopeSlot> | null;
    }

    export interface PreparedArguments {
      positional: ReadonlyArray<Reference>;
      named: Dict<Reference>;
    }
}