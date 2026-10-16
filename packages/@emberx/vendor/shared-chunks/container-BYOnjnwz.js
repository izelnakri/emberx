import { setOwner } from '../@ember/-internals/owner/index.js';
import { m as makeDictionary } from './dictionary-gc5gpyOG.js';

/**
 A container used to instantiate and cache objects.

 Every `Container` must be associated with a `Registry`, which is referenced
 to determine the factory and options that should be used to instantiate
 objects.

 The public API for `Container` is still in flux and should not be considered
 stable.

 @private
 @class Container
 */
class Container {
  static _leakTracking;
  owner;
  registry;
  cache;
  factoryManagerCache;
  validationCache;
  isDestroyed;
  isDestroying;
  constructor(registry, options = {}) {
    this.registry = registry;
    this.owner = options.owner || null;
    this.cache = makeDictionary(options.cache || null);
    this.factoryManagerCache = makeDictionary(options.factoryManagerCache || null);
    this.isDestroyed = false;
    this.isDestroying = false;
  }

  /**
   @private
   @property registry
   @type Registry
   @since 1.11.0
   */

  /**
   @private
   @property cache
   @type InheritingDict
   */

  /**
   @private
   @property validationCache
   @type InheritingDict
   */

  /**
   Given a fullName return a corresponding instance.
    The default behavior is for lookup to return a singleton instance.
   The singleton is scoped to the container, allowing multiple containers
   to all have their own locally scoped singletons.
    ```javascript
   let registry = new Registry();
   let container = registry.container();
    registry.register('api:twitter', Twitter);
    let twitter = container.lookup('api:twitter');
    twitter instanceof Twitter; // => true
    // by default the container will return singletons
   let twitter2 = container.lookup('api:twitter');
   twitter2 instanceof Twitter; // => true
    twitter === twitter2; //=> true
   ```
    If singletons are not wanted, an optional flag can be provided at lookup.
    ```javascript
   let registry = new Registry();
   let container = registry.container();
    registry.register('api:twitter', Twitter);
    let twitter = container.lookup('api:twitter', { singleton: false });
   let twitter2 = container.lookup('api:twitter', { singleton: false });
    twitter === twitter2; //=> false
   ```
    @private
   @method lookup
   @param {String} fullName
   @param {RegisterOptions} [options]
   @return {any}
   */
  lookup(fullName, options) {
    if (this.isDestroyed) {
      throw new Error(`Cannot call \`.lookup('${fullName}')\` after the owner has been destroyed`);
    }
    return lookup(this, this.registry.normalize(fullName), options);
  }

  /**
   A depth first traversal, destroying the container, its descendant containers and all
   their managed objects.
    @private
   @method destroy
   */
  destroy() {
    this.isDestroying = true;
    destroyDestroyables(this);
  }
  finalizeDestroy() {
    resetCache(this);
    this.isDestroyed = true;
  }

  /**
   Clear either the entire cache or just the cache for a particular key.
    @private
   @method reset
   @param {String} fullName optional key to reset; if missing, resets everything
  */
  reset(fullName) {
    if (this.isDestroyed) return;
    if (fullName === undefined) {
      destroyDestroyables(this);
      resetCache(this);
    } else {
      resetMember(this, this.registry.normalize(fullName));
    }
  }

  /**
   Returns an object that can be used to provide an owner to a
   manually created instance.
    @private
   @method ownerInjection
   @returns { Object }
  */
  ownerInjection() {
    let injection = {};
    setOwner(injection, this.owner);
    return injection;
  }

