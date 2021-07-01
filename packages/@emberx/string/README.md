# @emberx/string - String transformation methods for node.js and browser

General purpose string utility methods for node.js and browser, extraced from ember.js:

```js
import { camelize, capitalize, classify, dasherize, decamelize, underscore } from '@emberx/string';

camelize('Green house') // => greenHouse
capitalize('privateDocs/ownerInvoice') // => Private_docs/Owner_invoice
classify('my favorite items') // => MyFavoriteItems
dasherize('innerHTML') // => inner-html
decamelize('PrivateDocs/OwnerInvoice') // => private_docs/owner_invoice
underscore('css-class-name') // => css_class_name
```
