import { meta, peekMeta } from '../@ember/-internals/meta/lib/meta.js';
import { d as descriptorForProperty, a as isClassicDecorator, c as ComputedDescriptor, i as isElementDescriptor, m as makeComputedDecorator, b as descriptorForDecorator } from './decorator-9ikVwsjY.js';
import { c as revalidateObservers, d as flushSyncObservers, e as resumeObserverDeactivation, s as suspendedObserverDeactivation, b as addObserver, g as setObserverSuspended } from './observers-BmobpXAF.js';
import inspect from '../@ember/debug/lib/inspect.js';
import { v as validateTag, u as untrack, U as UPDATE_TAG, a as valueForTag, c as consumeTag, A as ALLOW_CYCLES, t as track } from './cache-CofLhaS4.js';
import { a as tagMetaFor, t as tagFor } from './meta-BJtIZDir.js';
import { m as markObjectAsDirty, b as getChainTagsForKeys, f as finishLazyChains } from './chain-tags-B2J7DsxO.js';

/**
@module @ember/object
*/

const END_WITH_EACH_REGEX = /\.@each$/;

/**
  Expands `pattern`, invoking `callback` for each expansion.

  The only pattern supported is brace-expansion, anything else will be passed
  once to `callback` directly.

  Example

  ```js
  import { expandProperties } from '@ember/object/computed';

  function echo(arg){ console.log(arg); }

  expandProperties('foo.bar', echo);              //=> 'foo.bar'
  expandProperties('{foo,bar}', echo);            //=> 'foo', 'bar'
  expandProperties('foo.{bar,baz}', echo);        //=> 'foo.bar', 'foo.baz'
  expandProperties('{foo,bar}.baz', echo);        //=> 'foo.baz', 'bar.baz'
  expandProperties('foo.{bar,baz}.[]', echo)      //=> 'foo.bar.[]', 'foo.baz.[]'
  expandProperties('{foo,bar}.{spam,eggs}', echo) //=> 'foo.spam', 'foo.eggs', 'bar.spam', 'bar.eggs'
  expandProperties('{foo}.bar.{baz}')             //=> 'foo.bar.baz'
  ```

  @method expandProperties
  @static
  @for @ember/object/computed
  @public
  @param {String} pattern The property pattern to expand.
  @param {Function} callback The callback to invoke.  It is invoked once per
  expansion, and is passed the expansion.
*/
function expandProperties(pattern, callback) {
  let start = pattern.indexOf('{');
  if (start < 0) {
    callback(pattern.replace(END_WITH_EACH_REGEX, '.[]'));
  } else {
    dive('', pattern, start, callback);
  }
}
function dive(prefix, pattern, start, callback) {
  let end = pattern.indexOf('}'),
    i = 0,
    newStart,
    arrayLength;
  let tempArr = pattern.substring(start + 1, end).split(',');
  let after = pattern.substring(end + 1);
  prefix = prefix + pattern.substring(0, start);
  arrayLength = tempArr.length;
  while (i < arrayLength) {
    newStart = after.indexOf('{');
    if (newStart < 0) {
      callback((prefix + tempArr[i++] + after).replace(END_WITH_EACH_REGEX, '.[]'));
    } else {
      dive(prefix + tempArr[i++], after, newStart, callback);
    }
  }
}

/**
@module @ember/object
*/


