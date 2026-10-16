import { s as setProxy } from './is_proxy-Bzg0d4m4.js';
import { isEmberArray } from '../@ember/array/-internals.js';
import { t as track, f as isTracking, c as consumeTag } from './cache-CofLhaS4.js';
import { t as tagFor } from './meta-BJtIZDir.js';
import { C as Cache } from './cache-qDyqAcpg.js';

const firstDotIndexCache = new Cache(1000, key => key.indexOf('.'));
function isPath(path) {
  return typeof path === 'string' && firstDotIndexCache.get(path) !== -1;
}

/**
@module @ember/object
*/

const PROXY_CONTENT = Symbol('PROXY_CONTENT');
function hasUnknownProperty(val) {
  return typeof val === 'object' && val !== null && typeof val.unknownProperty === 'function';
}

// ..........................................................
// GET AND SET
//
// If we are on a platform that supports accessors we can use those.
// Otherwise simulate accessors by looking up the property directly on the
// object.

/**
  Gets the value of a property on an object. If the property is computed,
  the function will be invoked. If the property is not defined but the
  object implements the `unknownProperty` method then that will be invoked.

  ```javascript
  import { get } from '@ember/object';
  get(obj, "name");
  ```

  You only need to use this method to retrieve properties if the property
  might not be defined on the object and you want to respect the
  `unknownProperty` handler. Otherwise you can access the property directly.

  Note that if the object itself is `undefined`, this method will throw
  an error.

  @method get
  @for @ember/object
  @static
  @param {Object} obj The object to retrieve from.
  @param {String} keyName The property key to retrieve
  @return {Object} the property value or `null`.
  @public
*/

function get(obj, keyName) {
  return isPath(keyName) ? _getPath(obj, keyName) : _getProp(obj, keyName);
}
function _getProp(obj, keyName) {
  if (obj == null) {
    return;
  }
  let value;
  if (typeof obj === 'object' || typeof obj === 'function') {
    {
      value = obj[keyName];
    }
    if (value === undefined && typeof obj === 'object' && !(keyName in obj) && hasUnknownProperty(obj)) {
      value = obj.unknownProperty(keyName);
    }
    if (isTracking()) {
      consumeTag(tagFor(obj, keyName));
      if (Array.isArray(value) || isEmberArray(value)) {
        // Add the tag of the returned value if it is an array, since arrays
        // should always cause updates if they are consumed and then changed
        consumeTag(tagFor(value, '[]'));
      }
    }
  } else {
    // SAFETY: It should be ok to access properties on any non-nullish value
    value = obj[keyName];
  }
  return value;
}
function _getPath(obj, path, forSet) {
  let parts = typeof path === 'string' ? path.split('.') : path;
  for (let part of parts) {
    if (obj === undefined || obj === null || obj.isDestroyed) {
      return undefined;
    }
    if (forSet && (part === '__proto__' || part === 'constructor' || part === 'prototype')) {
      return;
    }
    obj = _getProp(obj, part);
  }
  return obj;
}

// Warm it up
_getProp('foo', 'a');
_getProp('foo', 1);
_getProp({}, 'a');
_getProp({}, 1);
_getProp({
  unknownProperty() {}
}, 'a');
_getProp({
  unknownProperty() {}
}, 1);
get({}, 'foo');
get({}, 'foo.bar');
let fakeProxy = {};
setProxy(fakeProxy);
track(() => _getProp({}, 'a'));
track(() => _getProp({}, 1));
track(() => _getProp({
  a: []
}, 'a'));
track(() => _getProp({
  a: fakeProxy
}, 'a'));

export { PROXY_CONTENT as P, _getPath as _, _getProp as a, get as g, hasUnknownProperty as h, isPath as i };
