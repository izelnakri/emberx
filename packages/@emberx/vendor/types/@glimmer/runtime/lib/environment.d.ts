declare module '@glimmer/runtime/lib/environment' {
    import type { ClassicResolver, ComponentInstanceWithCreate, Environment, EnvironmentOptions, GlimmerTreeChanges, GlimmerTreeConstruction, ModifierInstance, Nullable, RuntimeArtifacts, RuntimeOptions, Transaction, TransactionSymbol } from "@glimmer/interfaces";
    import DebugRenderTree from "@glimmer/runtime/lib/debug-render-tree";
    export const TRANSACTION: TransactionSymbol;
    class TransactionImpl implements Transaction {
        scheduledInstallModifiers: ModifierInstance[];
        scheduledUpdateModifiers: ModifierInstance[];
        createdComponents: ComponentInstanceWithCreate[];
        updatedComponents: ComponentInstanceWithCreate[];
        didCreate(component: ComponentInstanceWithCreate): void;
        didUpdate(component: ComponentInstanceWithCreate): void;
        scheduleInstallModifier(modifier: ModifierInstance): void;
        scheduleUpdateModifier(modifier: ModifierInstance): void;
        commit(): void;
    }
    export class EnvironmentImpl implements Environment {
        private delegate;
        [TRANSACTION]: Nullable<TransactionImpl>;
        protected appendOperations: GlimmerTreeConstruction;
        protected updateOperations?: GlimmerTreeChanges | undefined;
        isInteractive: boolean;
        isArgumentCaptureError: ((error: any) => boolean) | undefined;
        debugRenderTree: DebugRenderTree<object> | undefined;
        constructor(options: EnvironmentOptions, delegate: EnvironmentDelegate);
        getAppendOperations(): GlimmerTreeConstruction;
        getDOM(): GlimmerTreeChanges;
        begin(): void;
        private get transaction();
        didCreate(component: ComponentInstanceWithCreate): void;
        didUpdate(component: ComponentInstanceWithCreate): void;
        scheduleInstallModifier(modifier: ModifierInstance): void;
        scheduleUpdateModifier(modifier: ModifierInstance): void;
        commit(): void;
    }
    export interface EnvironmentDelegate {
        /**
         * Used to determine the the environment is interactive (e.g. SSR is not
         * interactive). Interactive environments schedule modifiers, among other things.
         */
        isInteractive: boolean;
        /**
         * Used to enable debug tooling
         */
        enableDebugTooling: boolean;
        /**
         * Callback to be called when an environment transaction commits
         */
        onTransactionCommit: () => void;
    }
    export function runtimeOptions(
     options: EnvironmentOptions,
     delegate: EnvironmentDelegate,
     artifacts: RuntimeArtifacts,
     resolver: Nullable<ClassicResolver>
    ): RuntimeOptions;
    export function inTransaction(env: Environment, block: () => void): void;
    export default EnvironmentImpl;
}