const objectPrototype = Object.prototype;
let counters;

/**
@module ember
*/

const UNDEFINED = Symbol('undefined');
var ListenerKind = /*#__PURE__*/function (ListenerKind) {
  ListenerKind[ListenerKind["ADD"] = 0] = "ADD";
  ListenerKind[ListenerKind["ONCE"] = 1] = "ONCE";
  ListenerKind[ListenerKind["REMOVE"] = 2] = "REMOVE";
  return ListenerKind;
}(ListenerKind || {});
let currentListenerVersion = 1;
class Meta {
  /** @internal */
  _descriptors;
  /** @internal */
  _mixins;
  /** @internal */
  _isInit;
  /** @internal */
  _lazyChains;
  /** @internal */
  _values;
  /** @internal */
  _revisions;
  /** @internal */
  source;
  /** @internal */
  proto;
  /** @internal */
  _parent;

  /** @internal */
  _listeners;
  /** @internal */
  _listenersVersion = 1;
  /** @internal */
  _inheritedEnd = -1;
  /** @internal */
  _flattenedVersion = 0;

  // DEBUG
  /** @internal */
  constructor(obj) {
    this._parent = undefined;
    this._descriptors = undefined;
    this._mixins = undefined;
    this._lazyChains = undefined;
    this._values = undefined;
    this._revisions = undefined;

    // initial value for all flags right now is false
    // see FLAGS const for detailed list of flags used
    this._isInit = false;

    // used only internally
    this.source = obj;
    this.proto = obj.constructor === undefined ? undefined : obj.constructor.prototype;
    this._listeners = undefined;
  }

  /** @internal */
  get parent() {
    let parent = this._parent;
    if (parent === undefined) {
      let proto = getPrototypeOf(this.source);
      this._parent = parent = proto === null || proto === objectPrototype ? null : meta(proto);
    }
    return parent;
  }
  setInitializing() {
    this._isInit = true;
  }

  /** @internal */
  unsetInitializing() {
    this._isInit = false;
  }

  /** @internal */
  isInitializing() {
    return this._isInit;
  }

  /** @internal */
  isPrototypeMeta(obj) {
    return this.proto === this.source && this.source === obj;
  }

  /** @internal */
  _getOrCreateOwnMap(key) {
    return this[key] || (this[key] = Object.create(null));
  }

  /** @internal */
  _getOrCreateOwnSet(key) {
    return this[key] || (this[key] = new Set());
  }

  /** @internal */
  _findInheritedMap(key, subkey) {
    let pointer = this;
    while (pointer !== null) {
      let map = pointer[key];
      if (map !== undefined) {
        let value = map.get(subkey);
        if (value !== undefined) {
          return value;
        }
      }
      pointer = pointer.parent;
    }
  }

  /** @internal */
  _hasInInheritedSet(key, value) {
    let pointer = this;
    while (pointer !== null) {
      let set = pointer[key];
      if (set !== undefined && set.has(value)) {
        return true;
      }
      pointer = pointer.parent;
    }
    return false;
  }

  /** @internal */
  valueFor(key) {
    let values = this._values;
    return values !== undefined ? values[key] : undefined;
  }

  /** @internal */
  setValueFor(key, value) {
    let values = this._getOrCreateOwnMap('_values');
    values[key] = value;
  }

  /** @internal */
  revisionFor(key) {
    let revisions = this._revisions;
    return revisions !== undefined ? revisions[key] : undefined;
  }

  /** @internal */
  setRevisionFor(key, revision) {
    let revisions = this._getOrCreateOwnMap('_revisions');
    revisions[key] = revision;
  }

  /** @internal */
  writableLazyChainsFor(key) {
    let lazyChains = this._getOrCreateOwnMap('_lazyChains');
    let chains = lazyChains[key];
    if (chains === undefined) {
      chains = lazyChains[key] = [];
    }
    return chains;
  }

  /** @internal */
  readableLazyChainsFor(key) {
    let lazyChains = this._lazyChains;
    if (lazyChains !== undefined) {
      return lazyChains[key];
    }
    return undefined;
  }

