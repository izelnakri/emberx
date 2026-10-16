import { peekMeta, meta } from '../-internals/meta/lib/meta.js';
import { R as ROOT, o as observerListenerMetaFor, w as wrap } from '../../shared-chunks/super-BBBjgF69.js';
import { n as nativeDescDecorator, a as isClassicDecorator, b as descriptorForDecorator, m as makeComputedDecorator } from '../../shared-chunks/decorator-9ikVwsjY.js';
import { g as defineValue, h as defineDecorator, C as ComputedProperty } from '../../shared-chunks/computed-BNdMwGhH.js';
import { s as setUnprocessedMixins } from '../../shared-chunks/namespace_search-BfvzEQzN.js';
import { c as revalidateObservers, b as addObserver, r as removeObserver } from '../../shared-chunks/observers-BmobpXAF.js';
import { a as addListener, r as removeListener } from '../../shared-chunks/events-DYrYz3V8.js';

/**
@module @ember/object/mixin
*/
const a_concat = Array.prototype.concat;
function extractAccessors(properties) {
  if (properties !== undefined) {
    for (let key of Object.keys(properties)) {
      let desc = Object.getOwnPropertyDescriptor(properties, key);
      if (desc.get !== undefined || desc.set !== undefined) {
        Object.defineProperty(properties, key, {
          value: nativeDescDecorator(desc)
        });
      }
    }
  }
  return properties;
}
function concatenatedMixinProperties(concatProp, props, values, base) {
  // reset before adding each new mixin to pickup concats from previous
  let concats = values[concatProp] || base[concatProp];
  if (props[concatProp]) {
    concats = concats ? a_concat.call(concats, props[concatProp]) : props[concatProp];
  }
  return concats;
}
function giveDecoratorSuper(key, decorator, property, descs) {
  if (property === true) {
    return decorator;
  }
  let originalGetter = property._getter;
  if (originalGetter === undefined) {
    return decorator;
  }
  let superDesc = descs[key];

  // Check to see if the super property is a decorator first, if so load its descriptor
  let superProperty = typeof superDesc === 'function' ? descriptorForDecorator(superDesc) : superDesc;
  if (superProperty === undefined || superProperty === true) {
    return decorator;
  }
  let superGetter = superProperty._getter;
  if (superGetter === undefined) {
    return decorator;
  }
  let get = wrap(originalGetter, superGetter);
  let set;
  let originalSetter = property._setter;
  let superSetter = superProperty._setter;
  if (superSetter !== undefined) {
    if (originalSetter !== undefined) {
      set = wrap(originalSetter, superSetter);
    } else {
      // If the super property has a setter, we default to using it no matter what.
      // This is clearly very broken and weird, but it's what was here so we have
      // to keep it until the next major at least.
      //
      // TODO: Add a deprecation here.
      set = superSetter;
    }
  } else {
    set = originalSetter;
  }

  // only create a new CP if we must
  if (get !== originalGetter || set !== originalSetter) {
    // Since multiple mixins may inherit from the same parent, we need
    // to clone the computed property so that other mixins do not receive
    // the wrapped version.
    let dependentKeys = property._dependentKeys || [];
    let newProperty = new ComputedProperty([...dependentKeys, {
      get,
      set
    }]);
    newProperty._readOnly = property._readOnly;
    newProperty._meta = property._meta;
    newProperty.enumerable = property.enumerable;

    // SAFETY: We passed in the impl for this class
    return makeComputedDecorator(newProperty, ComputedProperty);
  }
  return decorator;
}
function giveMethodSuper(key, method, values, descs) {
  // Methods overwrite computed properties, and do not call super to them.
  if (descs[key] !== undefined) {
    return method;
  }

  // Find the original method in a parent mixin
  let superMethod = values[key];

  // Only wrap the new method if the original method was a function
  if (typeof superMethod === 'function') {
    return wrap(method, superMethod);
  }
  return method;
}
function simpleMakeArray(value) {
  if (!value) {
    return [];
  } else if (!Array.isArray(value)) {
    return [value];
  } else {
    return value;
  }
}
function applyConcatenatedProperties(key, value, values) {
  let baseValue = values[key];
  let ret = simpleMakeArray(baseValue).concat(simpleMakeArray(value));
  return ret;
}
function applyMergedProperties(key, value, values) {
  let baseValue = values[key];
  if (!baseValue) {
    return value;
  }
  let newBase = Object.assign({}, baseValue);
  let hasFunction = false;
  let props = Object.keys(value);
  for (let prop of props) {
    let propValue = value[prop];
    if (typeof propValue === 'function') {
      hasFunction = true;
      newBase[prop] = giveMethodSuper(prop, propValue, baseValue, {});
    } else {
      newBase[prop] = propValue;
    }
  }
  if (hasFunction) {
    newBase._super = ROOT;
  }
  return newBase;
}
function mergeMixins(mixins, meta, descs, values, base, keys, keysWithSuper) {
  let currentMixin;
  for (let i = 0; i < mixins.length; i++) {
    currentMixin = mixins[i];
    if (MIXINS.has(currentMixin)) {
      if (meta.hasMixin(currentMixin)) {
        continue;
      }
      meta.addMixin(currentMixin);
      let {
        properties,
        mixins
      } = currentMixin;
      if (properties !== undefined) {
        mergeProps(meta, properties, descs, values, base, keys, keysWithSuper);
      } else if (mixins !== undefined) {
        mergeMixins(mixins, meta, descs, values, base, keys, keysWithSuper);
        if (currentMixin instanceof Mixin && currentMixin._without !== undefined) {
          currentMixin._without.forEach(keyName => {
            // deleting the key means we won't process the value
            let index = keys.indexOf(keyName);
            if (index !== -1) {
              keys.splice(index, 1);
            }
          });
        }
      }
    } else {
      mergeProps(meta, currentMixin, descs, values, base, keys, keysWithSuper);
    }
  }
}
function mergeProps(meta, props, descs, values, base, keys, keysWithSuper) {
  let concats = concatenatedMixinProperties('concatenatedProperties', props, values, base);
  let mergings = concatenatedMixinProperties('mergedProperties', props, values, base);
  let propKeys = Object.keys(props);
  for (let key of propKeys) {
    let value = props[key];
    if (value === undefined) continue;
    if (keys.indexOf(key) === -1) {
      keys.push(key);
      let desc = meta.peekDescriptors(key);
      if (desc === undefined) {
        // If the value is a classic decorator, we don't want to actually
        // access it, because that will execute the decorator while we're
        // building the class.
        if (!isClassicDecorator(value)) {
          // The superclass did not have a CP, which means it may have
          // observers or listeners on that property.
          let prev = values[key] = base[key];
          if (typeof prev === 'function') {
            updateObserversAndListeners(base, key, prev, false);
          }
        }
      } else {
        descs[key] = desc;

        // The super desc will be overwritten on descs, so save off the fact that
        // there was a super so we know to Object.defineProperty when writing
        // the value
        keysWithSuper.push(key);
        desc.teardown(base, key, meta);
      }
    }
    let isFunction = typeof value === 'function';
    if (isFunction) {
      let desc = descriptorForDecorator(value);
      if (desc !== undefined) {
        // Wrap descriptor function to implement _super() if needed
        descs[key] = giveDecoratorSuper(key, value, desc, descs);
        values[key] = undefined;
        continue;
      }
    }
    if (concats && concats.indexOf(key) >= 0 || key === 'concatenatedProperties' || key === 'mergedProperties') {
      value = applyConcatenatedProperties(key, value, values);
    } else if (mergings && mergings.indexOf(key) > -1) {
      value = applyMergedProperties(key, value, values);
    } else if (isFunction) {
      value = giveMethodSuper(key, value, values, descs);
    }
    values[key] = value;
    descs[key] = undefined;
  }
}
function updateObserversAndListeners(obj, key, fn, add) {
  let meta = observerListenerMetaFor(fn);
  if (meta === undefined) return;
  let {
    observers,
    listeners
  } = meta;
  if (observers !== undefined) {
    let updateObserver = add ? addObserver : removeObserver;
    for (let path of observers.paths) {
      updateObserver(obj, path, null, key, observers.sync);
    }
  }
  if (listeners !== undefined) {
    let updateListener = add ? addListener : removeListener;
    for (let listener of listeners) {
      updateListener(obj, listener, null, key);
    }
  }
}
function applyMixin(obj, mixins, _hideKeys = false) {
  let descs = Object.create(null);
  let values = Object.create(null);
  let meta$1 = meta(obj);
  let keys = [];
  let keysWithSuper = [];
  obj._super = ROOT;

  // Go through all mixins and hashes passed in, and:
  //
  // * Handle concatenated properties
  // * Handle merged properties
  // * Set up _super wrapping if necessary
  // * Set up computed property descriptors
  // * Copying `toString` in broken browsers
  mergeMixins(mixins, meta$1, descs, values, obj, keys, keysWithSuper);
  for (let key of keys) {
    let value = values[key];
    let desc = descs[key];
    if (value !== undefined) {
      if (typeof value === 'function') {
        updateObserversAndListeners(obj, key, value, true);
      }
      defineValue(obj, key, value, keysWithSuper.indexOf(key) !== -1, !_hideKeys);
    } else if (desc !== undefined) {
      defineDecorator(obj, key, desc, meta$1);
    }
  }
  if (!meta$1.isPrototypeMeta(obj)) {
    revalidateObservers(obj);
  }
  return obj;
}