/**
  NOTE: This is a low-level method used by other parts of the API. You almost
  never want to call this method directly. Instead you should use
  `mixin()` to define new properties.

  Defines a property on an object. This method works much like the ES5
  `Object.defineProperty()` method except that it can also accept computed
  properties and other special descriptors.

  Normally this method takes only three parameters. However if you pass an
  instance of `Descriptor` as the third param then you can pass an
  optional value as the fourth parameter. This is often more efficient than
  creating new descriptor hashes for each property.

  ## Examples

  ```javascript
  import { defineProperty, computed } from '@ember/object';

  // ES5 compatible mode
  defineProperty(contact, 'firstName', {
    writable: true,
    configurable: false,
    enumerable: true,
    value: 'Charles'
  });

  // define a simple property
  defineProperty(contact, 'lastName', undefined, 'Jolley');

  // define a computed property
  defineProperty(contact, 'fullName', computed('firstName', 'lastName', function() {
    return this.firstName+' '+this.lastName;
  }));
  ```

  @public
  @method defineProperty
  @static
  @for @ember/object
  @param {Object} obj the object to define this property on. This may be a prototype.
  @param {String} keyName the name of the property
  @param {Descriptor} [desc] an instance of `Descriptor` (typically a
    computed property) or an ES5 descriptor.
    You must provide this or `data` but not both.
  @param {*} [data] something other than a descriptor, that will
    become the explicit value of this property.
*/
function defineProperty(obj, keyName, desc, data, _meta) {
  let meta$1 = _meta === undefined ? meta(obj) : _meta;
  let previousDesc = descriptorForProperty(obj, keyName, meta$1);
  let wasDescriptor = previousDesc !== undefined;
  if (wasDescriptor) {
    previousDesc.teardown(obj, keyName, meta$1);
  }
  if (isClassicDecorator(desc)) {
    defineDecorator(obj, keyName, desc, meta$1);
  } else if (desc === null || desc === undefined) {
    defineValue(obj, keyName, data, wasDescriptor, true);
  } else {
    // fallback to ES5
    Object.defineProperty(obj, keyName, desc);
  }

  // if key is being watched, override chains that
  // were initialized with the prototype
  if (!meta$1.isPrototypeMeta(obj)) {
    revalidateObservers(obj);
  }
}
function defineDecorator(obj, keyName, desc, meta) {
  let propertyDesc = desc(obj, keyName, undefined, meta, true);
  Object.defineProperty(obj, keyName, propertyDesc);
  return desc;
}
function defineValue(obj, keyName, value, wasDescriptor, enumerable = true) {
  if (wasDescriptor === true || enumerable === false) {
    Object.defineProperty(obj, keyName, {
      configurable: true,
      enumerable,
      writable: true,
      value
    });
  } else {
    {
      obj[keyName] = value;
    }
  }
  return value;
}

/**
 @module ember
 @private
 */

const PROPERTY_DID_CHANGE = Symbol('PROPERTY_DID_CHANGE');
let deferred = 0;

/**
  This function is called just after an object property has changed.
  It will notify any observers and clear caches among other things.

  Normally you will not need to call this method directly but if for some
  reason you can't directly watch a property you can invoke this method
  manually.

  @method notifyPropertyChange
  @for @ember/object
  @param {Object} obj The object with the property that will change
  @param {String} keyName The property key (or path) that will change.
  @param {Meta} [_meta] The objects meta.
  @param {unknown} [value] The new value to set for the property
  @return {void}
  @since 3.1.0
  @public
*/
function notifyPropertyChange(obj, keyName, _meta, value) {
  let meta = _meta === undefined ? peekMeta(obj) : _meta;
  if (meta !== null && (meta.isInitializing() || meta.isPrototypeMeta(obj))) {
    return;
  }
  markObjectAsDirty(obj, keyName);
  if (deferred <= 0) {
    flushSyncObservers();
  }
  if (PROPERTY_DID_CHANGE in obj) {
    // that checks its arguments length, so we have to explicitly not call this with `value`
    // if it is not passed to `notifyPropertyChange`
    if (arguments.length === 4) {
      obj[PROPERTY_DID_CHANGE](keyName, value);
    } else {
      obj[PROPERTY_DID_CHANGE](keyName);
    }
  }
}

/**
  @method beginPropertyChanges
  @chainable
  @private
*/
function beginPropertyChanges() {
  deferred++;
  suspendedObserverDeactivation();
}

/**
  @method endPropertyChanges
  @private
*/
function endPropertyChanges() {
  deferred--;
  if (deferred <= 0) {
    flushSyncObservers();
    resumeObserverDeactivation();
  }
}

