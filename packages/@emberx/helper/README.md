# @emberx/helper - Reactive UI functions for node.js and browser

EmberX helpers are UI functions that return data when its parameters or related services state changes:

```ts
import assert from 'node:assert/strict';
import helper from '@emberx/helper';
import Component, { service, tracked, action, hbs, renderComponent, didRender } from '@emberx/component';

// A helper receives positional params, named params, and the owner's services:
const translate = helper(([key], _named, services) => services.intl.t(key));

class Intl {
  @tracked accessor currentLocale = 'en';

  translations = {
    en: { 'button.save': 'Save model' },
    es: { 'button.save': 'Guardar modelo' },
  };

  t(key) {
    return this.translations[this.currentLocale][key];
  }
}

class UserDisplay extends Component {
  @service intl;

  static includes = { translate };
  static template = hbs`
    <h5 id="locale">Current locale is: {{this.intl.currentLocale}}</h5>
    <button type="button" id="save">{{translate "button.save"}}</button>
    <button type="button" id="change-locale" {{on "click" this.changeLocale}}>Change locale</button>
  `;

  @action changeLocale(): void {
    this.intl.currentLocale = this.intl.currentLocale === 'en' ? 'es' : 'en';
  }
}

await renderComponent(UserDisplay, {
  element: document.getElementById('app'),
  owner: { services: { intl: new Intl() } },
});

assert.equal(document.querySelector('#save').textContent, 'Save model');

// The helper re-runs when the service state it read changes:
document.querySelector('#change-locale').click();
await didRender();

assert.equal(document.querySelector('#save').textContent, 'Guardar modelo');
```

## Built-in helpers

Every template has `and`, `or`, `not`, `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `assign`, `debug`,
`drop` and `take` in scope, beside Ember's `fn`, `hash`, `array`, `get`, `concat` and `on`. They
are emberx's own rather than `@ember/helper`'s, which differ: those treat `[]` and an empty
`htmlSafe` string as false and follow proxies' `isTruthy`, throw on any argument count but their
own, and Ember's `not` takes one argument where emberx's is true when every argument is falsy;
Ember's comparisons have no `forceNumber`. From JavaScript, emberx's take their arguments as an
array, `eq([a, b])`, as a template passes them.
