import { e as expect, i as isDict } from './collections-GpG8lT2g.js';
import { setProp, getProp } from '../@glimmer/global-context/index.js';
import { C as CONSTANT_TAG, I as INITIAL, v as validateTag, t as track, a as valueForTag, c as consumeTag } from './cache-CofLhaS4.js';

const REFERENCE = Symbol('REFERENCE');
const CONSTANT = 0;
const COMPUTE = 1;
const UNBOUND = 2;
const INVOKABLE = 3;

//////////

class ReferenceImpl {
  [REFERENCE];
  tag = null;
  lastRevision = INITIAL;
  lastValue;
  children = null;
  compute = null;
  update = null;
  debugLabel;
  constructor(type) {
    this[REFERENCE] = type;
  }
}
function createPrimitiveRef(value) {
  const ref = new ReferenceImpl(UNBOUND);
  ref.tag = CONSTANT_TAG;
  ref.lastValue = value;
  return ref;
}
const UNDEFINED_REFERENCE = createPrimitiveRef(undefined);
const NULL_REFERENCE = createPrimitiveRef(null);
const TRUE_REFERENCE = createPrimitiveRef(true);
const FALSE_REFERENCE = createPrimitiveRef(false);
function createConstRef(value, debugLabel) {
  const ref = new ReferenceImpl(CONSTANT);
  ref.lastValue = value;
  ref.tag = CONSTANT_TAG;
  return ref;
}
function createUnboundRef(value, debugLabel) {
  const ref = new ReferenceImpl(UNBOUND);
  ref.lastValue = value;
  ref.tag = CONSTANT_TAG;
  return ref;
}
function createComputeRef(compute, update = null, debugLabel = 'unknown') {
  const ref = new ReferenceImpl(COMPUTE);
  ref.compute = compute;
  ref.update = update;
  return ref;
}
function createReadOnlyRef(ref) {
  if (!isUpdatableRef(ref)) return ref;
  return createComputeRef(() => valueForRef(ref), null, ref.debugLabel);
}
function isInvokableRef(ref) {
  return ref[REFERENCE] === INVOKABLE;
}
function createInvokableRef(inner) {
  const ref = createComputeRef(() => valueForRef(inner), value => updateRef(inner, value));
  ref.debugLabel = inner.debugLabel;
  ref[REFERENCE] = INVOKABLE;
  return ref;
}
function isConstRef(_ref) {
  const ref = _ref;
  return ref.tag === CONSTANT_TAG;
}
function isUpdatableRef(_ref) {
  const ref = _ref;
  return ref.update !== null;
}
function valueForRef(_ref) {
  const ref = _ref;
  let {
    tag
  } = ref;
  if (tag === CONSTANT_TAG) {
    return ref.lastValue;
  }
  const {
    lastRevision
  } = ref;
  let lastValue;
  if (tag === null || !validateTag(tag, lastRevision)) {
    const {
      compute
    } = ref;
    const newTag = track(() => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
      lastValue = ref.lastValue = compute();
    });
    tag = ref.tag = newTag;
    ref.lastRevision = valueForTag(newTag);
  } else {
    lastValue = ref.lastValue;
  }
  consumeTag(tag);
  return lastValue;
}
function updateRef(_ref, value) {
  const ref = _ref;
  const update = expect(ref.update);
  update(value);
}
function childRefFor(_parentRef, path) {
  const parentRef = _parentRef;
  const type = parentRef[REFERENCE];
  let children = parentRef.children;
  let child;
  if (children === null) {
    children = parentRef.children = new Map();
  } else {
    const next = children.get(path);
    if (next) return next;
  }
  if (type === UNBOUND) {
    const parent = valueForRef(parentRef);
    if (isDict(parent)) {
      child = createUnboundRef(parent[path]);
    } else {
      child = UNDEFINED_REFERENCE;
    }
  } else {
    child = createComputeRef(() => {
      const parent = valueForRef(parentRef);
      if (isDict(parent)) {
        return getProp(parent, path);
      }
    }, val => {
      const parent = valueForRef(parentRef);
      if (isDict(parent)) {
        return setProp(parent, path, val);
      }
    });
  }
  children.set(path, child);
  return child;
}
function childRefFromParts(root, parts) {
  let reference = root;
  for (const part of parts) {
    reference = childRefFor(reference, part);
  }
  return reference;
}
let createDebugAliasRef;

export { FALSE_REFERENCE as F, NULL_REFERENCE as N, REFERENCE as R, TRUE_REFERENCE as T, UNDEFINED_REFERENCE as U, createConstRef as a, isUpdatableRef as b, createComputeRef as c, isInvokableRef as d, createPrimitiveRef as e, childRefFor as f, childRefFromParts as g, createInvokableRef as h, isConstRef as i, createReadOnlyRef as j, createUnboundRef as k, createDebugAliasRef as l, updateRef as u, valueForRef as v };