/**
  Make a series of property changes together in an
  exception-safe way.

  ```javascript
  Ember.changeProperties(function() {
    obj1.set('foo', mayBlowUpWhenSet);
    obj2.set('bar', baz);
  });
  ```

  @method changeProperties
  @param {Function} callback
  @private
*/
function changeProperties(callback) {
  beginPropertyChanges();
  try {
    callback();
  } finally {
    endPropertyChanges();
  }
}

function noop() {}
/**
  `@computed` is a decorator that turns a JavaScript getter and setter into a
  computed property, which is a _cached, trackable value_. By default the getter
  will only be called once and the result will be cached. You can specify
  various properties that your computed property depends on. This will force the
  cached result to be cleared if the dependencies are modified, and lazily recomputed the next time something asks for it.

  In the following example we decorate a getter - `fullName` -  by calling
  `computed` with the property dependencies (`firstName` and `lastName`) as
  arguments. The `fullName` getter will be called once (regardless of how many
  times it is accessed) as long as its dependencies do not change. Once
  `firstName` or `lastName` are updated any future calls to `fullName` will
  incorporate the new values, and any watchers of the value such as templates
  will be updated:

  ```javascript
  import { computed, set } from '@ember/object';

  class Person {
    constructor(firstName, lastName) {
      set(this, 'firstName', firstName);
      set(this, 'lastName', lastName);
    }

    @computed('firstName', 'lastName')
    get fullName() {
      return `${this.firstName} ${this.lastName}`;
    }
  });

  let tom = new Person('Tom', 'Dale');

  tom.fullName; // 'Tom Dale'
  ```

  You can also provide a setter, which will be used when updating the computed
  property. Ember's `set` function must be used to update the property
  since it will also notify observers of the property:

  ```javascript
  import { computed, set } from '@ember/object';

  class Person {
    constructor(firstName, lastName) {
      set(this, 'firstName', firstName);
      set(this, 'lastName', lastName);
    }

    @computed('firstName', 'lastName')
    get fullName() {
      return `${this.firstName} ${this.lastName}`;
    }

    set fullName(value) {
      let [firstName, lastName] = value.split(' ');

      set(this, 'firstName', firstName);
      set(this, 'lastName', lastName);
    }
  });

  let person = new Person();

  set(person, 'fullName', 'Peter Wagenet');
  person.firstName; // 'Peter'
  person.lastName;  // 'Wagenet'
  ```

  You can also pass a getter function or object with `get` and `set` functions
  as the last argument to the computed decorator. This allows you to define
  computed property _macros_:

  ```js
  import { computed } from '@ember/object';

  function join(...keys) {
    return computed(...keys, function() {
      return keys.map(key => this[key]).join(' ');
    });
  }

  class Person {
    @join('firstName', 'lastName')
    fullName;
  }
  ```

  Note that when defined this way, getters and setters receive the _key_ of the
  property they are decorating as the first argument. Setters receive the value
  they are setting to as the second argument instead. Additionally, setters must
  _return_ the value that should be cached:

  ```javascript
  import { computed, set } from '@ember/object';

  function fullNameMacro(firstNameKey, lastNameKey) {
    return computed(firstNameKey, lastNameKey, {
      get() {
        return `${this[firstNameKey]} ${this[lastNameKey]}`;
      }

      set(key, value) {
        let [firstName, lastName] = value.split(' ');

        set(this, firstNameKey, firstName);
        set(this, lastNameKey, lastName);

        return value;
      }
    });
  }

  class Person {
    constructor(firstName, lastName) {
      set(this, 'firstName', firstName);
      set(this, 'lastName', lastName);
    }

    @fullNameMacro('firstName', 'lastName') fullName;
  });

  let person = new Person();

  set(person, 'fullName', 'Peter Wagenet');
  person.firstName; // 'Peter'
  person.lastName;  // 'Wagenet'
  ```

  Computed properties can also be used in classic classes. To do this, we
  provide the getter and setter as the last argument like we would for a macro,
  and we assign it to a property on the class definition. This is an _anonymous_
  computed macro:

  ```javascript
  import EmberObject, { computed, set } from '@ember/object';

  let Person = EmberObject.extend({
    // these will be supplied by `create`
    firstName: null,
    lastName: null,

    fullName: computed('firstName', 'lastName', {
      get() {
        return `${this.firstName} ${this.lastName}`;
      }

      set(key, value) {
        let [firstName, lastName] = value.split(' ');

        set(this, 'firstName', firstName);
        set(this, 'lastName', lastName);

        return value;
      }
    })
  });

  let tom = Person.create({
    firstName: 'Tom',
    lastName: 'Dale'
  });

  tom.get('fullName') // 'Tom Dale'
  ```

  You can overwrite computed property without setters with a normal property (no
  longer computed) that won't change if dependencies change. You can also mark
  computed property as `.readOnly()` and block all attempts to set it.

  ```javascript
  import { computed, set } from '@ember/object';

  class Person {
    constructor(firstName, lastName) {
      set(this, 'firstName', firstName);
      set(this, 'lastName', lastName);
    }

    @computed('firstName', 'lastName').readOnly()
    get fullName() {
      return `${this.firstName} ${this.lastName}`;
    }
  });

  let person = new Person();
  person.set('fullName', 'Peter Wagenet'); // Uncaught Error: Cannot set read-only property "fullName" on object: <(...):emberXXX>
  ```

  Additional resources:
  - [Decorators RFC](https://github.com/emberjs/rfcs/blob/master/text/0408-decorators.md)
  - [New CP syntax RFC](https://github.com/emberjs/rfcs/blob/master/text/0011-improved-cp-syntax.md)
  - [New computed syntax explained in "Ember 1.12 released" ](https://emberjs.com/blog/2015/05/13/ember-1-12-released.html#toc_new-computed-syntax)

  @class ComputedProperty
  @public
*/
class ComputedProperty extends ComputedDescriptor {
  _readOnly = false;
  _hasConfig = false;
  _getter = undefined;
  _setter = undefined;
  constructor(args) {
    super();
    let maybeConfig = args[args.length - 1];
    if (typeof maybeConfig === 'function' || maybeConfig !== null && typeof maybeConfig === 'object') {
      this._hasConfig = true;
      let config = args.pop();
      if (typeof config === 'function') {
        this._getter = config;
      } else {
        const objectConfig = config;
        this._getter = objectConfig.get || noop;
        this._setter = objectConfig.set;
      }
    }
    if (args.length > 0) {
      this._property(...args);
    }
  }
  setup(obj, keyName, propertyDesc, meta) {
    super.setup(obj, keyName, propertyDesc, meta);
    if (this._hasConfig === false) {
      let {
        get,
        set
      } = propertyDesc;
      if (get !== undefined) {
        this._getter = get;
      }
      if (set !== undefined) {
        this._setter = function setterWrapper(_key, value) {
          let ret = set.call(this, value);
          if (get !== undefined) {
            return typeof ret === 'undefined' ? get.call(this) : ret;
          }
          return ret;
        };
      }
    }
  }
  _property(...passedArgs) {
    let args = [];
    function addArg(property) {
      args.push(property);
    }
    for (let arg of passedArgs) {
      expandProperties(arg, addArg);
    }
    this._dependentKeys = args;
  }
  get(obj, keyName) {
    let meta$1 = meta(obj);
    let tagMeta = tagMetaFor(obj);
    let propertyTag = tagFor(obj, keyName, tagMeta);
    let ret;
    let revision = meta$1.revisionFor(keyName);
    if (revision !== undefined && validateTag(propertyTag, revision)) {
      ret = meta$1.valueFor(keyName);
    } else {
      let {
        _getter,
        _dependentKeys
      } = this;

      // Create a tracker that absorbs any trackable actions inside the CP
      untrack(() => {
        ret = _getter.call(obj, keyName);
      });
      if (_dependentKeys !== undefined) {
        UPDATE_TAG(propertyTag, getChainTagsForKeys(obj, _dependentKeys, tagMeta, meta$1));
      }
      meta$1.setValueFor(keyName, ret);
      meta$1.setRevisionFor(keyName, valueForTag(propertyTag));
      finishLazyChains(meta$1, keyName, ret);
    }
    consumeTag(propertyTag);

    // Add the tag of the returned value if it is an array, since arrays
    // should always cause updates if they are consumed and then changed
    if (Array.isArray(ret)) {
      consumeTag(tagFor(ret, '[]'));
    }
    return ret;
  }
  set(obj, keyName, value) {
    if (this._readOnly) {
      this._throwReadOnlyError(obj, keyName);
    }
    let meta$1 = meta(obj);

    // ensure two way binding works when the component has defined a computed
    // property with both a setter and dependent keys, in that scenario without
    // the sync observer added below the caller's value will never be updated
    //
    // See GH#18147 / GH#19028 for details.
    if (
    // ensure that we only run this once, while the component is being instantiated
    meta$1.isInitializing() && this._dependentKeys !== undefined && this._dependentKeys.length > 0 && typeof obj[PROPERTY_DID_CHANGE] === 'function' && obj.isComponent) {
      addObserver(obj, keyName, () => {
        obj[PROPERTY_DID_CHANGE](keyName);
      }, undefined, true);
    }
    let ret;
    try {
      beginPropertyChanges();
      ret = this._set(obj, keyName, value, meta$1);
      finishLazyChains(meta$1, keyName, ret);
      let tagMeta = tagMetaFor(obj);
      let propertyTag = tagFor(obj, keyName, tagMeta);
      let {
        _dependentKeys
      } = this;
      if (_dependentKeys !== undefined) {
        UPDATE_TAG(propertyTag, getChainTagsForKeys(obj, _dependentKeys, tagMeta, meta$1));
        if (false /* DEBUG */) ;
      }
      meta$1.setRevisionFor(keyName, valueForTag(propertyTag));
    } finally {
      endPropertyChanges();
    }
    return ret;
  }
  _throwReadOnlyError(obj, keyName) {
    throw new Error(`Cannot set read-only property "${keyName}" on object: ${inspect(obj)}`);
  }
  _set(obj, keyName, value, meta) {
    let hadCachedValue = meta.revisionFor(keyName) !== undefined;
    let cachedValue = meta.valueFor(keyName);
    let ret;
    let {
      _setter
    } = this;
    setObserverSuspended(obj, keyName, true);
    try {
      ret = _setter.call(obj, keyName, value, cachedValue);
    } finally {
      setObserverSuspended(obj, keyName, false);
    }

    // allows setter to return the same value that is cached already
    if (hadCachedValue && cachedValue === ret) {
      return ret;
    }
    meta.setValueFor(keyName, ret);
    notifyPropertyChange(obj, keyName, meta, value);
    return ret;
  }

