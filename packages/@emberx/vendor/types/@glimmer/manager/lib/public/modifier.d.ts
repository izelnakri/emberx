declare module '@glimmer/manager/lib/public/modifier' {
    import type { Arguments, CapturedArguments, InternalModifierManager, ModifierCapabilities, ModifierCapabilitiesVersions, ModifierManager, Owner, SimpleElement, UpdatableTag } from "@glimmer/interfaces";
    import type { ManagerFactory } from "@glimmer/manager/lib/public";
    export function modifierCapabilities<Version extends keyof ModifierCapabilitiesVersions>(
        managerAPI: Version,
        optionalFeatures?: ModifierCapabilitiesVersions[Version]
    ): ModifierCapabilities;
    export interface CustomModifierState<ModifierInstance> {
        tag: UpdatableTag;
        element: SimpleElement;
        modifier: ModifierInstance;
        delegate: ModifierManager<ModifierInstance>;
        args: Arguments;
        debugName?: string;
    }
    /**
      The CustomModifierManager allows addons to provide custom modifier
      implementations that integrate seamlessly into Ember. This is accomplished
      through a delegate, registered with the custom modifier manager, which
      implements a set of hooks that determine modifier behavior.
      To create a custom modifier manager, instantiate a new CustomModifierManager
      class and pass the delegate as the first argument:

      ```js
      let manager = new CustomModifierManager({
        // ...delegate implementation...
      });
      ```

      ## Delegate Hooks

      Throughout the lifecycle of a modifier, the modifier manager will invoke
      delegate hooks that are responsible for surfacing those lifecycle changes to
      the end developer.
      * `createModifier()` - invoked when a new instance of a modifier should be created
      * `installModifier()` - invoked when the modifier is installed on the element
      * `updateModifier()` - invoked when the arguments passed to a modifier change
      * `destroyModifier()` - invoked when the modifier is about to be destroyed
    */
    export class CustomModifierManager<O extends Owner, ModifierInstance> implements InternalModifierManager<CustomModifierState<ModifierInstance>> {
        private factory;
        private componentManagerDelegates;
        constructor(factory: ManagerFactory<O, ModifierManager<ModifierInstance>>);
        private getDelegateFor;
        create(owner: O, element: SimpleElement, definition: object, capturedArgs: CapturedArguments): CustomModifierState<ModifierInstance>;
        getDebugName(definition: object): string;
        getDebugInstance({ modifier }: CustomModifierState<ModifierInstance>): ModifierInstance;
        getTag({ tag }: CustomModifierState<ModifierInstance>): UpdatableTag;
        install({ element, args, modifier, delegate }: CustomModifierState<ModifierInstance>): void;
        update({ args, modifier, delegate }: CustomModifierState<ModifierInstance>): void;
        getDestroyable(state: CustomModifierState<ModifierInstance>): CustomModifierState<ModifierInstance>;
    }
    export function reifyArgs({ named, positional }: CapturedArguments): {
        named: Record<string, unknown>;
        positional: unknown[];
    };
}