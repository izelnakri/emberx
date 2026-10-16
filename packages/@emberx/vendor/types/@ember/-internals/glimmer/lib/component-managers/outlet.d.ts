declare module '@ember/-internals/glimmer/lib/component-managers/outlet' {
    import type { InternalOwner } from "@ember/-internals/owner";
    import type { Nullable } from "@ember/-internals/utility-types";
    import type EngineInstance from "@ember/engine/instance";
    import type { CompilableProgram, ComponentDefinition, CustomRenderNode, Destroyable, Environment, InternalComponentCapabilities, VMArguments, WithCreateInstance, WithCustomDebugRenderTree } from "@glimmer/interfaces";
    import type { Reference } from "@glimmer/reference/lib/reference";
    import type { DynamicScope } from "@ember/-internals/glimmer/lib/renderer";
    import type { OutletState } from "@ember/-internals/glimmer/lib/utils/outlet";
    import type OutletView from "@ember/-internals/glimmer/lib/views/outlet";
    interface OutletInstanceState {
        engine?: {
            instance: EngineInstance;
            mountPoint: string;
        };
        finalize: () => void;
    }
    export interface OutletDefinitionState {
        ref: Reference<OutletState | undefined>;
        name: string;
        template: object;
        controller: unknown;
    }
    class OutletComponentManager implements WithCreateInstance<OutletInstanceState, OutletDefinitionState>, WithCustomDebugRenderTree<OutletInstanceState, OutletDefinitionState> {
        create(_owner: InternalOwner, definition: OutletDefinitionState, _args: VMArguments, env: Environment, dynamicScope: DynamicScope): OutletInstanceState;
        getDebugName({ name }: OutletDefinitionState): string;
        getDebugCustomRenderTree(_definition: OutletDefinitionState, state: OutletInstanceState): CustomRenderNode[];
        getCapabilities(): InternalComponentCapabilities;
        getSelf(): Reference<undefined>;
        didCreate(): void;
        didUpdate(): void;
        didRenderLayout(state: OutletInstanceState): void;
        didUpdateLayout(): void;
        getDestroyable(): Nullable<Destroyable>;
    }
    export class OutletComponent implements ComponentDefinition<OutletDefinitionState, OutletInstanceState, OutletComponentManager> {
        state: OutletDefinitionState;
        handle: number;
        resolvedName: null;
        manager: OutletComponentManager;
        capabilities: import("@glimmer/interfaces").CapabilityMask;
        compilable: CompilableProgram;
        constructor(owner: InternalOwner, state: OutletDefinitionState);
    }
    export function createRootOutlet(outletView: OutletView): OutletComponent;
    export {};
}