  /* called before property is overridden */
  teardown(obj, keyName, meta) {
    if (meta.revisionFor(keyName) !== undefined) {
      meta.setRevisionFor(keyName, undefined);
      meta.setValueFor(keyName, undefined);
    }
    super.teardown(obj, keyName, meta);
  }
}
class AutoComputedProperty extends ComputedProperty {
  get(obj, keyName) {
    let meta$1 = meta(obj);
    let tagMeta = tagMetaFor(obj);
    let propertyTag = tagFor(obj, keyName, tagMeta);
    let ret;
    let revision = meta$1.revisionFor(keyName);
    if (revision !== undefined && validateTag(propertyTag, revision)) {
      ret = meta$1.valueFor(keyName);
    } else {
      let {
        _getter
      } = this;

      // Create a tracker that absorbs any trackable actions inside the CP
      let tag = track(() => {
        ret = _getter.call(obj, keyName);
      });
      UPDATE_TAG(propertyTag, tag);
      meta$1.setValueFor(keyName, ret);
      meta$1.setRevisionFor(keyName, valueForTag(propertyTag));
      finishLazyChains(meta$1, keyName, ret);
    }
    consumeTag(propertyTag);

    // Add the tag of the returned value if it is an array, since arrays
    // should always cause updates if they are consumed and then changed
    if (Array.isArray(ret)) {
      consumeTag(tagFor(ret, '[]', tagMeta));
    }
    return ret;
  }
}
// TODO: This class can be svelted once `meta` has been deprecated
class ComputedDecoratorImpl extends Function {
  /**
    Call on a computed property to set it into read-only mode. When in this
    mode the computed property will throw an error when set.
     Example:
     ```javascript
    import { computed, set } from '@ember/object';
     class Person {
      @computed().readOnly()
      get guid() {
        return 'guid-guid-guid';
      }
    }
     let person = new Person();
    set(person, 'guid', 'new-guid'); // will throw an exception
    ```
     Classic Class Example:
     ```javascript
    import EmberObject, { computed } from '@ember/object';
     let Person = EmberObject.extend({
      guid: computed(function() {
        return 'guid-guid-guid';
      }).readOnly()
    });
     let person = Person.create();
    person.set('guid', 'new-guid'); // will throw an exception
    ```
     @method readOnly
    @return {ComputedProperty} this
    @chainable
    @public
  */
  readOnly() {
    let desc = descriptorForDecorator(this);
    desc._readOnly = true;
    return this;
  }

