import { c as consumeTag, b as createUpdatableTag, D as DIRTY_TAG } from '../../shared-chunks/cache-CofLhaS4.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Unfortunately, TypeScript's ability to do inference *or* type-checking in a
// `Proxy`'s body is very limited, so we have to use a number of casts `as any`
// to make the internal accesses work. The type safety of these is guaranteed at
// the *call site* instead of within the body: you cannot do `Array.blah` in TS,
// and it will blow up in JS in exactly the same way, so it is safe to assume
// that properties within the getter have the correct type in TS.

const ARRAY_GETTER_METHODS = new Set([Symbol.iterator, 'concat', 'entries', 'every', 'filter', 'find', 'findIndex', 'flat', 'flatMap', 'forEach', 'includes', 'indexOf', 'join', 'keys', 'lastIndexOf', 'map', 'reduce', 'reduceRight', 'slice', 'some', 'values']);

// For these methods, `Array` itself immediately gets the `.length` to return
// after invoking them.
const ARRAY_WRITE_THEN_READ_METHODS = new Set(['fill', 'push', 'unshift']);
function convertToInt(prop) {
  if (typeof prop === 'symbol') return null;
  const num = Number(prop);
  if (isNaN(num)) return null;
  return num % 1 === 0 ? num : null;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class TrackedArray {
  #options;
  constructor(arr, options) {
    this.#options = options;
    const clone = arr.slice();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const boundFns = new Map();

    /**
      Flag to track whether we have *just* intercepted a call to `.push()` or
      `.unshift()`, since in those cases (and only those cases!) the `Array`
      itself checks `.length` to return from the function call.
     */
    let nativelyAccessingLengthFromWriteMethod = false;
    return new Proxy(clone, {
      get(target, prop /*, _receiver */) {
        const index = convertToInt(prop);
        if (index !== null) {
          self.#readStorageFor(index);
          consumeTag(self.#collection);
          return target[index];
        }
        if (prop === 'length') {
          // If we are reading `.length`, it may be a normal user-triggered
          // read, or it may be a read triggered by Array itself. In the latter
          // case, it is because we have just done `.push()` or `.unshift()`; in
          // that case it is safe not to mark this as a *read* operation, since
          // calling `.push()` or `.unshift()` cannot otherwise be part of a
          // "read" operation safely, and if done during an *existing* read
          // (e.g. if the user has already checked `.length` *prior* to this),
          // that will still trigger the mutation-after-consumption assertion.
          if (nativelyAccessingLengthFromWriteMethod) {
            nativelyAccessingLengthFromWriteMethod = false;
          } else {
            consumeTag(self.#collection);
          }
          return target[prop];
        }

        // Here, track that we are doing a `.push()` or `.unshift()` by setting
        // the flag to `true` so that when the `.length` is read by `Array` (see
        // immediately above), it knows not to dirty the collection.
        if (ARRAY_WRITE_THEN_READ_METHODS.has(prop)) {
          nativelyAccessingLengthFromWriteMethod = true;
        }
        if (ARRAY_GETTER_METHODS.has(prop)) {
          let fn = boundFns.get(prop);
          if (fn === undefined) {
            fn = (...args) => {
              consumeTag(self.#collection);
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              return target[prop](...args);
            };
            boundFns.set(prop, fn);
          }
          return fn;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        return target[prop];
      },
      set(target, prop, value /*, _receiver */) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        let isUnchanged = self.#options.equals(target[prop], value);
        if (isUnchanged) return true;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        target[prop] = value;
        const index = convertToInt(prop);
        if (index !== null) {
          self.#dirtyStorageFor(index);
          self.#dirtyCollection();
        } else if (prop === 'length') {
          self.#dirtyCollection();
        }
        return true;
      },
      getPrototypeOf() {
        return TrackedArray.prototype;
      }
    });
  }
  #collection = createUpdatableTag();
  #storages = new Map();
  #readStorageFor(index) {
    let storage = this.#storages.get(index);
    if (storage === undefined) {
      storage = createUpdatableTag();
      this.#storages.set(index, storage);
    }
    consumeTag(storage);
  }
  #dirtyStorageFor(index) {
    const storage = this.#storages.get(index);
    if (storage) {
      DIRTY_TAG(storage);
    }
  }
  #dirtyCollection() {
    DIRTY_TAG(this.#collection);
    this.#storages.clear();
  }
}

// This rule is correct in the general case, but it doesn't understand
// declaration merging, which is how we're using the interface here. This says
// `TrackedArray` acts just like `Array<T>`, but also has the properties
// declared via the `class` declaration above -- but without the cost of a
// subclass, which is much slower that the proxied array behavior. That is: a
// `TrackedArray` *is* an `Array`, just with a proxy in front of accessors and
// setters, rather than a subclass of an `Array` which would be de-optimized by
// the browsers.
//

// eslint-disable-next-line @typescript-eslint/no-empty-object-type

// Ensure instanceof works correctly
Object.setPrototypeOf(TrackedArray.prototype, Array.prototype);
function trackedArray(data, options) {
  return new TrackedArray(data ?? [], {
    equals: options?.equals ?? Object.is,
    description: options?.description
  });
}

class TrackedObject {
  #options;
  #storages = new Map();
  #collection = createUpdatableTag();
  #readStorageFor(key) {
    let storage = this.#storages.get(key);
    if (storage === undefined) {
      storage = createUpdatableTag();
      this.#storages.set(key, storage);
    }
    consumeTag(storage);
  }
  #dirtyStorageFor(key) {
    const storage = this.#storages.get(key);
    if (storage) {
      DIRTY_TAG(storage);
    }
  }
  #dirtyCollection() {
    DIRTY_TAG(this.#collection);
  }

  /**
   * This implementation of trackedObject is far too dynamic for TS to be happy with
   */
  constructor(obj, options) {
    this.#options = options;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const proto = Object.getPrototypeOf(obj);
    const descs = Object.getOwnPropertyDescriptors(obj);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const clone = Object.create(proto);
    for (const prop in descs) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      Object.defineProperty(clone, prop, descs[prop]);
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return new Proxy(clone, {
      get(target, prop) {
        self.#readStorageFor(prop);
        return target[prop];
      },
      has(target, prop) {
        self.#readStorageFor(prop);
        return prop in target;
      },
      ownKeys(target) {
        consumeTag(self.#collection);
        return Reflect.ownKeys(target);
      },
      set(target, prop, value) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        let isUnchanged = self.#options.equals(target[prop], value);
        if (isUnchanged) {
          return true;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        target[prop] = value;
        self.#dirtyStorageFor(prop);
        self.#dirtyCollection();
        return true;
      },
      deleteProperty(target, prop) {
        if (prop in target) {
          delete target[prop];
          self.#dirtyStorageFor(prop);
          self.#storages.delete(prop);
          self.#dirtyCollection();
        }
        return true;
      },
      getPrototypeOf() {
        return TrackedObject.prototype;
      }
    });
  }
}
function trackedObject(data, options) {
  return new TrackedObject(data ?? {}, {
    equals: options?.equals ?? Object.is,
    description: options?.description
    /**
     * SAFETY: we are trying to mimic the same behavior as a plain object, so if anything about
     *         the object that is returned behaves differently from a native object in a surprising
     *         way, we should fix that and make the behavior match native objects.
     */
  });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// Using a Proxy-based approach so that any new methods added to the Set
// interface are automatically supported without needing to manually
// re-implement each one.

function trackedSet(data, options) {
  const equals = options?.equals ?? Object.is;
  const target = new Set(data ?? []);
  const collection = createUpdatableTag();
  const storages = new Map();
  function storageFor(key) {
    let storage = storages.get(key);
    if (storage === undefined) {
      storage = createUpdatableTag();
      storages.set(key, storage);
    }
    return storage;
  }
  function dirtyStorageFor(key) {
    const storage = storages.get(key);
    if (storage) {
      DIRTY_TAG(storage);
    }
  }
  const proxy = new Proxy(target, {
    get(target, prop, receiver) {
      if (prop === 'add') {
        return function (value) {
          if (target.has(value)) {
            const isUnchanged = equals(value, value);
            if (isUnchanged) return proxy;
          } else {
            DIRTY_TAG(collection);
          }
          dirtyStorageFor(value);
          target.add(value);
          return proxy;
        };
      }
      if (prop === 'delete') {
        return function (value) {
          if (!target.has(value)) return false;
          dirtyStorageFor(value);
          DIRTY_TAG(collection);
          storages.delete(value);
          return target.delete(value);
        };
      }
      if (prop === 'clear') {
        return function () {
          if (target.size === 0) return;
          storages.forEach(s => DIRTY_TAG(s));
          DIRTY_TAG(collection);
          storages.clear();
          target.clear();
        };
      }
      if (prop === 'has') {
        return function (value) {
          consumeTag(storageFor(value));
          return target.has(value);
        };
      }
      if (prop === 'size') {
        consumeTag(collection);
        return target.size;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === 'function') {
        return function (...args) {
          consumeTag(collection);

          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          return value.apply(target, args);
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value;
    }
  });
  return proxy;
}

// Using a Proxy-based approach so that any new methods added to the WeakSet
// interface are automatically supported without needing to manually
// re-implement each one.

/**
 * NOTE: we cannot pass a WeakSet because WeakSets are not iterable
 */
/**
 * Creates an instanceof WeakSet from an optional list of entries
 *
 */
function trackedWeakSet(data, options) {
  const equals = options?.equals ?? Object.is;
  const target = new WeakSet(data ?? []);
  const storages = new WeakMap();
  function storageFor(key) {
    let storage = storages.get(key);
    if (storage === undefined) {
      storage = createUpdatableTag();
      storages.set(key, storage);
    }
    return storage;
  }
  function dirtyStorageFor(key) {
    const storage = storages.get(key);
    if (storage) {
      DIRTY_TAG(storage);
    }
  }
  const proxy = new Proxy(target, {
    get(target, prop, receiver) {
      if (prop === 'add') {
        return function (value) {
          /**
           * In a WeakSet, there is no `.get()`, but if there was,
           * we could assume it's the same value as what we passed.
           *
           * So for a WeakSet, if we try to add something that already exists
           * we no-op.
           *
           * WeakSet already does this internally for us,
           * but we want the ability for the reactive behavior to reflect the same behavior.
           *
           * i.e.: doing weakSet.add(value) should never dirty with the defaults
           *       if the `value` is already in the weakSet
           */
          if (target.has(value)) {
            /**
             * This looks a little silly, where a always will === b,
             * but see the note above.
             */
            const isUnchanged = equals(value, value);
            if (isUnchanged) return proxy;
          }

          // Add to vals first to get better error message
          target.add(value);
          dirtyStorageFor(value);
          return proxy;
        };
      }
      if (prop === 'delete') {
        return function (value) {
          if (!target.has(value)) return false;
          dirtyStorageFor(value);
          storages.delete(value);
          return target.delete(value);
        };
      }
      if (prop === 'has') {
        return function (value) {
          consumeTag(storageFor(value));
          return target.has(value);
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        return value.bind(target);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value;
    }
  });
  return proxy;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// Using a Proxy-based approach so that any new methods added to the Map
// interface (like getOrInsert, getOrInsertComputed, etc.) are automatically
// supported without needing to manually re-implement each one.

function trackedMap(data, options) {
  const equals = options?.equals ?? Object.is;
  // TypeScript doesn't correctly resolve the overloads for calling the `Map`
  // constructor for the no-value constructor. This resolves that.
  const target = data instanceof Map ? new Map(data.entries()) : new Map(data ?? []);
  const collection = createUpdatableTag();
  const storages = new Map();
  function storageFor(key) {
    let storage = storages.get(key);
    if (storage === undefined) {
      storage = createUpdatableTag();
      storages.set(key, storage);
    }
    return storage;
  }
  function dirtyStorageFor(key) {
    const storage = storages.get(key);
    if (storage) {
      DIRTY_TAG(storage);
    }
  }
  const proxy = new Proxy(target, {
    get(target, prop, receiver) {
      if (prop === 'set') {
        return function (key, value) {
          const hasExisting = target.has(key);
          if (hasExisting) {
            // TS doesn't know about the relationship between has and get
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const isUnchanged = equals(target.get(key), value);
            if (isUnchanged) return proxy;
          }
          dirtyStorageFor(key);
          DIRTY_TAG(collection);
          target.set(key, value);
          return proxy;
        };
      }
      if (prop === 'delete') {
        return function (key) {
          if (!target.has(key)) return false;
          dirtyStorageFor(key);
          DIRTY_TAG(collection);
          storages.delete(key);
          return target.delete(key);
        };
      }
      if (prop === 'clear') {
        return function () {
          if (target.size === 0) return;
          storages.forEach(s => DIRTY_TAG(s));
          storages.clear();
          DIRTY_TAG(collection);
          target.clear();
        };
      }
      if (prop === 'get') {
        return function (key) {
          consumeTag(storageFor(key));
          return target.get(key);
        };
      }
      if (prop === 'has') {
        return function (key) {
          consumeTag(storageFor(key));
          return target.has(key);
        };
      }
      if (prop === 'size') {
        consumeTag(collection);
        return target.size;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === 'function') {
        return function (...args) {
          consumeTag(collection);

          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          return value.apply(target, args);
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value;
    }
  });
  return proxy;
}

// Using a Proxy-based approach so that any new methods added to the WeakMap
// interface (like getOrInsert, getOrInsertComputed, etc.) are automatically
// supported without needing to manually re-implement each one.

function trackedWeakMap(data, options) {
  const equals = options?.equals ?? Object.is;
  const existing = data ?? [];
  /**
   * SAFETY: note that when passing in an existing weak map, we can't
   *         clone it as it is not iterable and not a supported type of structuredClone
   */
  const target = existing instanceof WeakMap ? existing : new WeakMap(existing);
  const storages = new WeakMap();
  function storageFor(key) {
    let storage = storages.get(key);
    if (storage === undefined) {
      storage = createUpdatableTag();
      storages.set(key, storage);
    }
    return storage;
  }
  function dirtyStorageFor(key) {
    const storage = storages.get(key);
    if (storage) {
      DIRTY_TAG(storage);
    }
  }
  const proxy = new Proxy(target, {
    get(target, prop, receiver) {
      if (prop === 'set') {
        return function (key, value) {
          const hasExisting = target.has(key);
          if (hasExisting) {
            const isUnchanged = equals(target.get(key), value);
            if (isUnchanged) return proxy;
          }
          dirtyStorageFor(key);
          target.set(key, value);
          return proxy;
        };
      }
      if (prop === 'delete') {
        return function (key) {
          if (!target.has(key)) return false;
          dirtyStorageFor(key);
          storages.delete(key);
          return target.delete(key);
        };
      }
      if (prop === 'get') {
        return function (key) {
          consumeTag(storageFor(key));
          return target.get(key);
        };
      }
      if (prop === 'has') {
        return function (key) {
          consumeTag(storageFor(key));
          return target.has(key);
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        return value.bind(target);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value;
    }
  });
  return proxy;
}

export { trackedArray, trackedMap, trackedObject, trackedSet, trackedWeakMap, trackedWeakSet };
