import { meta, peekMeta } from '../@ember/-internals/meta/lib/meta.js';

// Same as built-in MethodDecorator but with more arguments

function isElementDescriptor(args) {
  let [maybeTarget, maybeKey, maybeDesc] = args;
  return (
    // Ensure we have the right number of args
    args.length === 3 && (
    // Make sure the target is a class or object (prototype)
    typeof maybeTarget === 'function' || typeof maybeTarget === 'object' && maybeTarget !== null) &&
    // Make sure the key is a string
    typeof maybeKey === 'string' && (
    // Make sure the descriptor is the right shape
    typeof maybeDesc === 'object' && maybeDesc !== null || maybeDesc === undefined)
  );
}
function nativeDescDecorator(propertyDesc) {
  let decorator = function () {
    return propertyDesc;
  };
  setClassicDecorator(decorator);
  return decorator;
}

/**
  Objects of this type can implement an interface to respond to requests to
  get and set. The default implementation handles simple properties.

  @class Descriptor
  @private
*/
class ComputedDescriptor {
  enumerable = true;
  configurable = true;
  _dependentKeys = undefined;
  _meta = undefined;
  setup(_obj, keyName, _propertyDesc, meta) {
    meta.writeDescriptors(keyName, this);
  }
  teardown(_obj, keyName, meta) {
    meta.removeDescriptors(keyName);
  }
}
function DESCRIPTOR_GETTER_FUNCTION(name, descriptor) {
  function getter() {
    return descriptor.get(this, name);
  }
  return getter;
}
function DESCRIPTOR_SETTER_FUNCTION(name, descriptor) {
  let set = function CPSETTER_FUNCTION(value) {
    return descriptor.set(this, name, value);
  };
  COMPUTED_SETTERS.add(set);
  return set;
}
const COMPUTED_SETTERS = new WeakSet();
function makeComputedDecorator(desc, DecoratorClass) {
  let decorator = function COMPUTED_DECORATOR(target, key, propertyDesc, maybeMeta, isClassicDecorator) {
    let meta$1 = arguments.length === 3 ? meta(target) : maybeMeta;
    desc.setup(target, key, propertyDesc, meta$1);
    let computedDesc = {
      enumerable: desc.enumerable,
      configurable: desc.configurable,
      get: DESCRIPTOR_GETTER_FUNCTION(key, desc),
      set: DESCRIPTOR_SETTER_FUNCTION(key, desc)
    };
    return computedDesc;
  };
  setClassicDecorator(decorator, desc);
  Object.setPrototypeOf(decorator, DecoratorClass.prototype);
  return decorator;
}

/////////////

const DECORATOR_DESCRIPTOR_MAP = new WeakMap();

/**
  Returns the CP descriptor associated with `obj` and `keyName`, if any.

  @method descriptorForProperty
  @param {Object} obj the object to check
  @param {String} keyName the key to check
  @return {Descriptor}
  @private
*/
function descriptorForProperty(obj, keyName, _meta) {
  let meta = _meta === undefined ? peekMeta(obj) : _meta;
  if (meta !== null) {
    return meta.peekDescriptors(keyName);
  }
}
function descriptorForDecorator(dec) {
  return DECORATOR_DESCRIPTOR_MAP.get(dec);
}

/**
  Check whether a value is a decorator

  @method isClassicDecorator
  @param {any} possibleDesc the value to check
  @return {boolean}
  @private
*/
function isClassicDecorator(dec) {
  return typeof dec === 'function' && DECORATOR_DESCRIPTOR_MAP.has(dec);
}

/**
  Set a value as a decorator

  @method setClassicDecorator
  @param {function} decorator the value to mark as a decorator
  @private
*/
function setClassicDecorator(dec, value = true) {
  DECORATOR_DESCRIPTOR_MAP.set(dec, value);
}

export { COMPUTED_SETTERS as C, isClassicDecorator as a, descriptorForDecorator as b, ComputedDescriptor as c, descriptorForProperty as d, isElementDescriptor as i, makeComputedDecorator as m, nativeDescDecorator as n, setClassicDecorator as s };