  /**
    In some cases, you may want to annotate computed properties with additional
    metadata about how they function or what values they operate on. For example,
    computed property functions may close over variables that are then no longer
    available for introspection. You can pass a hash of these values to a
    computed property.
     Example:
     ```javascript
    import { computed } from '@ember/object';
    import Person from 'my-app/utils/person';
     class Store {
      @computed().meta({ type: Person })
      get person() {
        let personId = this.personId;
        return Person.create({ id: personId });
      }
    }
    ```
     Classic Class Example:
     ```javascript
    import { computed } from '@ember/object';
    import Person from 'my-app/utils/person';
     const Store = EmberObject.extend({
      person: computed(function() {
        let personId = this.get('personId');
        return Person.create({ id: personId });
      }).meta({ type: Person })
    });
    ```
     The hash that you pass to the `meta()` function will be saved on the
    computed property descriptor under the `_meta` key. Ember runtime
    exposes a public API for retrieving these values from classes,
    via the `metaForProperty()` function.
     @method meta
    @param {Object} meta
    @chainable
    @public
  */

  meta(meta) {
    let prop = descriptorForDecorator(this);
    if (arguments.length === 0) {
      return prop._meta || {};
    } else {
      prop._meta = meta;
      return this;
    }
  }

  // TODO: Remove this when we can provide alternatives in the ecosystem to
  // addons such as ember-macro-helpers that use it.
  /** @internal */
  get _getter() {
    return descriptorForDecorator(this)._getter;
  }