  /** @internal */
  addMixin(mixin) {
    let set = this._getOrCreateOwnSet('_mixins');
    set.add(mixin);
  }

  /** @internal */
  hasMixin(mixin) {
    return this._hasInInheritedSet('_mixins', mixin);
  }

  /** @internal */
  forEachMixins(fn) {
    let pointer = this;
    let seen;
    while (pointer !== null) {
      let set = pointer._mixins;
      if (set !== undefined) {
        seen = seen === undefined ? new Set() : seen;
        // TODO cleanup typing here
        set.forEach(mixin => {
          if (!seen.has(mixin)) {
            seen.add(mixin);
            fn(mixin);
          }
        });
      }
      pointer = pointer.parent;
    }
  }

  /** @internal */
  writeDescriptors(subkey, value) {
    let map = this._descriptors || (this._descriptors = new Map());
    map.set(subkey, value);
  }

  /** @internal */
  peekDescriptors(subkey) {
    let possibleDesc = this._findInheritedMap('_descriptors', subkey);
    return possibleDesc === UNDEFINED ? undefined : possibleDesc;
  }

  /** @internal */
  removeDescriptors(subkey) {
    this.writeDescriptors(subkey, UNDEFINED);
  }

  /** @internal */
  forEachDescriptors(fn) {
    let pointer = this;
    let seen;
    while (pointer !== null) {
      let map = pointer._descriptors;
      if (map !== undefined) {
        seen = seen === undefined ? new Set() : seen;
        map.forEach((value, key) => {
          if (!seen.has(key)) {
            seen.add(key);
            if (value !== UNDEFINED) {
              fn(key, value);
            }
          }
        });
      }
      pointer = pointer.parent;
    }
  }

  /** @internal */
  addToListeners(eventName, target, method, once, sync) {
    this.pushListener(eventName, target, method, once ? ListenerKind.ONCE : ListenerKind.ADD, sync);
  }

  /** @internal */
  removeFromListeners(eventName, target, method) {
    this.pushListener(eventName, target, method, ListenerKind.REMOVE);
  }
  pushListener(event, target, method, kind, sync = false) {
    let listeners = this.writableListeners();
    let i = indexOfListener(listeners, event, target, method);

    // remove if found listener was inherited
    if (i !== -1 && i < this._inheritedEnd) {
      listeners.splice(i, 1);
      this._inheritedEnd--;
      i = -1;
    }

    // if not found, push. Note that we must always push if a listener is not
    // found, even in the case of a function listener remove, because we may be
    // attempting to add or remove listeners _before_ flattening has occurred.
    if (i === -1) {
      listeners.push({
        event,
        target,
        method,
        kind,
        sync
      });
    } else {
      let listener = listeners[i];
      // want to splice it out entirely so we don't hold onto a reference.
      if (kind === ListenerKind.REMOVE && listener.kind !== ListenerKind.REMOVE) {
        listeners.splice(i, 1);
      } else {
        listener.kind = kind;
        listener.sync = sync;
      }
    }
  }
  writableListeners() {
    // Check if we need to invalidate and reflatten. We need to do this if we
    // have already flattened (flattened version is the current version) and
    // we are either writing to a prototype meta OR we have never inherited, and
    // may have cached the parent's listeners.
    if (this._flattenedVersion === currentListenerVersion && (this.source === this.proto || this._inheritedEnd === -1)) {
      currentListenerVersion++;
    }

    // Inherited end has not been set, then we have never created our own
    // listeners, but may have cached the parent's
    if (this._inheritedEnd === -1) {
      this._inheritedEnd = 0;
      this._listeners = [];
    }
    return this._listeners;
  }

