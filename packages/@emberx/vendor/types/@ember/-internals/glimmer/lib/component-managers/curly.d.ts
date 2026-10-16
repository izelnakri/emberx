declare module '@ember/-internals/glimmer/lib/component-managers/curly' {
    import { type default as Owner, type InternalFactory } from "@ember/-internals/owner";
    import type { Nullable } from "@ember/-internals/utility-types";
    import type { Bounds, CapturedArguments, CompilableProgram, Destroyable, ElementOperations, Environment, InternalComponentCapabilities, PreparedArguments, VMArguments, WithCreateInstance, WithDynamicLayout, WithDynamicTagName } from "@glimmer/interfaces";
    import type { Reference } from "@glimmer/reference/lib/reference";
    import type Component from "@ember/-internals/glimmer/lib/component";
    import type { DynamicScope } from "@ember/-internals/glimmer/lib/renderer";
    import type RuntimeResolver from "@ember/-internals/glimmer/lib/resolver";
    import ComponentStateBucket from "@ember/-internals/glimmer/lib/utils/curly-component-state-bucket";
    import { CURLY_MANAGER_BRAND } from "@ember/-internals/glimmer/lib/component-managers/curly-brand";
    export function getComponentCapturedArgs(component: object): CapturedArguments["named"] | undefined;
    export const DIRTY_TAG: unique symbol;
    export const IS_DISPATCHING_ATTRS: unique symbol;
    export const BOUNDS: unique symbol;
    type ComponentFactory = InternalFactory<Component, {
        create(props?: any): Component;
        positionalParams: string | string[] | undefined | null;
        name: string;
    }> & {
        name: string;
        positionalParams: string | string[] | undefined | null;
    };
    export default class CurlyComponentManager implements WithCreateInstance<ComponentStateBucket>, WithDynamicLayout<ComponentStateBucket, RuntimeResolver>, WithDynamicTagName<ComponentStateBucket> {
        readonly [CURLY_MANAGER_BRAND] = true;
        protected templateFor(component: Component): CompilableProgram | null;
        getDynamicLayout(bucket: ComponentStateBucket): CompilableProgram | null;
        getTagName(state: ComponentStateBucket): Nullable<string>;
        getCapabilities(): InternalComponentCapabilities;
        prepareArgs(ComponentClass: ComponentFactory, args: VMArguments): Nullable<PreparedArguments>;
        create(owner: Owner, ComponentClass: ComponentFactory, args: VMArguments, { isInteractive }: Environment, dynamicScope: DynamicScope, callerSelfRef: Reference): ComponentStateBucket;
        getDebugName(definition: ComponentFactory): string;
        getSelf({ rootRef }: ComponentStateBucket): Reference;
        didCreateElement({ component, classRef, isInteractive, rootRef }: ComponentStateBucket, element: Element, operations: ElementOperations): void;
        didRenderLayout(bucket: ComponentStateBucket, bounds: Bounds): void;
        didCreate({ component, isInteractive }: ComponentStateBucket): void;
        update(bucket: ComponentStateBucket): void;
        didUpdateLayout(bucket: ComponentStateBucket): void;
        didUpdate({ component, isInteractive }: ComponentStateBucket): void;
        getDestroyable(bucket: ComponentStateBucket): Nullable<Destroyable>;
    }
    export function processComponentInitializationAssertions(component: Component, props: any): void;
    export function initialRenderInstrumentDetails(component: any): any;
    export const CURLY_COMPONENT_MANAGER: CurlyComponentManager;
    export { isCurlyManager } from "@ember/-internals/glimmer/lib/component-managers/curly-brand";
}