/**
  @method mixin
  @param obj
  @param mixins*
  @return obj
  @private
*/
function mixin(obj, ...args) {
  applyMixin(obj, args);
  return obj;
}
const MIXINS = new WeakSet();

/**
  The `Mixin` class allows you to create mixins, whose properties can be
  added to other classes. For instance,

  ```javascript
  import Mixin from '@ember/object/mixin';

  const EditableMixin = Mixin.create({
    edit() {
      console.log('starting to edit');
      this.set('isEditing', true);
    },
    isEditing: false
  });
  ```

  ```javascript
  import EmberObject from '@ember/object';
  import EditableMixin from '../mixins/editable';

  // Mix mixins into classes by passing them as the first arguments to
  // `.extend.`
  class Comment extends EmberObject.extend(EditableMixin) {
    post = null
  }

  let comment = Comment.create({
    post: somePost
  });

  comment.edit(); // outputs 'starting to edit'
  ```

  Note that Mixins are created with `Mixin.create`, not
  `Mixin.extend`.

  Note that mixins extend a constructor's prototype so arrays and object literals
  defined as properties will be shared amongst objects that implement the mixin.
  If you want to define a property in a mixin that is not shared, you can define
  it either as a computed property or have it be created on initialization of the object.

  ```javascript
  // filters array will be shared amongst any object implementing mixin
  import Mixin from '@ember/object/mixin';
  import { A } from '@ember/array';

  const FilterableMixin = Mixin.create({
    filters: A()
  });
  ```

  ```javascript
  import Mixin from '@ember/object/mixin';
  import { A } from '@ember/array';
  import { computed } from '@ember/object';

  // filters will be a separate array for every object implementing the mixin
  const FilterableMixin = Mixin.create({
    filters: computed(function() {
      return A();
    })
  });
  ```

  ```javascript
  import Mixin from '@ember/object/mixin';
  import { A } from '@ember/array';

  // filters will be created as a separate array during the object's initialization
  const Filterable = Mixin.create({
    filters: null,

    init() {
      this._super(...arguments);
      this.set("filters", A());
    }
  });
  ```

  @class Mixin
  @public
*/
class Mixin {
  /** @internal */

