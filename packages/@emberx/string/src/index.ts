/**
@module @ember/string
*/

export { getStrings as _getStrings, setStrings as _setStrings } from './string-registry.ts';

import Cache from './cache.ts';

const STRING_DASHERIZE_REGEXP = /[ _]/g;

const STRING_DASHERIZE_CACHE = new Cache<string, string>(1000, (key) =>
  decamelize(key).replace(STRING_DASHERIZE_REGEXP, '-'),
);

const STRING_CAMELIZE_REGEXP_1 = /(-|_|\.|\s)+(.)?/g;
const STRING_CAMELIZE_REGEXP_2 = /(^|\/)([A-Z])/g;

const CAMELIZE_CACHE = new Cache<string, string>(1000, (key) =>
  key
    .replace(STRING_CAMELIZE_REGEXP_1, (_match, _separator, chr) => (chr ? chr.toUpperCase() : ''))
    .replace(STRING_CAMELIZE_REGEXP_2, (match /*, separator, chr */) => match.toLowerCase()),
);

const STRING_CLASSIFY_REGEXP_1 = /^(-|_)+(.)?/;
const STRING_CLASSIFY_REGEXP_2 = /(.)(-|_|\.|\s)+(.)?/g;
const STRING_CLASSIFY_REGEXP_3 = /(^|\/|\.)([a-z])/g;

const CLASSIFY_CACHE = new Cache<string, string>(1000, (str) => {
  const replace1 = (_match: string, _separator: string, chr: string) => (chr ? `_${chr.toUpperCase()}` : '');
  const replace2 = (_match: string, initialChar: string, _separator: string, chr: string) =>
    initialChar + (chr ? chr.toUpperCase() : '');
  const parts = str.split('/');
  for (let i = 0; i < parts.length; i++) {
    parts[i] = parts[i].replace(STRING_CLASSIFY_REGEXP_1, replace1).replace(STRING_CLASSIFY_REGEXP_2, replace2);
  }
  return parts.join('/').replace(STRING_CLASSIFY_REGEXP_3, (match /*, separator, chr */) => match.toUpperCase());
});

const STRING_UNDERSCORE_REGEXP_1 = /([a-z\d])([A-Z]+)/g;
const STRING_UNDERSCORE_REGEXP_2 = /-|\s+/g;

const UNDERSCORE_CACHE = new Cache<string, string>(1000, (str) =>
  str.replace(STRING_UNDERSCORE_REGEXP_1, '$1_$2').replace(STRING_UNDERSCORE_REGEXP_2, '_').toLowerCase(),
);

const STRING_CAPITALIZE_REGEXP = /(^|\/)([a-z\u00C0-\u024F])/g;

const CAPITALIZE_CACHE = new Cache<string, string>(1000, (str) =>
  str.replace(STRING_CAPITALIZE_REGEXP, (match /*, separator, chr */) => match.toUpperCase()),
);

const STRING_DECAMELIZE_REGEXP = /([a-z\d])([A-Z])/g;

