# @emberx/string - String transformation methods for node.js and browser

General purpose string utility methods for node.js and browser, extraced from ember.js:

```js
import assert from 'node:assert/strict';
import { camelize, capitalize, classify, dasherize, decamelize, underscore } from '@emberx/string';

assert.equal(camelize('Green house'), 'greenHouse');
assert.equal(capitalize('privateDocs/ownerInvoice'), 'PrivateDocs/OwnerInvoice');
assert.equal(classify('my favorite items'), 'MyFavoriteItems');
assert.equal(dasherize('innerHTML'), 'inner-html');
assert.equal(decamelize('PrivateDocs/OwnerInvoice'), 'private_docs/owner_invoice');
assert.equal(underscore('css-class-name'), 'css_class_name');
```