  /** @internal */
  mixins;

  /** @internal */
  properties;

  /** @internal */
  ownerConstructor;

  /** @internal */
  _without;
  /** @internal */
  constructor(mixins, properties) {
    MIXINS.add(this);
    this.properties = extractAccessors(properties);
    this.mixins = buildMixinsArray(mixins);
    this.ownerConstructor = undefined;
    this._without = undefined;
  }

  /**
    @method create
    @for @ember/object/mixin
    @static
    @param arguments*
    @public
  */
  static create(...args) {
    setUnprocessedMixins();
    let M = this;
    return new M(args, undefined);
  }

  // returns the mixins currently applied to the specified object
  // TODO: Make `mixin`
  /** @internal */
  static mixins(obj) {
    let meta = peekMeta(obj);
    let ret = [];
    if (meta === null) {
      return ret;
    }
    meta.forEachMixins(currentMixin => {
      // skip primitive mixins since these are always anonymous
      if (!currentMixin.properties) {
        ret.push(currentMixin);
      }
    });
    return ret;
  }

  /**
    @method reopen
    @param arguments*
    @private
    @internal
  */
  reopen(...args) {
    if (args.length === 0) {
      return this;
    }
    if (this.properties) {
      let currentMixin = new Mixin(undefined, this.properties);
      this.properties = undefined;
      this.mixins = [currentMixin];
    } else if (!this.mixins) {
      this.mixins = [];
    }
    this.mixins = this.mixins.concat(buildMixinsArray(args));
    return this;
  }

