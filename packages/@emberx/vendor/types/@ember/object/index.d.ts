declare module '@ember/object' {
    import type { ElementDescriptor, ExtendedMethodDecorator } from "@ember/-internals/metal/lib/decorator";
    import type { AnyFn } from "@ember/-internals/utility-types";
    import CoreObject from "@ember/object/core";
    import Observable from "@ember/object/observable";
    export { notifyPropertyChange } from "@ember/-internals/metal/lib/property_events";
    export { defineProperty } from "@ember/-internals/metal/lib/properties";
    export { get } from "@ember/-internals/metal/lib/property_get";
    export { set, trySet } from "@ember/-internals/metal/lib/property_set";
    export { default as getProperties } from "@ember/-internals/metal/lib/get_properties";
    export { default as setProperties } from "@ember/-internals/metal/lib/set_properties";
    export { default as computed } from "@ember/-internals/metal/lib/computed";
    /**
    @module @ember/object
    */
    /**
      `EmberObject` is the main base class for all Ember objects. It is a subclass
      of `CoreObject` with the `Observable` mixin applied. For details,
      see the documentation for each of these.

      @class EmberObject
      @extends CoreObject
      @uses Observable
      @public
    */
    interface EmberObject extends Observable {
    }
    const EmberObject_base: Readonly<typeof CoreObject> & (new (owner?: import("@ember/owner").default) => CoreObject) & import("@ember/object/mixin").default;
    class EmberObject extends EmberObject_base {
        get _debugContainerKey(): false | `${string}:${string}`;
    }
    export default EmberObject;
    export function action(
      target: ElementDescriptor[0],
      key: ElementDescriptor[1],
      desc: ElementDescriptor[2]
    ): PropertyDescriptor;
    export function action(desc: PropertyDescriptor): ExtendedMethodDecorator;
    type ObserverDefinition<T extends AnyFn> = {
        dependentKeys: string[];
        fn: T;
        sync: boolean;
    };
    /**
      Specify a method that observes property changes.

      ```javascript
      import EmberObject from '@ember/object';
      import { observer } from '@ember/object';

      export default EmberObject.extend({
        valueObserver: observer('value', function() {
          // Executes whenever the "value" property changes
        })
      });
      ```

      While observers are still supported, there are [plans to deprecate them](https://github.com/emberjs/rfcs/pull/1115)
      See the [in-progress deprecation guide](https://github.com/ember-learn/deprecation-app/pull/1407)
      for guidance on how to avoid using observers.
     
      @method observer
      @for @ember/object
      @param {String} propertyNames*
      @param {Function} func
      @return func
      @public
      @static
    */
    export function observer<T extends AnyFn>(
      ...args: [propertyName: string, ...additionalPropertyNames: string[], func: T] | [ObserverDefinition<T>]
    ): T;
}