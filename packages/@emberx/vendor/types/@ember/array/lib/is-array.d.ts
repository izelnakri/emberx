declare module '@ember/array/lib/is-array' {
    import type EmberArray from "@ember/array";
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
    export default function isArray(obj: unknown): obj is ArrayLike<unknown> | EmberArray<unknown>;
}