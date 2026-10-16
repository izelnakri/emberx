declare module '@glimmer/manager/lib/public/component' {
    import type { Arguments, ComponentCapabilities, ComponentCapabilitiesVersions, ComponentDefinitionState, ComponentManager, ComponentManagerWithAsyncLifeCycleCallbacks, ComponentManagerWithAsyncUpdateHook, ComponentManagerWithDestructors, ComponentManagerWithUpdateHook, Destroyable, InternalComponentCapabilities, InternalComponentManager, Nullable, Owner, VMArguments } from "@glimmer/interfaces";
    import type { Reference } from "@glimmer/reference/lib/reference";
    import type { ManagerFactory } from "@glimmer/manager/lib/public/api";
    export function componentCapabilities<Version extends keyof ComponentCapabilitiesVersions>(managerAPI: Version, options?: ComponentCapabilitiesVersions[Version]): ComponentCapabilities;
    export function hasAsyncLifeCycleCallbacks<ComponentInstance>(delegate: ComponentManager<ComponentInstance>): delegate is ComponentManagerWithAsyncLifeCycleCallbacks<ComponentInstance>;
    export function hasUpdateHook<ComponentInstance>(delegate: ComponentManager<ComponentInstance>): delegate is ComponentManagerWithUpdateHook<ComponentInstance>;
    export function hasAsyncUpdateHook<ComponentInstance>(delegate: ComponentManager<ComponentInstance>): delegate is ComponentManagerWithAsyncUpdateHook<ComponentInstance>;
    export function hasDestructors<ComponentInstance>(delegate: ComponentManager<ComponentInstance>): delegate is ComponentManagerWithDestructors<ComponentInstance>;
    /**
      The CustomComponentManager allows addons to provide custom component
      implementations that integrate seamlessly into Ember. This is accomplished
      through a delegate, registered with the custom component manager, which
      implements a set of hooks that determine component behavior.

      To create a custom component manager, instantiate a new CustomComponentManager
      class and pass the delegate as the first argument:

      ```js
      let manager = new CustomComponentManager({
        // ...delegate implementation...
      });
      ```

      ## Delegate Hooks

      Throughout the lifecycle of a component, the component manager will invoke
      delegate hooks that are responsible for surfacing those lifecycle changes to
      the end developer.

      * `create()` - invoked when a new instance of a component should be created
      * `update()` - invoked when the arguments passed to a component change
      * `getContext()` - returns the object that should be
    */
    export class CustomComponentManager<O extends Owner, ComponentInstance> implements InternalComponentManager<CustomComponentState<ComponentInstance>> {
        private factory;
        private componentManagerDelegates;
        constructor(factory: ManagerFactory<O, ComponentManager<ComponentInstance>>);
        private getDelegateFor;
        create(owner: O, definition: ComponentDefinitionState, vmArgs: VMArguments): CustomComponentState<ComponentInstance>;
        getDebugName(definition: ComponentDefinitionState): string;
        update(bucket: CustomComponentState<ComponentInstance>): void;
        didCreate({ component, delegate }: CustomComponentState<ComponentInstance>): void;
        didUpdate({ component, delegate }: CustomComponentState<ComponentInstance>): void;
        didRenderLayout(): void;
        didUpdateLayout(): void;
        getSelf({ component, delegate }: CustomComponentState<ComponentInstance>): Reference;
        getDestroyable(bucket: CustomComponentState<ComponentInstance>): Nullable<Destroyable>;
        getCapabilities(): InternalComponentCapabilities;
    }
    /**
     * Stores internal state about a component instance after it's been created.
     */
    export class CustomComponentState<ComponentInstance> {
        component: ComponentInstance;
        delegate: ComponentManager<ComponentInstance>;
        args: Arguments;
        constructor(component: ComponentInstance, delegate: ComponentManager<ComponentInstance>, args: Arguments);
    }
}