  // TODO: Refactor this, this is an internal API only
  /** @internal */
  set enumerable(value) {
    descriptorForDecorator(this).enumerable = value;
  }
}

/**
  This helper returns a new property descriptor that wraps the passed
  computed property function. You can use this helper to define properties with
  native decorator syntax, mixins, or via `defineProperty()`.

  Example:

  ```js
  import { computed, set } from '@ember/object';

  class Person {
    constructor() {
      this.firstName = 'Betty';
      this.lastName = 'Jones';
    },

    @computed('firstName', 'lastName')
    get fullName() {
      return `${this.firstName} ${this.lastName}`;
    }
  }

  let client = new Person();

  client.fullName; // 'Betty Jones'

  set(client, 'lastName', 'Fuller');
  client.fullName; // 'Betty Fuller'
  ```

  Classic Class Example:

  ```js
  import EmberObject, { computed } from '@ember/object';

  let Person = EmberObject.extend({
    init() {
      this._super(...arguments);

      this.firstName = 'Betty';
      this.lastName = 'Jones';
    },

    fullName: computed('firstName', 'lastName', function() {
      return `${this.get('firstName')} ${this.get('lastName')}`;
    })
  });

  let client = Person.create();

  client.get('fullName'); // 'Betty Jones'

  client.set('lastName', 'Fuller');
  client.get('fullName'); // 'Betty Fuller'
  ```

  You can also provide a setter, either directly on the class using native class
  syntax, or by passing a hash with `get` and `set` functions.

  Example:

  ```js
  import { computed, set } from '@ember/object';

  class Person {
    constructor() {
      this.firstName = 'Betty';
      this.lastName = 'Jones';
    },

    @computed('firstName', 'lastName')
    get fullName() {
      return `${this.firstName} ${this.lastName}`;
    }

    set fullName(value) {
      let [firstName, lastName] = value.split(/\s+/);

      set(this, 'firstName', firstName);
      set(this, 'lastName', lastName);

      return value;
    }
  }

  let client = new Person();

  client.fullName; // 'Betty Jones'

  set(client, 'lastName', 'Fuller');
  client.fullName; // 'Betty Fuller'
  ```

  Classic Class Example:

  ```js
  import EmberObject, { computed } from '@ember/object';

  let Person = EmberObject.extend({
    init() {
      this._super(...arguments);

      this.firstName = 'Betty';
      this.lastName = 'Jones';
    },

    fullName: computed('firstName', 'lastName', {
      get(key) {
        return `${this.get('firstName')} ${this.get('lastName')}`;
      },
      set(key, value) {
        let [firstName, lastName] = value.split(/\s+/);
        this.setProperties({ firstName, lastName });
        return value;
      }
    })
  });

  let client = Person.create();
  client.get('firstName'); // 'Betty'

  client.set('fullName', 'Carroll Fuller');
  client.get('firstName'); // 'Carroll'
  ```

  When passed as an argument, the `set` function should accept two parameters,
  `key` and `value`. The value returned from `set` will be the new value of the
  property.

  _Note: This is the preferred way to define computed properties when writing third-party
  libraries that depend on or use Ember, since there is no guarantee that the user
  will have [prototype Extensions](https://guides.emberjs.com/release/configuring-ember/disabling-prototype-extensions/) enabled._

  @method computed
  @for @ember/object
  @static
  @param {String} [dependentKeys*] Optional dependent keys that trigger this computed property.
  @param {Function} func The computed property function.
  @return {ComputedDecorator} property decorator instance
  @public
*/
// @computed without parens or computed with descriptor args