  /**
    Flattening is based on a global revision counter. If the revision has
    bumped it means that somewhere in a class inheritance chain something has
    changed, so we need to reflatten everything. This can only happen if:
     1. A meta has been flattened (listener has been called)
    2. The meta is a prototype meta with children who have inherited its
       listeners
    3. A new listener is subsequently added to the meta (e.g. via `.reopen()`)
     This is a very rare occurrence, so while the counter is global it shouldn't
    be updated very often in practice.
  */
  flattenedListeners() {
    if (this._flattenedVersion < currentListenerVersion) {
      let parent = this.parent;
      if (parent !== null) {
        // compute
        let parentListeners = parent.flattenedListeners();
        if (parentListeners !== undefined) {
          if (this._listeners === undefined) {
            this._listeners = parentListeners;
          } else {
            let listeners = this._listeners;
            if (this._inheritedEnd > 0) {
              listeners.splice(0, this._inheritedEnd);
              this._inheritedEnd = 0;
            }
            for (let listener of parentListeners) {
              let index = indexOfListener(listeners, listener.event, listener.target, listener.method);
              if (index === -1) {
                listeners.unshift(listener);
                this._inheritedEnd++;
              }
            }
          }
        }
      }
      this._flattenedVersion = currentListenerVersion;
    }
    return this._listeners;
  }

  /** @internal */
  matchingListeners(eventName) {
    let listeners = this.flattenedListeners();
    let result;
    if (listeners !== undefined) {
      for (let listener of listeners) {
        // REMOVE listeners are placeholders that tell us not to
        // inherit, so they never match. Only ADD and ONCE can match.
        if (listener.event === eventName && (listener.kind === ListenerKind.ADD || listener.kind === ListenerKind.ONCE)) {
          if (result === undefined) {
            // we create this array only after we've found a listener that
            // matches to avoid allocations when no matches are found.
            result = [];
          }
          result.push(listener.target, listener.method, listener.kind === ListenerKind.ONCE);
        }
      }
    }
    return result;
  }

  /** @internal */
  observerEvents() {
    let listeners = this.flattenedListeners();
    let result;
    if (listeners !== undefined) {
      for (let listener of listeners) {
        // REMOVE listeners are placeholders that tell us not to
        // inherit, so they never match. Only ADD and ONCE can match.
        if ((listener.kind === ListenerKind.ADD || listener.kind === ListenerKind.ONCE) && listener.event.indexOf(':change') !== -1) {
          if (result === undefined) {
            // we create this array only after we've found a listener that
            // matches to avoid allocations when no matches are found.
            result = [];
          }
          result.push(listener);
        }
      }
    }
    return result;
  }
}
const getPrototypeOf = Object.getPrototypeOf;
const metaStore = new WeakMap();
function setMeta(obj, meta) {
  metaStore.set(obj, meta);
}
function peekMeta(obj) {
  let meta = metaStore.get(obj);
  if (meta !== undefined) {
    return meta;
  }
  let pointer = getPrototypeOf(obj);
  while (pointer !== null) {
    meta = metaStore.get(pointer);
    if (meta !== undefined) {
      if (meta.proto !== pointer) {
        // The meta was a prototype meta which was not marked as initializing.
        // This can happen when a prototype chain was created manually via
        // Object.create() and the source object does not have a constructor.
        meta.proto = pointer;
      }
      return meta;
    }
    pointer = getPrototypeOf(pointer);
  }
  return null;
}

/**
  Retrieves the meta hash for an object. If `writable` is true ensures the
  hash is writable for this object as well.

  The meta object contains information about computed property descriptors as
  well as any watched properties and other information. You generally will
  not access this information directly but instead work with higher level
  methods that manipulate this hash indirectly.

  @method meta
  @for Ember
  @private

  @param {Object} obj The object to retrieve meta for
  @param {Boolean} [writable=true] Pass `false` if you do not intend to modify
    the meta hash, allowing the method to avoid making an unnecessary copy.
  @return {Object} the meta hash for an object
*/
const meta = function meta(obj) {
  let maybeMeta = peekMeta(obj);

  // remove this code, in-favor of explicit parent
  if (maybeMeta !== null && maybeMeta.source === obj) {
    return maybeMeta;
  }
  let newMeta = new Meta(obj);
  setMeta(obj, newMeta);
  return newMeta;
};
function indexOfListener(listeners, event, target, method) {
  for (let i = listeners.length - 1; i >= 0; i--) {
    let listener = listeners[i];
    if (listener.event === event && listener.target === target && listener.method === method) {
      return i;
    }
  }
  return -1;
}

export { Meta, UNDEFINED, counters, meta, peekMeta, setMeta };
