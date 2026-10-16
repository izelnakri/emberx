import { E as ENV } from '../../shared-chunks/env-DXxsTFkM.js';
import { s as setClassicDecorator, i as isElementDescriptor } from '../../shared-chunks/decorator-9ikVwsjY.js';
import { e as expandProperties } from '../../shared-chunks/computed-BNdMwGhH.js';
export { c as computed, d as defineProperty, n as notifyPropertyChange } from '../../shared-chunks/computed-BNdMwGhH.js';
import { g as getFactoryFor } from '../../shared-chunks/container-BYOnjnwz.js';
import { s as setObservers } from '../../shared-chunks/super-BBBjgF69.js';
import CoreObject from './core.js';
import Observable from './observable.js';
export { g as get } from '../../shared-chunks/property_get-DuDs6rLg.js';
export { s as set, t as trySet } from '../../shared-chunks/property_set-BmAQ0MGK.js';
export { g as getProperties } from '../../shared-chunks/get_properties-CkJ_mhLz.js';
export { s as setProperties } from '../../shared-chunks/set_properties-DYiBfzdk.js';

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
// eslint-disable-next-line @typescript-eslint/no-empty-object-type

class EmberObject extends CoreObject.extend(Observable) {
  get _debugContainerKey() {
    let factory = getFactoryFor(this);
    return factory !== undefined && factory.fullName;
  }
}

/**
  Decorator that turns the target function into an Action which can be accessed
  directly by reference.

  ```gjs
  import Component from '@glimmer/component';
  import { tracked } from '@glimmer/tracking';
  import { action } from '@ember/object';

  export default class Tooltip extends Component {
    @tracked isShowing = false;

    @action
    toggleShowing() {
      this.isShowing = !this.isShowing;
    }
    
    <template>
      <button {{on "click" this.toggleShowing}}>Show tooltip</button>
    
      {{#if isShowing}}
        <div class="tooltip">
          I'm a tooltip!
        </div>
      {{/if}}
    </template>
  }
  ```

  It also binds the function directly to the instance, so it can be used in any
  context and will correctly refer to the class it came from:

  ```gjs
  import Component from '@glimmer/component';
  import { tracked } from '@glimmer/tracking';
  import { action } from '@ember/object';

  export default class Tooltip extends Component {
    constructor() {
      super(...arguments);

      // this.toggleShowing is still bound correctly when added to
      // the event listener
      document.addEventListener('click', this.toggleShowing);
    }

    @tracked isShowing = false;

    @action
    toggleShowing() {
      this.isShowing = !this.isShowing;
    }
    
    <template>
      {{!-- ...--}}
    </template>
  }
  ```

  @public
  @method action
  @for @ember/object
  @static
  @param {Function|undefined} callback The function to turn into an action,
                                       when used in classic classes
  @return {PropertyDecorator} property decorator instance
*/

const BINDINGS_MAP = new WeakMap();
function hasProto(obj) {
  return obj != null && obj.constructor !== undefined && typeof obj.constructor.proto === 'function';
}
function setupAction(target, key, actionFn) {
  if (hasProto(target)) {
    target.constructor.proto();
  }
  if (!Object.prototype.hasOwnProperty.call(target, 'actions')) {
    let parentActions = target.actions;
    // we need to assign because of the way mixins copy actions down when inheriting
    target.actions = parentActions ? Object.assign({}, parentActions) : {};
  }
  target.actions[key] = actionFn;
  return {
    get() {
      let bindings = BINDINGS_MAP.get(this);
      if (bindings === undefined) {
        bindings = new Map();
        BINDINGS_MAP.set(this, bindings);
      }
      let fn = bindings.get(actionFn);
      if (fn === undefined) {
        fn = actionFn.bind(this);
        bindings.set(actionFn, fn);
      }
      return fn;
    }
  };
}
function action(...args) {
  let actionFn;
  if (!isElementDescriptor(args)) {
    actionFn = args[0];
    let decorator = function (target, key, _desc, _meta, isClassicDecorator) {
      return setupAction(target, key, actionFn);
    };
    setClassicDecorator(decorator);
    return decorator;
  }
  let [target, key, desc] = args;
  actionFn = desc?.value;
  return setupAction(target, key, actionFn);
}

// SAFETY: TS types are weird with decorators. This should work.
setClassicDecorator(action);

// ..........................................................
// OBSERVER HELPER
//

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
function observer(...args) {
  let funcOrDef = args.pop();
  let func;
  let dependentKeys;
  let sync;
  if (typeof funcOrDef === 'function') {
    func = funcOrDef;
    dependentKeys = args;
    sync = !ENV._DEFAULT_ASYNC_OBSERVERS;
  } else {
    func = funcOrDef.fn;
    dependentKeys = funcOrDef.dependentKeys;
    sync = funcOrDef.sync;
  }
  let paths = [];
  for (let dependentKey of dependentKeys) {
    expandProperties(dependentKey, path => paths.push(path));
  }
  setObservers(func, {
    paths,
    sync
  });
  return func;
}

export { action, EmberObject as default, observer };