const DECAMELIZE_CACHE = new Cache<string, string>(1000, (str) =>
  str.replace(STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase(),
);

/**
  Defines string helper methods including string formatting and localization.
  Unless `EmberENV.EXTEND_PROTOTYPES.String` is `false` these methods will also be
  added to the `String.prototype` as well.

  @class String
  @public
*/

/**
  Converts a camelized string into all lower case separated by underscores.

  ```javascript
  import assert from 'node:assert/strict';
  import { decamelize } from '@emberx/string';

  assert.equal(decamelize('innerHTML'), 'inner_html');
  assert.equal(decamelize('action_name'), 'action_name');
  assert.equal(decamelize('css-class-name'), 'css-class-name');
  assert.equal(decamelize('my favorite items'), 'my favorite items');
  ```

  @method decamelize
  @param {String} str The string to decamelize.
  @return {String} the decamelized string.
  @public
*/
export function decamelize(str: string): string {
  return DECAMELIZE_CACHE.get(str);
}

/**
  Replaces underscores, spaces, or camelCase with dashes.

  ```javascript
  import assert from 'node:assert/strict';
  import { dasherize } from '@emberx/string';

  assert.equal(dasherize('innerHTML'), 'inner-html');
  assert.equal(dasherize('action_name'), 'action-name');
  assert.equal(dasherize('css-class-name'), 'css-class-name');
  assert.equal(dasherize('my favorite items'), 'my-favorite-items');
  assert.equal(dasherize('privateDocs/ownerInvoice'), 'private-docs/owner-invoice');
  ```

  @method dasherize
  @param {String} str The string to dasherize.
  @return {String} the dasherized string.
  @public
*/
export function dasherize(str: string): string {
  return STRING_DASHERIZE_CACHE.get(str);
}

/**
  Returns the lowerCamelCase form of a string.

  ```javascript
  import assert from 'node:assert/strict';
  import { camelize } from '@emberx/string';

  assert.equal(camelize('innerHTML'), 'innerHTML');
  assert.equal(camelize('action_name'), 'actionName');
  assert.equal(camelize('css-class-name'), 'cssClassName');
  assert.equal(camelize('my favorite items'), 'myFavoriteItems');
  assert.equal(camelize('My Favorite Items'), 'myFavoriteItems');
  assert.equal(camelize('private-docs/owner-invoice'), 'privateDocs/ownerInvoice');
  ```

  @method camelize
  @param {String} str The string to camelize.
  @return {String} the camelized string.
  @public
*/
export function camelize(str: string): string {
  return CAMELIZE_CACHE.get(str);
}

/**
  Returns the UpperCamelCase form of a string.

  ```javascript
  import assert from 'node:assert/strict';
  import { classify } from '@emberx/string';

  assert.equal(classify('innerHTML'), 'InnerHTML');
  assert.equal(classify('action_name'), 'ActionName');
  assert.equal(classify('css-class-name'), 'CssClassName');
  assert.equal(classify('my favorite items'), 'MyFavoriteItems');
  assert.equal(classify('private-docs/owner-invoice'), 'PrivateDocs/OwnerInvoice');
  ```

  @method classify
  @param {String} str the string to classify
  @return {String} the classified string
  @public
*/
export function classify(str: string): string {
  return CLASSIFY_CACHE.get(str);
}

/**
  More general than decamelize. Returns the lower\_case\_and\_underscored
  form of a string.

  ```javascript
  import assert from 'node:assert/strict';
  import { underscore } from '@emberx/string';

  assert.equal(underscore('innerHTML'), 'inner_html');
  assert.equal(underscore('action_name'), 'action_name');
  assert.equal(underscore('css-class-name'), 'css_class_name');
  assert.equal(underscore('my favorite items'), 'my_favorite_items');
  assert.equal(underscore('privateDocs/ownerInvoice'), 'private_docs/owner_invoice');
  ```

  @method underscore
  @param {String} str The string to underscore.
  @return {String} the underscored string.
  @public
*/
export function underscore(str: string): string {
  return UNDERSCORE_CACHE.get(str);
}

/**
  Returns the Capitalized form of a string

  ```javascript
  import assert from 'node:assert/strict';
  import { capitalize } from '@emberx/string';

  assert.equal(capitalize('innerHTML'), 'InnerHTML');
  assert.equal(capitalize('action_name'), 'Action_name');
  assert.equal(capitalize('css-class-name'), 'Css-class-name');
  assert.equal(capitalize('my favorite items'), 'My favorite items');
  assert.equal(capitalize('privateDocs/ownerInvoice'), 'PrivateDocs/OwnerInvoice');
  ```

  @method capitalize
  @param {String} str The string to capitalize.
  @return {String} The capitalized string.
  @public
*/
export function capitalize(str: string): string {
  return CAPITALIZE_CACHE.get(str);
}
