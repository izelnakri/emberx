import { v as valueForRef } from './reference-CG0yPgLy.js';
import { t as track } from './cache-CofLhaS4.js';

const CUSTOM_TAG_FOR = new WeakMap();
function getCustomTagFor(obj) {
  return CUSTOM_TAG_FOR.get(obj);
}
function setCustomTagFor(obj, customTagFn) {
  CUSTOM_TAG_FOR.set(obj, customTagFn);
}
function convertToInt(prop) {
  if (typeof prop === 'symbol') return null;
  const num = Number(prop);
  if (isNaN(num)) return null;
  return num % 1 === 0 ? num : null;
}
function tagForNamedArg(namedArgs, key) {
  return track(() => {
    if (key in namedArgs) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
      valueForRef(namedArgs[key]);
    }
  });
}
function tagForPositionalArg(positionalArgs, key) {
  return track(() => {
    if (key === '[]') {
      // consume all of the tags in the positional array
      positionalArgs.forEach(valueForRef);
    }
    const parsed = convertToInt(key);
    if (parsed !== null && parsed >= 0 && parsed < positionalArgs.length) {
      // consume the tag of the referenced index
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
      valueForRef(positionalArgs[parsed]);
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- @fixme
class NamedArgsProxy {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- @fixme

  constructor(named) {
    this.named = named;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- @fixme
  get(_target, prop) {
    const ref = this.named[prop];
    if (ref !== undefined) {
      return valueForRef(ref);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- @fixme
  has(_target, prop) {
    return prop in this.named;
  }
  ownKeys() {
    return Object.keys(this.named);
  }
  isExtensible() {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- @fixme
  getOwnPropertyDescriptor(_target, prop) {
    return {
      enumerable: true,
      configurable: true
    };
  }
}
class PositionalArgsProxy {
  constructor(positional) {
    this.positional = positional;
  }
  get(target, prop) {
    let {
      positional
    } = this;
    if (prop === 'length') {
      return positional.length;
    }
    const parsed = convertToInt(prop);
    if (parsed !== null && parsed >= 0 && parsed < positional.length) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
      return valueForRef(positional[parsed]);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return target[prop];
  }
  isExtensible() {
    return false;
  }
  has(_target, prop) {
    const parsed = convertToInt(prop);
    return parsed !== null && parsed >= 0 && parsed < this.positional.length;
  }
}
const argsProxyFor = (capturedArgs, type) => {
  const {
    named,
    positional
  } = capturedArgs;
  let getNamedTag = (_obj, key) => tagForNamedArg(named, key);
  let getPositionalTag = (_obj, key) => tagForPositionalArg(positional, key);
  const namedHandler = new NamedArgsProxy(named);
  const positionalHandler = new PositionalArgsProxy(positional);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const namedTarget = Object.create(null);
  const positionalTarget = [];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const namedProxy = new Proxy(namedTarget, namedHandler);
  const positionalProxy = new Proxy(positionalTarget, positionalHandler);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  setCustomTagFor(namedProxy, getNamedTag);
  setCustomTagFor(positionalProxy, getPositionalTag);
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    named: namedProxy,
    positional: positionalProxy
  };
};

export { argsProxyFor as a, getCustomTagFor as g, setCustomTagFor as s };
