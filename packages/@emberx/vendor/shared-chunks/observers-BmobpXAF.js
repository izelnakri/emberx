import { E as ENV } from './env-DXxsTFkM.js';
import { peekMeta } from '../@ember/-internals/meta/lib/meta.js';
import { registerDestructor } from '../@glimmer/destroyable/index.js';
import { a as valueForTag, v as validateTag, k as CURRENT_TAG } from './cache-CofLhaS4.js';
import { a as tagMetaFor } from './meta-BJtIZDir.js';
import { g as getChainTagsForKey } from './chain-tags-B2J7DsxO.js';
import { a as addListener, r as removeListener, s as sendEvent } from './events-DYrYz3V8.js';

const AFTER_OBSERVERS = ':change';
function changeEvent(keyName) {
  return keyName + AFTER_OBSERVERS;
}

const SYNC_DEFAULT = !ENV._DEFAULT_ASYNC_OBSERVERS;
const SYNC_OBSERVERS = new Map();
const ASYNC_OBSERVERS = new Map();

/**
@module @ember/object
*/

/**
  @method addObserver
  @static
  @for @ember/object/observers
  @param obj
  @param {String} path
  @param {Object|Function} target
  @param {Function|String} [method]
  @public
*/
function addObserver(obj, path, target, method, sync = SYNC_DEFAULT) {
  let eventName = changeEvent(path);
  addListener(obj, eventName, target, method, false, sync);
  let meta = peekMeta(obj);
  if (meta === null || !(meta.isPrototypeMeta(obj) || meta.isInitializing())) {
    activateObserver(obj, eventName, sync);
  }
}

/**
  @method removeObserver
  @static
  @for @ember/object/observers
  @param obj
  @param {String} path
  @param {Object|Function} target
  @param {Function|String} [method]
  @public
*/
function removeObserver(obj, path, target, method, sync = SYNC_DEFAULT) {
  let eventName = changeEvent(path);
  let meta = peekMeta(obj);
  if (meta === null || !(meta.isPrototypeMeta(obj) || meta.isInitializing())) {
    deactivateObserver(obj, eventName, sync);
  }
  removeListener(obj, eventName, target, method);
}
function getOrCreateActiveObserversFor(target, sync) {
  let observerMap = sync === true ? SYNC_OBSERVERS : ASYNC_OBSERVERS;
  if (!observerMap.has(target)) {
    observerMap.set(target, new Map());
    registerDestructor(target, () => destroyObservers(target), true);
  }
  return observerMap.get(target);
}
function activateObserver(target, eventName, sync = false) {
  let activeObservers = getOrCreateActiveObserversFor(target, sync);
  if (activeObservers.has(eventName)) {
    activeObservers.get(eventName).count++;
  } else {
    let path = eventName.substring(0, eventName.lastIndexOf(':'));
    let tag = getChainTagsForKey(target, path, tagMetaFor(target), peekMeta(target));
    activeObservers.set(eventName, {
      count: 1,
      path,
      tag,
      lastRevision: valueForTag(tag),
      suspended: false
    });
  }
}
let DEACTIVATE_SUSPENDED = false;
let SCHEDULED_DEACTIVATE = [];
function deactivateObserver(target, eventName, sync = false) {
  if (DEACTIVATE_SUSPENDED === true) {
    SCHEDULED_DEACTIVATE.push([target, eventName, sync]);
    return;
  }
  let observerMap = sync === true ? SYNC_OBSERVERS : ASYNC_OBSERVERS;
  let activeObservers = observerMap.get(target);
  if (activeObservers !== undefined) {
    let observer = activeObservers.get(eventName);
    observer.count--;
    if (observer.count === 0) {
      activeObservers.delete(eventName);
      if (activeObservers.size === 0) {
        observerMap.delete(target);
      }
    }
  }
}
function suspendedObserverDeactivation() {
  DEACTIVATE_SUSPENDED = true;
}
function resumeObserverDeactivation() {
  DEACTIVATE_SUSPENDED = false;
  for (let [target, eventName, sync] of SCHEDULED_DEACTIVATE) {
    deactivateObserver(target, eventName, sync);
  }
  SCHEDULED_DEACTIVATE = [];
}

/**
 * Primarily used for cases where we are redefining a class, e.g. mixins/reopen
 * being applied later. Revalidates all the observers, resetting their tags.
 *
 * @private
 * @param target
 */
function revalidateObservers(target) {
  if (ASYNC_OBSERVERS.has(target)) {
    ASYNC_OBSERVERS.get(target).forEach(observer => {
      observer.tag = getChainTagsForKey(target, observer.path, tagMetaFor(target), peekMeta(target));
      observer.lastRevision = valueForTag(observer.tag);
    });
  }
  if (SYNC_OBSERVERS.has(target)) {
    SYNC_OBSERVERS.get(target).forEach(observer => {
      observer.tag = getChainTagsForKey(target, observer.path, tagMetaFor(target), peekMeta(target));
      observer.lastRevision = valueForTag(observer.tag);
    });
  }
}
let lastKnownRevision = 0;
function flushAsyncObservers(_schedule) {
  let currentRevision = valueForTag(CURRENT_TAG);
  if (lastKnownRevision === currentRevision) {
    return;
  }
  lastKnownRevision = currentRevision;
  ASYNC_OBSERVERS.forEach((activeObservers, target) => {
    let meta = peekMeta(target);
    activeObservers.forEach((observer, eventName) => {
      if (!validateTag(observer.tag, observer.lastRevision)) {
        let sendObserver = () => {
          try {
            sendEvent(target, eventName, [target, observer.path], undefined, meta);
          } finally {
            observer.tag = getChainTagsForKey(target, observer.path, tagMetaFor(target), peekMeta(target));
            observer.lastRevision = valueForTag(observer.tag);
          }
        };
        if (_schedule) {
          _schedule('actions', sendObserver);
        } else {
          sendObserver();
        }
      }
    });
  });
}
function flushSyncObservers() {
  // When flushing synchronous observers, we know that something has changed (we
  // only do this during a notifyPropertyChange), so there's no reason to check
  // a global revision.

  SYNC_OBSERVERS.forEach((activeObservers, target) => {
    let meta = peekMeta(target);
    activeObservers.forEach((observer, eventName) => {
      if (!observer.suspended && !validateTag(observer.tag, observer.lastRevision)) {
        try {
          observer.suspended = true;
          sendEvent(target, eventName, [target, observer.path], undefined, meta);
        } finally {
          observer.tag = getChainTagsForKey(target, observer.path, tagMetaFor(target), peekMeta(target));
          observer.lastRevision = valueForTag(observer.tag);
          observer.suspended = false;
        }
      }
    });
  });
}
function setObserverSuspended(target, property, suspended) {
  let activeObservers = SYNC_OBSERVERS.get(target);
  if (!activeObservers) {
    return;
  }
  let observer = activeObservers.get(changeEvent(property));
  if (observer) {
    observer.suspended = suspended;
  }
}
function destroyObservers(target) {
  if (SYNC_OBSERVERS.size > 0) SYNC_OBSERVERS.delete(target);
  if (ASYNC_OBSERVERS.size > 0) ASYNC_OBSERVERS.delete(target);
}

export { ASYNC_OBSERVERS as A, SYNC_OBSERVERS as S, activateObserver as a, addObserver as b, revalidateObservers as c, flushSyncObservers as d, resumeObserverDeactivation as e, flushAsyncObservers as f, setObserverSuspended as g, removeObserver as r, suspendedObserverDeactivation as s };
