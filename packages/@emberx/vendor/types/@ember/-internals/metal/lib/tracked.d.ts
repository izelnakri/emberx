declare module '@ember/-internals/metal/lib/tracked' {
    import { type TrackedValue } from "@glimmer/validator/lib/tracked-value";
    import type { ExtendedMethodDecorator, DecoratorPropertyDescriptor } from "@ember/-internals/metal/lib/decorator";
    /**
      @decorator
      @private

      Marks a property as tracked.

      By default, a component's properties are expected to be static,
      meaning you are not able to update them and have the template update accordingly.
      Marking a property as tracked means that when that property changes,
      a rerender of the component is scheduled so the template is kept up to date.

      There are two usages for the `@tracked` decorator, shown below.

      @example No dependencies

      If you don't pass an argument to `@tracked`, only changes to that property
      will be tracked:

      ```typescript
      import Component from '@glimmer/component';
      import { tracked } from '@glimmer/tracking';

      export default class MyComponent extends Component {
        @tracked
        remainingApples = 10
      }
      ```

      When something changes the component's `remainingApples` property, the rerender
      will be scheduled.

      @example Dependents

      In the case that you have a computed property that depends other
      properties, you want to track both so that when one of the
      dependents change, a rerender is scheduled.

      In the following example we have two properties,
      `eatenApples`, and `remainingApples`.

      ```typescript
      import Component from '@glimmer/component';
      import { tracked } from '@glimmer/tracking';

      const totalApples = 100;

      export default class MyComponent extends Component {
        @tracked
        eatenApples = 0

        get remainingApples() {
          return totalApples - this.eatenApples;
        }

        increment() {
          this.eatenApples = this.eatenApples + 1;
        }
      }
      ```

      @param dependencies Optional dependents to be tracked.
    */
    /**
     * Reactivity options for the standalone `tracked(value, options)` form.
     *
     * - `equals` decides whether writing a value notifies consumers; it defaults to
     *   `Object.is`.
     * - `description` is used in development for debugging.
     *
     * `equals` is a function-typed property (rather than method syntax) on purpose:
     * this keeps its parameters checked strictly, so passing an `equals` typed for
     * the wrong value type is a type error instead of being silently accepted.
     */
    interface TrackedValueOptions<Value> {
        equals?: (a: Value, b: Value) => boolean;
        description?: string;
    }
    /**
     * Options for `tracked` used as a decorator, or as a field on a *classic* class
     * (`EmberObject.extend({ foo: tracked({ value }) })`).
     *
     * All properties are optional because this single shape backs several usages:
     * classic-field defaults (`tracked({ value })` / `tracked({ initializer })`) and
     * options-only native decorators (`@tracked({ equals })`). The mutually
     * exclusive combinations (e.g. both `value` and `initializer`) and the
     * classic-only restriction on `value`/`initializer` are enforced at runtime via
     * assertions rather than in the type, matching the runtime `isDecoratorOptions`
     * check that accepts any object composed of these keys.
     *
     * - `value` / `initializer` supply a default value and are only valid on classic
     *   classes; native classes use class field initializers instead.
     * - `equals` / `description` configure reactivity, mirroring
     *   {@link TrackedValueOptions}.
     */
    interface TrackedDecoratorOptions {
        value?: any;
        initializer?: () => any;
        equals?(a: any, b: any): boolean;
        description?: string;
    }
    export type TrackedDecorator = ExtendedMethodDecorator & PropertyDecorator;
    /**
     * `tracked` as a decorator factory: `@tracked({ equals })`, or on classic
     * classes `tracked({ value })` / `tracked({ initializer })`.
     */
    export function tracked(propertyDesc: TrackedDecoratorOptions): TrackedDecorator;
    /**
     * `tracked` as a bare decorator: `@tracked foo = 1`.
     */
    export function tracked(target: object, key: string): void;
    export function tracked(target: object, key: string, desc: DecoratorPropertyDescriptor): DecoratorPropertyDescriptor;
    /**
     * `tracked` as a standalone reactive value, usable outside of classes:
     * `const count = tracked(0)`.
     */
    export function tracked<Value>(initialValue: Value, options?: TrackedValueOptions<Value>): TrackedValue<Value>;
    export class TrackedDescriptor {
        private _get;
        private _set;
        constructor(_get: () => unknown, _set: (value: unknown) => void);
        get(obj: object): unknown;
        set(obj: object, _key: string, value: unknown): void;
    }
    export {};
}