import { m as makeDictionary } from '../../../shared-chunks/dictionary-gc5gpyOG.js';
import { i as intern } from '../../../shared-chunks/intern-zquhAEIg.js';
import { C as Container } from '../../../shared-chunks/container-BYOnjnwz.js';
export { I as INIT_FACTORY, g as getFactoryFor, s as setFactoryFor } from '../../../shared-chunks/container-BYOnjnwz.js';

const VALID_FULL_NAME_REGEXP = /^[^:]+:[^:]+$/;

/**
 A registry used to store factory and option information keyed
 by type.

 A `Registry` stores the factory and option information needed by a
 `Container` to instantiate and cache objects.

 The API for `Registry` is still in flux and should not be considered stable.

 @private
 @class Registry
 @since 1.11.0
*/
class Registry {
  _failSet;
  resolver;
  fallback;
  registrations;
  _normalizeCache;
  _options;
  _resolveCache;
  _typeOptions;
  constructor(options = {}) {
    this.fallback = options.fallback || null;
    this.resolver = options.resolver || null;
    this.registrations = makeDictionary(options.registrations || null);
    this._normalizeCache = makeDictionary(null);
    this._resolveCache = makeDictionary(null);
    this._failSet = new Set();
    this._options = makeDictionary(null);
    this._typeOptions = makeDictionary(null);
  }

  /**
   A backup registry for resolving registrations when no matches can be found.
    @private
   @property fallback
   @type Registry
   */

  /**
   An object that has a `resolve` method that resolves a name.
    @private
   @property resolver
   @type Resolver
   */

  /**
   @private
   @property registrations
   @type InheritingDict
   */

  /**
   @private
    @property _normalizeCache
   @type InheritingDict
   */

  /**
   @private
    @property _resolveCache
   @type InheritingDict
   */

  /**
   @private
    @property _options
   @type InheritingDict
   */

  /**
   @private
    @property _typeOptions
   @type InheritingDict
   */

  /**
   Creates a container based on this registry.
    @private
   @method container
   @param {Object} options
   @return {Container} created container
   */
  container(options) {
    return new Container(this, options);
  }

  /**
   Registers a factory for later injection.
    Example:
    ```javascript
   let registry = new Registry();
    registry.register('model:user', Person, {singleton: false });
   registry.register('fruit:favorite', Orange);
   registry.register('communication:main', Email, {singleton: false});
   ```
    @private
   @method register
   @param {String} fullName
   @param {Function} factory
   @param {Object} options
   */

  register(fullName, factory, options = {}) {
    let normalizedName = this.normalize(fullName);
    this._failSet.delete(normalizedName);
    this.registrations[normalizedName] = factory;
    this._options[normalizedName] = options;
  }

  /**
   Unregister a fullName
    ```javascript
   let registry = new Registry();
   registry.register('model:user', User);
    registry.resolve('model:user').create() instanceof User //=> true
    registry.unregister('model:user')
   registry.resolve('model:user') === undefined //=> true
   ```
    @private
   @method unregister
   @param {String} fullName
   */
  unregister(fullName) {
    let normalizedName = this.normalize(fullName);
    delete this.registrations[normalizedName];
    delete this._resolveCache[normalizedName];
    delete this._options[normalizedName];
    this._failSet.delete(normalizedName);
  }

  /**
   Given a fullName return the corresponding factory.
    By default `resolve` will retrieve the factory from
   the registry.
    ```javascript
   let registry = new Registry();
   registry.register('api:twitter', Twitter);
    registry.resolve('api:twitter') // => Twitter
   ```
    Optionally the registry can be provided with a custom resolver.
   If provided, `resolve` will first provide the custom resolver
   the opportunity to resolve the fullName, otherwise it will fallback
   to the registry.
    ```javascript
   let registry = new Registry();
   registry.resolver = function(fullName) {
      // lookup via the module system of choice
    };
    // the twitter factory is added to the module system
   registry.resolve('api:twitter') // => Twitter
   ```
    @private
   @method resolve
   @param {String} fullName
   @return {Function} fullName's factory
   */
  resolve(fullName) {
    let factory = resolve(this, this.normalize(fullName));
    if (factory === undefined && this.fallback !== null) {
      factory = this.fallback.resolve(fullName);
    }
    return factory;
  }

  /**
   A hook that can be used to describe how the resolver will
   attempt to find the factory.
    For example, the default Ember `.describe` returns the full
   class name (including namespace) where Ember's resolver expects
   to find the `fullName`.
    @private
   @method describe
   @param {String} fullName
   @return {string} described fullName
   */
  describe(fullName) {
    if (this.resolver !== null && this.resolver.lookupDescription) {
      return this.resolver.lookupDescription(fullName);
    } else if (this.fallback !== null) {
      return this.fallback.describe(fullName);
    } else {
      return fullName;
    }
  }

  /**
   A hook to enable custom fullName normalization behavior
    @private
   @method normalizeFullName
   @param {String} fullName
   @return {string} normalized fullName
   */
  normalizeFullName(fullName) {
    if (this.resolver !== null && this.resolver.normalize) {
      return this.resolver.normalize(fullName);
    } else if (this.fallback !== null) {
      return this.fallback.normalizeFullName(fullName);
    } else {
      return fullName;
    }
  }

