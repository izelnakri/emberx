declare module '@glimmer/interfaces/lib/runtime/modifier' {
    import type { InternalModifierManager } from "@glimmer/interfaces/lib/managers.js";

    export type ModifierDefinitionState = object;
    export type ModifierInstanceState = unknown;

    export interface ModifierDefinition<
      I = unknown,
      D extends ModifierDefinitionState = ModifierDefinitionState,
    > {
      resolvedName: string | null;
      manager: InternalModifierManager<I, D>;
      state: ModifierDefinitionState;
    }

    export interface ModifierInstance {
      definition: ModifierDefinition;
      state: ModifierInstanceState;
      manager: InternalModifierManager;
    }
}