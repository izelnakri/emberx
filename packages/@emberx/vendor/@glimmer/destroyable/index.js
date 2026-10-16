import { scheduleDestroyed, scheduleDestroy } from '../global-context/index.js';

const LIVE_STATE = 0;
const DESTROYING_STATE = 1;
const DESTROYED_STATE = 2;
let DESTROYABLE_META = new WeakMap();
const branded = Symbol('BrandedArray');
function isBrandedArray(collection) {
  return Array.isArray(collection) && branded in collection;
}
function push(collection, newItem) {
  if (collection === null) {
    return newItem;
  } else if (isBrandedArray(collection)) {
    collection.push(newItem);
    return collection;
  } else {
    const b = [collection, newItem];
    b[branded] = true;
    return b;
  }
}
function iterate(collection, fn) {
  if (isBrandedArray(collection)) {
    collection.forEach(fn);
  } else if (collection !== null) {
    fn(collection);
  }
}
function remove(collection, item, message) {
  if (isBrandedArray(collection) && collection.length > 1) {
    let index = collection.indexOf(item);
    let lastIndex = collection.length - 1;
    if (index !== lastIndex) {
      collection[index] = collection[lastIndex];
    }
    collection.length = lastIndex;
    return collection;
  } else {
    return null;
  }
}
function getDestroyableMeta(destroyable) {
  let meta = DESTROYABLE_META.get(destroyable);
  if (meta === undefined) {
    meta = {
      parents: null,
      children: null,
      eagerDestructors: null,
      destructors: null,
      state: LIVE_STATE
    };
    DESTROYABLE_META.set(destroyable, meta);
  }
  return meta;
}
function associateDestroyableChild(parent, child) {
  let parentMeta = getDestroyableMeta(parent);
  let childMeta = getDestroyableMeta(child);
  parentMeta.children = push(parentMeta.children, child);
  childMeta.parents = push(childMeta.parents, parent);
  return child;
}
function registerDestructor(destroyable, destructor, eager = false) {
  let meta = getDestroyableMeta(destroyable);
  let destructorsKey = eager ? 'eagerDestructors' : 'destructors';
  meta[destructorsKey] = push(meta[destructorsKey], destructor);
  return destructor;
}
function unregisterDestructor(destroyable, destructor, eager = false) {
  let meta = getDestroyableMeta(destroyable);
  let destructorsKey = eager ? 'eagerDestructors' : 'destructors';
  meta[destructorsKey] = remove(meta[destructorsKey], destructor);
}

////////////

function destroy(destroyable) {
  let meta = getDestroyableMeta(destroyable);
  if (meta.state >= DESTROYING_STATE) return;
  let {
    parents,
    children,
    eagerDestructors,
    destructors
  } = meta;
  meta.state = DESTROYING_STATE;
  iterate(children, destroy);
  iterate(eagerDestructors, destructor => {
    destructor(destroyable);
  });
  iterate(destructors, destructor => {
    scheduleDestroy(destroyable, destructor);
  });
  scheduleDestroyed(() => {
    iterate(parents, parent => {
      removeChildFromParent(destroyable, parent);
    });
    meta.state = DESTROYED_STATE;
  });
}
function removeChildFromParent(child, parent) {
  let parentMeta = getDestroyableMeta(parent);
  if (parentMeta.state !== DESTROYED_STATE) {
    parentMeta.children = remove(parentMeta.children, child);
  }
}
function destroyChildren(destroyable) {
  let {
    children
  } = getDestroyableMeta(destroyable);
  iterate(children, destroy);
}
function _hasDestroyableChildren(destroyable) {
  let meta = DESTROYABLE_META.get(destroyable);
  return meta === undefined ? false : meta.children !== null;
}
function isDestroying(destroyable) {
  let meta = DESTROYABLE_META.get(destroyable);
  return meta === undefined ? false : meta.state >= DESTROYING_STATE;
}
function isDestroyed(destroyable) {
  let meta = DESTROYABLE_META.get(destroyable);
  return meta === undefined ? false : meta.state >= DESTROYED_STATE;
}

////////////

let enableDestroyableTracking;
let assertDestroyablesDestroyed;

export { _hasDestroyableChildren, assertDestroyablesDestroyed, associateDestroyableChild, destroy, destroyChildren, enableDestroyableTracking, isDestroyed, isDestroying, registerDestructor, unregisterDestructor };