  /**
   Normalize a fullName based on the application's conventions
    @private
   @method normalize
   @param {String} fullName
   @return {string} normalized fullName
   */
  normalize(fullName) {
    return this._normalizeCache[fullName] || (this._normalizeCache[fullName] = this.normalizeFullName(fullName));
  }

  /**
   @method makeToString
    @private
   @param {any} factory
   @param {string} fullName
   @return {function} toString function
   */
  makeToString(factory, fullName) {
    if (this.resolver !== null && this.resolver.makeToString) {
      return this.resolver.makeToString(factory, fullName);
    } else if (this.fallback !== null) {
      return this.fallback.makeToString(factory, fullName);
    } else {
      return typeof factory === 'string' ? factory : factory.name ?? '(unknown class)';
    }
  }

  /**
   Given a fullName check if the container is aware of its factory
   or singleton instance.
    @private
   @method has
   @param {String} fullName
   @param {Object} [options]
   @param {String} [options.source] the fullname of the request source (used for local lookups)
   @return {Boolean}
   */
  has(fullName) {
    if (!this.isValidFullName(fullName)) {
      return false;
    }
    return has(this, this.normalize(fullName));
  }

  /**
   Allow registering options for all factories of a type.
    ```javascript
   let registry = new Registry();
   let container = registry.container();
    // if all of type `connection` must not be singletons
   registry.optionsForType('connection', { singleton: false });
    registry.register('connection:twitter', TwitterConnection);
   registry.register('connection:facebook', FacebookConnection);
    let twitter = container.lookup('connection:twitter');
   let twitter2 = container.lookup('connection:twitter');
    twitter === twitter2; // => false
    let facebook = container.lookup('connection:facebook');
   let facebook2 = container.lookup('connection:facebook');
    facebook === facebook2; // => false
   ```
    @private
   @method optionsForType
   @param {String} type
   @param {Object} options
   */
  optionsForType(type, options) {
    this._typeOptions[type] = options;
  }
  getOptionsForType(type) {
    let optionsForType = this._typeOptions[type];
    if (optionsForType === undefined && this.fallback !== null) {
      optionsForType = this.fallback.getOptionsForType(type);
    }
    return optionsForType;
  }

  /**
   @private
   @method options
   @param {String} fullName
   @param {Object} options
   */
  options(fullName, options) {
    let normalizedName = this.normalize(fullName);
    this._options[normalizedName] = options;
  }
  getOptions(fullName) {
    let normalizedName = this.normalize(fullName);
    let options = this._options[normalizedName];
    if (options === undefined && this.fallback !== null) {
      options = this.fallback.getOptions(fullName);
    }
    return options;
  }
  getOption(fullName, optionName) {
    let options = this._options[fullName];
    if (options !== undefined && options[optionName] !== undefined) {
      return options[optionName];
    }
    let type = fullName.split(':')[0];
    options = this._typeOptions[type];
    if (options && options[optionName] !== undefined) {
      return options[optionName];
    } else if (this.fallback !== null) {
      return this.fallback.getOption(fullName, optionName);
    }
    return undefined;
  }

  /**
   @private
   @method knownForType
   @param {String} type the type to iterate over
  */
  knownForType(type) {
    let localKnown = makeDictionary(null);
    let registeredNames = Object.keys(this.registrations);
    for (let fullName of registeredNames) {
      let itemType = fullName.split(':')[0];
      if (itemType === type) {
        localKnown[fullName] = true;
      }
    }
    let fallbackKnown, resolverKnown;
    if (this.fallback !== null) {
      fallbackKnown = this.fallback.knownForType(type);
    }
    if (this.resolver !== null && this.resolver.knownForType) {
      resolverKnown = this.resolver.knownForType(type);
    }
    return Object.assign({}, fallbackKnown, localKnown, resolverKnown);
  }
  isValidFullName(fullName) {
    return VALID_FULL_NAME_REGEXP.test(fullName);
  }
}
function resolve(registry, _normalizedName) {
  let normalizedName = _normalizedName;
  let cached = registry._resolveCache[normalizedName];
  if (cached !== undefined) {
    return cached;
  }
  if (registry._failSet.has(normalizedName)) {
    return;
  }
  let resolved;
  if (registry.resolver) {
    resolved = registry.resolver.resolve(normalizedName);
  }
  if (resolved === undefined) {
    resolved = registry.registrations[normalizedName];
  }
  if (resolved === undefined) {
    registry._failSet.add(normalizedName);
  } else {
    registry._resolveCache[normalizedName] = resolved;
  }
  return resolved;
}
function has(registry, fullName) {
  return registry.resolve(fullName) !== undefined;
}
const privateNames = makeDictionary(null);
const privateSuffix = `${Math.random()}${Date.now()}`.replace('.', '');
function privatize([fullName]) {
  let name = privateNames[fullName];
  if (name) {
    return name;
  }
  let [type, rawName] = fullName.split(':');
  return privateNames[fullName] = intern(`${type}:${rawName}-${privateSuffix}`);
}

export { Container, Registry, privatize };
