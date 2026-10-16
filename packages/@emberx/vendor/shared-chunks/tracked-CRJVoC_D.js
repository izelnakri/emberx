import { meta } from '../@ember/-internals/meta/lib/meta.js';
import { isEmberArray } from '../@ember/array/-internals.js';
import { c as consumeTag, u as untrack } from './cache-CofLhaS4.js';
import { d as dirtyTagFor, t as tagFor } from './meta-BJtIZDir.js';
import { t as trackedValue, a as trackedData } from './tracked-value-CR6kx-73.js';
import { C as CHAIN_PASS_THROUGH, S as SELF_TAG } from './chain-tags-B2J7DsxO.js';
import { i as isElementDescriptor, C as COMPUTED_SETTERS, s as setClassicDecorator } from './decorator-9ikVwsjY.js';

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

// `PropertyDecorator` covers the `(target, key)` call TypeScript emits for
// native class fields; `ExtendedMethodDecorator` covers the classic-class call.

/**
 * `tracked` as a decorator factory: `@tracked({ equals })`, or on classic
 * classes `tracked({ value })` / `tracked({ initializer })`.
 */

/**
 * `tracked` as a bare decorator: `@tracked foo = 1`.
 */

/**
 * `tracked` as a standalone reactive value, usable outside of classes:
 * `const count = tracked(0)`.
 */

function tracked(...args) {
  if (isElementDescriptor(args)) {
    /*
      Native-decorator form. The runtime invokes us with `(target, key, desc)`
      and consumes the returned `DecoratorPropertyDescriptor`. The public API is
      the decorated field itself — reading it consumes, assigning it dirties.
       ```js
      class Counter {
        @tracked count = 0;
      }
      ```
    */
    return descriptorForField(args);
  }
  if (args.length === 0 || args.length === 1 && isDecoratorOptions(args[0])) {
    /*
      Decorator-factory / classic-field form. Returns an
      `ExtendedMethodDecorator`. The public API is the resulting property on
      instances (get/set), with any default supplied by `value`/`initializer`.
       ```js
      class Counter {
        @tracked({ equals: (a, b) => a === b }) count = 0;
      }
       const Person = EmberObject.extend({
        name: tracked({ value: 'Zoey' }),
      });
      ```
    */
    return makeTrackedDecorator(args[0]);
  }
  let [initialValue, options] = args;
  /*
    Standalone-value form. Returns a `TrackedValue` usable outside of classes.
     ```js
    const count = tracked(0);
     count.value;                // read (consumes), `Object.is`-based equality
    count.value = 1;            // write (dirties)
    count.get();                // function shorthand for reading
    count.set(2);               // returns `true` if the value changed
    count.update((n) => n + 1); // write from current, without consuming
    count.freeze();             // prevent further writes
    ```
  */
  return trackedValue(initialValue, options);
}
const DECORATOR_OPTION_KEYS = ['value', 'initializer', 'equals', 'description'];
function isDecoratorOptions(value) {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  let proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) {
    return false;
  }
  return Object.keys(value).every(key => DECORATOR_OPTION_KEYS.includes(key));
}
function makeTrackedDecorator(propertyDesc) {
  let initializer = propertyDesc ? propertyDesc.initializer : undefined;
  let value = propertyDesc ? propertyDesc.value : undefined;
  let options = {
    equals: propertyDesc?.equals,
    description: propertyDesc?.description
  };
  let decorator = function (target, key, desc, _meta, isClassicDecorator) {
    let fieldDesc = isClassicDecorator ? {
      initializer: initializer || (() => value)
    } : desc;
    return descriptorForField([target, key, fieldDesc], options);
  };
  setClassicDecorator(decorator);
  return decorator;
}
function descriptorForField([target, key, desc], options) {
  let {
    getter,
    setter
  } = trackedData(key, desc ? desc.initializer : undefined);
  let equals = options?.equals;
  function get() {
    let value = getter(this);

    // Add the tag of the returned value if it is an array, since arrays
    // should always cause updates if they are consumed and then changed
    if (Array.isArray(value) || isEmberArray(value)) {
      consumeTag(tagFor(value, '[]'));
    }
    return value;
  }
  function set(newValue) {
    if (equals !== undefined && equals(untrack(() => getter(this)), newValue)) {
      return;
    }
    setter(this, newValue);
    dirtyTagFor(this, SELF_TAG);
  }
  let newDesc = {
    enumerable: true,
    configurable: true,
    isTracked: true,
    get,
    set
  };
  COMPUTED_SETTERS.add(set);
  meta(target).writeDescriptors(key, new TrackedDescriptor(get, set));
  return newDesc;
}
class TrackedDescriptor {
  constructor(_get, _set) {
    this._get = _get;
    this._set = _set;
    CHAIN_PASS_THROUGH.add(this);
  }
  get(obj) {
    return this._get.call(obj);
  }
  set(obj, _key, value) {
    this._set.call(obj, value);
  }
}

export { TrackedDescriptor as T, tracked as t };
