declare module '@glimmer/interfaces/lib/runtime/environment' {
    import type { SimpleDocument } from "@simple-dom/interface";

    import type {
      ComponentDefinitionState,
      ComponentInstance,
      ComponentInstanceState,
    } from "@glimmer/interfaces/lib/components.js";
    import type { Nullable } from "@glimmer/interfaces/lib/core.js";
    import type { GlimmerTreeChanges, GlimmerTreeConstruction } from "@glimmer/interfaces/lib/dom/changes.js";
    import type { WithCreateInstance } from "@glimmer/interfaces/lib/managers.js";
    import type { ClassicResolver } from "@glimmer/interfaces/lib/program.js";
    import type { DebugRenderTree } from "@glimmer/interfaces/lib/runtime/debug-render-tree.js";
    import type { ModifierInstance } from "@glimmer/interfaces/lib/runtime/modifier.js";
    import type { Program } from "@glimmer/interfaces/lib/runtime/runtime.js";

    export interface EnvironmentOptions {
      document?: SimpleDocument;
      appendOperations?: GlimmerTreeConstruction;
      updateOperations?: GlimmerTreeChanges;
    }

    export type Transaction = object;

    const TransactionSymbol: unique symbol;
    export type TransactionSymbol = typeof TransactionSymbol;

    export type ComponentInstanceWithCreate = ComponentInstance<
      ComponentDefinitionState,
      ComponentInstanceState,
      WithCreateInstance
    >;

    export interface Environment {
      [TransactionSymbol]: Nullable<Transaction>;

      didCreate(component: ComponentInstanceWithCreate): void;
      didUpdate(component: ComponentInstanceWithCreate): void;

      scheduleInstallModifier(modifier: ModifierInstance): void;
      scheduleUpdateModifier(modifier: ModifierInstance): void;

      begin(): void;
      commit(): void;

      getDOM(): GlimmerTreeChanges;
      getAppendOperations(): GlimmerTreeConstruction;

      isInteractive: boolean;
      debugRenderTree?: DebugRenderTree | undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isArgumentCaptureError?: ((error: any) => boolean) | undefined;
    }

    export interface RuntimeOptions {
      readonly env: Environment;
      readonly program: Program;
      readonly resolver: ClassicResolver | null;
    }
}