import { associateDestroyableChild } from '../@glimmer/destroyable/index.js';
import { c as createComputeRef, a as createConstRef, U as UNDEFINED_REFERENCE } from './reference-CG0yPgLy.js';
import { a as argsProxyFor } from './args-proxy-CCoFtYLS.js';
import { b as buildCapabilities } from './capabilities-BuVYh-vx.js';

function helperCapabilities(managerAPI, options = {}) {
  return buildCapabilities({
    hasValue: Boolean(options.hasValue),
    hasDestroyable: Boolean(options.hasDestroyable),
    hasScheduledEffect: Boolean(options.hasScheduledEffect)
  });
}

////////////

function hasValue(manager) {
  return manager.capabilities.hasValue;
}
function hasDestroyable(manager) {
  return manager.capabilities.hasDestroyable;
}

////////////

class CustomHelperManager {
  constructor(factory) {
    this.factory = factory;
  }
  helperManagerDelegates = new WeakMap();
  undefinedDelegate = null;
  getDelegateForOwner(owner) {
    let delegate = this.helperManagerDelegates.get(owner);
    if (delegate === undefined) {
      let {
        factory
      } = this;
      delegate = factory(owner);
      this.helperManagerDelegates.set(owner, delegate);
    }
    return delegate;
  }
  getDelegateFor(owner) {
    if (owner === undefined) {
      let {
        undefinedDelegate
      } = this;
      if (undefinedDelegate === null) {
        let {
          factory
        } = this;
        this.undefinedDelegate = undefinedDelegate = factory(undefined);
      }
      return undefinedDelegate;
    } else {
      return this.getDelegateForOwner(owner);
    }
  }
  getHelper(definition) {
    return (capturedArgs, owner) => {
      let manager = this.getDelegateFor(owner);
      const args = argsProxyFor(capturedArgs);
      const bucket = manager.createHelper(definition, args);
      if (hasValue(manager)) {
        let cache = createComputeRef(() => manager.getValue(bucket), null, false /* DEBUG */);
        if (hasDestroyable(manager)) {
          associateDestroyableChild(cache, manager.getDestroyable(bucket));
        }
        return cache;
      } else if (hasDestroyable(manager)) {
        let ref = createConstRef(undefined);
        associateDestroyableChild(ref, manager.getDestroyable(bucket));
        return ref;
      } else {
        return UNDEFINED_REFERENCE;
      }
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any

class FunctionHelperManager {
  capabilities = buildCapabilities({
    hasValue: true,
    hasDestroyable: false,
    hasScheduledEffect: false
  });
  createHelper(fn, args) {
    return {
      fn,
      args
    };
  }
  getValue({
    fn,
    args
  }) {
    if (Object.keys(args.named).length > 0) {
      let argsForFn = [...args.positional, args.named];
      return fn(...argsForFn);
    }
    return fn(...args.positional);
  }
  getDebugName(fn) {
    if (fn.name) {
      return `(helper function ${fn.name})`;
    }
    return '(anonymous helper function)';
  }
}

const COMPONENT_MANAGERS = new WeakMap();
const MODIFIER_MANAGERS = new WeakMap();
const HELPER_MANAGERS = new WeakMap();

///////////

/**
 * There is also Reflect.getPrototypeOf,
 * which errors when non-objects are passed.
 *
 * Since our conditional for figuring out whether to render primitives or not
 * may contain non-object values, we don't want to throw errors when we call this.
 */
const getPrototypeOf = Object.getPrototypeOf;
function setManager(map, manager, obj) {
  map.set(obj, manager);
  return obj;
}
function getManager(map, obj) {
  let pointer = obj;
  while (pointer !== null) {
    const manager = map.get(pointer);
    if (manager !== undefined) {
      return manager;
    }
    pointer = getPrototypeOf(pointer);
  }
  return undefined;
}

///////////

function setInternalModifierManager(manager, definition) {
  return setManager(MODIFIER_MANAGERS, manager, definition);
}
function getInternalModifierManager(definition, isOptional) {
  const manager = getManager(MODIFIER_MANAGERS, definition);
  if (manager === undefined) {
    return null;
  }
  return manager;
}
function setInternalHelperManager(manager, definition) {
  return setManager(HELPER_MANAGERS, manager, definition);
}
const DEFAULT_MANAGER = new CustomHelperManager(() => new FunctionHelperManager());
function getInternalHelperManager(definition, isOptional) {
  let manager = getManager(HELPER_MANAGERS, definition);

  // Functions are special-cased because functions are defined
  // as the "default" helper, per: https://github.com/emberjs/rfcs/pull/756
  if (manager === undefined && typeof definition === 'function') {
    manager = DEFAULT_MANAGER;
  }
  if (manager) {
    return manager;
  } else if (isOptional === true) {
    return null;
  } else ;
  return null;
}
function setInternalComponentManager(factory, obj) {
  return setManager(COMPONENT_MANAGERS, factory, obj);
}
function getInternalComponentManager(definition, isOptional) {
  const manager = getManager(COMPONENT_MANAGERS, definition);
  if (manager === undefined) {
    return null;
  }
  return manager;
}

///////////

function hasInternalComponentManager(definition) {
  return getManager(COMPONENT_MANAGERS, definition) !== undefined;
}
function hasInternalHelperManager(definition) {
  return hasDefaultHelperManager(definition) || getManager(HELPER_MANAGERS, definition) !== undefined;
}
function hasInternalModifierManager(definition) {
  return getManager(MODIFIER_MANAGERS, definition) !== undefined;
}
function hasDefaultHelperManager(definition) {
  return typeof definition === 'function';
}

export { CustomHelperManager as C, getInternalHelperManager as a, getInternalModifierManager as b, hasInternalComponentManager as c, hasInternalHelperManager as d, hasInternalModifierManager as e, hasValue as f, getInternalComponentManager as g, hasDestroyable as h, helperCapabilities as i, setInternalHelperManager as j, setInternalModifierManager as k, setInternalComponentManager as s };