// @computed with keys only

// @computed with keys and config

// @computed with config only

function computed(...args) {
  if (isElementDescriptor(args)) {
    // SAFETY: We passed in the impl for this class
    let decorator = makeComputedDecorator(new ComputedProperty([]), ComputedDecoratorImpl);
    return decorator(args[0], args[1], args[2]);
  }

  // SAFETY: We passed in the impl for this class
  return makeComputedDecorator(new ComputedProperty(args), ComputedDecoratorImpl);
}
function autoComputed(...config) {
  // SAFETY: We passed in the impl for this class
  return makeComputedDecorator(new AutoComputedProperty(config), ComputedDecoratorImpl);
}

/**
  Allows checking if a given property on an object is a computed property. For the most part,
  this doesn't matter (you would normally just access the property directly and use its value),
  but for some tooling specific scenarios (e.g. the ember-inspector) it is important to
  differentiate if a property is a computed property or a "normal" property.

  This will work on either a class's prototype or an instance itself.

  @static
  @method isComputed
  @for @ember/debug
  @private
 */
function isComputed(obj, key) {
  return Boolean(descriptorForProperty(obj, key));
}

export { ComputedProperty as C, PROPERTY_DID_CHANGE as P, endPropertyChanges as a, beginPropertyChanges as b, computed as c, defineProperty as d, expandProperties as e, changeProperties as f, defineValue as g, defineDecorator as h, autoComputed as i, isComputed as j, notifyPropertyChange as n };
