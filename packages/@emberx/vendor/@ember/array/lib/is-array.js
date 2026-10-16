import '../../../shared-chunks/property_get-DuDs6rLg.js';
import typeOf from '../../utils/lib/type-of.js';
import { isEmberArray } from '../-internals.js';

/**
 @module @ember/array
*/

/**
  Returns true if the passed object is an array or Array-like.

  Objects are considered Array-like if any of the following are true:

    - the object is a native Array
    - the object has an objectAt property
    - the object is an Object, and has a length property

  Unlike `typeOf` this method returns true even if the passed object is
  not formally an array but appears to be array-like (i.e. implements `Array`)

  ```javascript
  import { isArray } from '@ember/array';
  import ArrayProxy from '@ember/array/proxy';

  isArray();                                      // false
  isArray([]);                                    // true
  isArray(ArrayProxy.create({ content: [] }));    // true
  ```

  @method isArray
  @static
  @for @ember/array
  @param {Object} obj The object to test
  @return {Boolean} true if the passed object is an array or Array-like
  @public
*/
function isArray(obj) {

  // SAFETY: Property read checks are safe if it's an object
  if (!obj || obj.setInterval) {
    return false;
  }

  // EmberArray's `init` brands every instance via `setEmberArray`; the only
  // unbranded EmberArray objects are native arrays upgraded by `A()`, which
  // `Array.isArray` catches. So this matches `EmberArray.detect` without
  // pulling in the mixin's module.
  if (Array.isArray(obj) || isEmberArray(obj)) {
    return true;
  }
  let type = typeOf(obj);
  if ('array' === type) {
    return true;
  }

  // SAFETY: Property read checks are safe if it's an object
  let length = obj.length;
  if (typeof length === 'number' && length === length && 'object' === type) {
    return true;
  }
  return false;
}

export { isArray as default };
