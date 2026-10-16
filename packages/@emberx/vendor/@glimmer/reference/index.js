import { toIterator, getPath } from '../global-context/index.js';
import { E as EMPTY_ARRAY } from '../../shared-chunks/array-utils-CZQxrdD3.js';
import { c as isIndexable } from '../../shared-chunks/collections-GpG8lT2g.js';
import { D as DIRTY_TAG, c as consumeTag, r as createTag } from '../../shared-chunks/cache-CofLhaS4.js';
import { c as createComputeRef, v as valueForRef } from '../../shared-chunks/reference-CG0yPgLy.js';
export { F as FALSE_REFERENCE, N as NULL_REFERENCE, R as REFERENCE, T as TRUE_REFERENCE, U as UNDEFINED_REFERENCE, f as childRefFor, g as childRefFromParts, a as createConstRef, l as createDebugAliasRef, h as createInvokableRef, e as createPrimitiveRef, j as createReadOnlyRef, k as createUnboundRef, i as isConstRef, d as isInvokableRef, b as isUpdatableRef, u as updateRef } from '../../shared-chunks/reference-CG0yPgLy.js';

const NULL_IDENTITY = {};
const KEY = (_, index) => index;
const INDEX = (_, index) => String(index);
const IDENTITY = item => {
  if (item === null) {
    // Returning null as an identity will cause failures since the iterator
    // can't tell that it's actually supposed to be null
    return NULL_IDENTITY;
  }
  return item;
};
function keyForPath(path) {
  return uniqueKeyFor(item => {
    if (item === null || item === undefined) {
      return item;
    }
    return getPath(item, path);
  });
}
function makeKeyFor(key) {
  switch (key) {
    case '@key':
      return uniqueKeyFor(KEY);
    case '@index':
      return uniqueKeyFor(INDEX);
    case '@identity':
      return uniqueKeyFor(IDENTITY);
    default:
      return keyForPath(key);
  }
}
class WeakMapWithPrimitives {
  _weakMap;
  _primitiveMap;
  get weakMap() {
    if (this._weakMap === undefined) {
      this._weakMap = new WeakMap();
    }
    return this._weakMap;
  }
  get primitiveMap() {
    if (this._primitiveMap === undefined) {
      this._primitiveMap = new Map();
    }
    return this._primitiveMap;
  }
  set(key, value) {
    if (isIndexable(key)) {
      this.weakMap.set(key, value);
    } else {
      this.primitiveMap.set(key, value);
    }
  }
  get(key) {
    if (isIndexable(key)) {
      return this.weakMap.get(key);
    } else {
      return this.primitiveMap.get(key);
    }
  }
}
const IDENTITIES = new WeakMapWithPrimitives();
function identityForNthOccurence(value, count) {
  let identities = IDENTITIES.get(value);
  if (identities === undefined) {
    identities = [];
    IDENTITIES.set(value, identities);
  }
  let identity = identities[count];
  if (identity === undefined) {
    identity = {
      value,
      count
    };
    identities[count] = identity;
  }
  return identity;
}

/**
 * When iterating over a list, it's possible that an item with the same unique
 * key could be encountered twice:
 *
 * ```js
 * let arr = ['same', 'different', 'same', 'same'];
 * ```
 *
 * In general, we want to treat these items as _unique within the list_. To do
 * this, we track the occurences of every item as we iterate the list, and when
 * an item occurs more than once, we generate a new unique key just for that
 * item, and that occurence within the list. The next time we iterate the list,
 * and encounter an item for the nth time, we can get the _same_ key, and let
 * Glimmer know that it should reuse the DOM for the previous nth occurence.
 */
function uniqueKeyFor(keyFor) {
  let seen = new WeakMapWithPrimitives();
  return (value, memo) => {
    let key = keyFor(value, memo);
    let count = seen.get(key) || 0;
    seen.set(key, count + 1);
    if (count === 0) {
      return key;
    }
    return identityForNthOccurence(key, count);
  };
}
function createIteratorRef(listRef, key) {
  return createComputeRef(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let iterable = valueForRef(listRef);
    let keyFor = makeKeyFor(key);
    if (Array.isArray(iterable)) {
      return new ArrayIterator(iterable, keyFor);
    }
    let maybeIterator = toIterator(iterable);
    if (maybeIterator === null) {
      return new ArrayIterator(EMPTY_ARRAY, () => null);
    }
    return new IteratorWrapper(maybeIterator, keyFor);
  });
}
function createIteratorItemRef(_value) {
  let value = _value;
  let tag = createTag();
  return createComputeRef(() => {
    consumeTag(tag);
    return value;
  }, newValue => {
    if (value !== newValue) {
      value = newValue;
      DIRTY_TAG(tag);
    }
  });
}
class IteratorWrapper {
  constructor(inner, keyFor) {
    this.inner = inner;
    this.keyFor = keyFor;
  }
  isEmpty() {
    return this.inner.isEmpty();
  }
  next() {
    let nextValue = this.inner.next();
    if (nextValue !== null) {
      nextValue.key = this.keyFor(nextValue.value, nextValue.memo);
    }
    return nextValue;
  }
}
class ArrayIterator {
  current;
  pos = 0;
  constructor(iterator, keyFor) {
    this.iterator = iterator;
    this.keyFor = keyFor;
    if (iterator.length === 0) {
      this.current = {
        kind: 'empty'
      };
    } else {
      this.current = {
        kind: 'first',
        value: iterator[this.pos]
      };
    }
  }
  isEmpty() {
    return this.current.kind === 'empty';
  }
  next() {
    let value;
    let current = this.current;
    if (current.kind === 'first') {
      this.current = {
        kind: 'progress'
      };
      value = current.value;
    } else if (this.pos >= this.iterator.length - 1) {
      return null;
    } else {
      value = this.iterator[++this.pos];
    }
    let {
      keyFor
    } = this;
    let key = keyFor(value, this.pos);
    let memo = this.pos;
    return {
      key,
      value,
      memo
    };
  }
}

export { createComputeRef, createIteratorItemRef, createIteratorRef, valueForRef };