  /**
    @method apply
    @param obj
    @return applied object
    @private
    @internal
  */
  apply(obj, _hideKeys = false) {
    // Ember.NativeArray is a normal Ember.Mixin that we mix into `Array.prototype` when prototype extensions are enabled
    // mutating a native object prototype like this should _not_ result in enumerable properties being added (or we have significant
    // issues with things like deep equality checks from test frameworks, or things like jQuery.extend(true, [], [])).
    //
    // _hideKeys disables enumerablity when applying the mixin. This is a hack, and we should stop mutating the array prototype by default 😫
    return applyMixin(obj, [this], _hideKeys);
  }

  /** @internal */
  applyPartial(obj) {
    return applyMixin(obj, [this]);
  }

  /**
    @method detect
    @param obj
    @return {Boolean}
    @private
    @internal
  */
  detect(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }
    if (MIXINS.has(obj)) {
      return _detect(obj, this);
    }
    let meta = peekMeta(obj);
    if (meta === null) {
      return false;
    }
    return meta.hasMixin(this);
  }

  /** @internal */
  without(...args) {
    let ret = new Mixin([this]);
    ret._without = args;
    return ret;
  }

  /** @internal */
  keys() {
    let keys = _keys(this);
    return keys;
  }

  /** @internal */
  toString() {
    return '(unknown mixin)';
  }
}
function buildMixinsArray(mixins) {
  let length = mixins && mixins.length || 0;
  let m = undefined;
  if (length > 0) {
    m = new Array(length);
    for (let i = 0; i < length; i++) {
      let x = mixins[i];
      if (MIXINS.has(x)) {
        m[i] = x;
      } else {
        m[i] = new Mixin(undefined, x);
      }
    }
  }
  return m;
}
function _detect(curMixin, targetMixin, seen = new Set()) {
  if (seen.has(curMixin)) {
    return false;
  }
  seen.add(curMixin);
  if (curMixin === targetMixin) {
    return true;
  }
  let mixins = curMixin.mixins;
  if (mixins) {
    return mixins.some(mixin => _detect(mixin, targetMixin, seen));
  }
  return false;
}
function _keys(mixin, ret = new Set(), seen = new Set()) {
  if (seen.has(mixin)) {
    return;
  }
  seen.add(mixin);
  if (mixin.properties) {
    let props = Object.keys(mixin.properties);
    for (let prop of props) {
      ret.add(prop);
    }
  } else if (mixin.mixins) {
    mixin.mixins.forEach(x => _keys(x, ret, seen));
  }
  return ret;
}

export { applyMixin, Mixin as default, mixin };
