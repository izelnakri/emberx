import { l as lookupDescriptor } from './lookup-descriptor-CwcVgaLv.js';
import { C as COMPUTED_SETTERS } from './decorator-9ikVwsjY.js';
import { i as isPath, _ as _getPath } from './property_get-DuDs6rLg.js';
import { n as notifyPropertyChange } from './computed-BNdMwGhH.js';

/**
 @module @ember/object
*/
/**
  Sets the value of a property on an object, respecting computed properties
  and notifying observers and other listeners of the change.
  If the specified property is not defined on the object and the object
  implements the `setUnknownProperty` method, then instead of setting the
  value of the property on the object, its `setUnknownProperty` handler
  will be invoked with the two parameters `keyName` and `value`.

  ```javascript
  import { set } from '@ember/object';
  set(obj, "name", value);
  ```

  @method set
  @static
  @for @ember/object
  @param {Object} obj The object to modify.
  @param {String} keyName The property key to set
  @param {Object} value The value to set
  @return {Object} the passed value.
  @public
*/
function set(obj, keyName, value, tolerant) {
  if (obj.isDestroyed) {
    return value;
  }
  return isPath(keyName) ? _setPath(obj, keyName, value, tolerant) : _setProp(obj, keyName, value);
}
function _setProp(obj, keyName, value) {
  let descriptor = lookupDescriptor(obj, keyName);
  if (descriptor !== null && COMPUTED_SETTERS.has(descriptor.set)) {
    obj[keyName] = value;
    return value;
  }
  let currentValue;
  {
    currentValue = obj[keyName];
  }
  if (currentValue === undefined && 'object' === typeof obj && !(keyName in obj) && typeof obj.setUnknownProperty === 'function') {
    /* unknown property */
    obj.setUnknownProperty(keyName, value);
  } else {
    {
      obj[keyName] = value;
    }
    if (currentValue !== value) {
      notifyPropertyChange(obj, keyName);
    }
  }
  return value;
}
function _setPath(root, path, value, tolerant) {
  let parts = path.split('.');
  let keyName = parts.pop();
  let newRoot = _getPath(root, parts, true);
  if (newRoot !== null && newRoot !== undefined) {
    return set(newRoot, keyName, value);
  } else if (!tolerant) {
    throw new Error(`Property set failed: object in path "${parts.join('.')}" could not be found.`);
  }
}

/**
  Error-tolerant form of `set`. Will not blow up if any part of the
  chain is `undefined`, `null`, or destroyed.

  This is primarily used when syncing bindings, which may try to update after
  an object has been destroyed.

  ```javascript
  import { trySet } from '@ember/object';

  let obj = { name: "Zoey" };
  trySet(obj, "contacts.twitter", "@emberjs");
  ```

  @method trySet
  @static
  @for @ember/object
  @param {Object} root The object to modify.
  @param {String} path The property path to set
  @param {Object} value The value to set
  @public
*/
function trySet(root, path, value) {
  return set(root, path, value, true);
}

export { _setProp as _, set as s, trySet as t };