  /**
   Given a fullName, return the corresponding factory. The consumer of the factory
   is responsible for the destruction of any factory instances, as there is no
   way for the container to ensure instances are destroyed when it itself is
   destroyed.
    @public
   @method factoryFor
   @param {String} fullName
   @return {any}
   */
  factoryFor(fullName) {
    if (this.isDestroyed) {
      throw new Error(`Cannot call \`.factoryFor('${fullName}')\` after the owner has been destroyed`);
    }
    let normalizedName = this.registry.normalize(fullName);
    return factoryFor(this, normalizedName, fullName);
  }
}
function isSingleton(container, fullName) {
  return container.registry.getOption(fullName, 'singleton') !== false;
}
function isInstantiatable(container, fullName) {
  return container.registry.getOption(fullName, 'instantiate') !== false;
}
function lookup(container, fullName, options = {}) {
  let normalizedName = fullName;
  if (options.singleton === true || options.singleton === undefined && isSingleton(container, fullName)) {
    let cached = container.cache[normalizedName];
    if (cached !== undefined) {
      return cached;
    }
  }
  return instantiateFactory(container, normalizedName, fullName, options);
}
function factoryFor(container, normalizedName, fullName) {
  let cached = container.factoryManagerCache[normalizedName];
  if (cached !== undefined) {
    return cached;
  }
  let factory = container.registry.resolve(normalizedName);
  if (factory === undefined) {
    return;
  }
  let manager = new InternalFactoryManager(container, factory, fullName, normalizedName);
  container.factoryManagerCache[normalizedName] = manager;
  return manager;
}
function isSingletonClass(container, fullName, {
  instantiate,
  singleton
}) {
  return singleton !== false && !instantiate && isSingleton(container, fullName) && !isInstantiatable(container, fullName);
}
function isSingletonInstance(container, fullName, {
  instantiate,
  singleton
}) {
  return singleton !== false && instantiate !== false && (singleton === true || isSingleton(container, fullName)) && isInstantiatable(container, fullName);
}
function isFactoryClass(container, fullname, {
  instantiate,
  singleton
}) {
  return instantiate === false && (singleton === false || !isSingleton(container, fullname)) && !isInstantiatable(container, fullname);
}
function isFactoryInstance(container, fullName, {
  instantiate,
  singleton
}) {
  return instantiate !== false && (singleton === false || !isSingleton(container, fullName)) && isInstantiatable(container, fullName);
}
function instantiateFactory(container, normalizedName, fullName, options) {
  let factoryManager = factoryFor(container, normalizedName, fullName);
  if (factoryManager === undefined) {
    return;
  }

  // SomeClass { singleton: true, instantiate: true } | { singleton: true } | { instantiate: true } | {}
  // By default majority of objects fall into this case
  if (isSingletonInstance(container, fullName, options)) {
    let instance = container.cache[normalizedName] = factoryManager.create();

    // if this lookup happened _during_ destruction (emits a deprecation, but
    // is still possible) ensure that it gets destroyed
    if (container.isDestroying) {
      if (typeof instance.destroy === 'function') {
        instance.destroy();
      }
    }
    return instance;
  }

  // SomeClass { singleton: false, instantiate: true }
  if (isFactoryInstance(container, fullName, options)) {
    return factoryManager.create();
  }

  // SomeClass { singleton: true, instantiate: false } | { instantiate: false } | { singleton: false, instantiation: false }
  if (isSingletonClass(container, fullName, options) || isFactoryClass(container, fullName, options)) {
    return factoryManager.class;
  }
  throw new Error('Could not create factory');
}
function destroyDestroyables(container) {
  let cache = container.cache;
  let keys = Object.keys(cache);
  for (let key of keys) {
    let value = cache[key];
    if (value.destroy) {
      value.destroy();
    }
  }
}
function resetCache(container) {
  container.cache = makeDictionary(null);
  container.factoryManagerCache = makeDictionary(null);
}
function resetMember(container, fullName) {
  let member = container.cache[fullName];
  delete container.factoryManagerCache[fullName];
  if (member) {
    delete container.cache[fullName];
    if (member.destroy) {
      member.destroy();
    }
  }
}
const INIT_FACTORY = Symbol('INIT_FACTORY');
function getFactoryFor(obj) {
  // SAFETY: since we know `obj` is an `object`, we also know we can safely ask
  // whether a key is set on it.
  return obj[INIT_FACTORY];
}
function setFactoryFor(obj, factory) {
  // SAFETY: since we know `obj` is an `object`, we also know we can safely set
  // a key it safely at this location. (The only way this could be blocked is if
  // someone has gone out of their way to use `Object.defineProperty()` with our
  // internal-only symbol and made it `writable: false`.)
  obj[INIT_FACTORY] = factory;
}
class InternalFactoryManager {
  container;
  owner;
  class;
  fullName;
  normalizedName;
  madeToString;
  injections;
  constructor(container, factory, fullName, normalizedName) {
    this.container = container;
    this.owner = container.owner;
    this.class = factory;
    this.fullName = fullName;
    this.normalizedName = normalizedName;
    this.madeToString = undefined;
    this.injections = undefined;
  }
  toString() {
    if (this.madeToString === undefined) {
      this.madeToString = this.container.registry.makeToString(this.class, this.fullName);
    }
    return this.madeToString;
  }
  create(options) {
    let {
      container
    } = this;
    if (container.isDestroyed) {
      throw new Error(`Cannot create new instances after the owner has been destroyed (you attempted to create ${this.fullName})`);
    }
    let props = options ? {
      ...options
    } : {};
    setOwner(props, container.owner);
    setFactoryFor(props, this);
    return this.class.create(props);
  }
}

export { Container as C, INIT_FACTORY as I, getFactoryFor as g, setFactoryFor as s };
