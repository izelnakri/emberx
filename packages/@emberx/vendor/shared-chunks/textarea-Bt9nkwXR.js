import { h as hasDOM } from './has-dom-DdQORPzI.js';
import { action } from '../@ember/object/index.js';
import { i as isConstRef, v as valueForRef, b as isUpdatableRef, u as updateRef } from './reference-CG0yPgLy.js';
import './cache-CofLhaS4.js';
import { on } from '../@ember/modifier/on.js';
import { t as templateFactory } from './index-kwuZeaNz.js';
import { I as InternalComponent, o as opaquify } from './internal-BQ7zHrqS.js';
import { d as decorateFieldV2, i as initializeDeferredDecorator, a as decorateMethodV2 } from './runtime-CYyqkz5q-BOdRhmsS.js';
import { t as tracked } from './tracked-CRJVoC_D.js';

const InputTemplate = templateFactory(
/*
  <input
  {{!-- for compatibility --}}
  id={{this.id}}
  class={{this.class}}

  ...attributes

  type={{this.type}}
  checked={{this.checked}}
  value={{this.value}}

  {{on "change" this.change}}
  {{on "input" this.input}}
  {{on "keyup" this.keyUp}}
  {{on "paste" this.valueDidChange}}
  {{on "cut" this.valueDidChange}}
/>
*/
{
  "id": null,
  "block": "[[[11,\"input\"],[16,1,[30,0,[\"id\"]]],[16,0,[30,0,[\"class\"]]],[17,1],[16,4,[30,0,[\"type\"]]],[16,\"checked\",[30,0,[\"checked\"]]],[16,2,[30,0,[\"value\"]]],[4,[32,0],[\"change\",[30,0,[\"change\"]]],null],[4,[32,0],[\"input\",[30,0,[\"input\"]]],null],[4,[32,0],[\"keyup\",[30,0,[\"keyUp\"]]],null],[4,[32,0],[\"paste\",[30,0,[\"valueDidChange\"]]],null],[4,[32,0],[\"cut\",[30,0,[\"valueDidChange\"]]],null],[12],[13]],[\"&attrs\"],[]]",
  "moduleName": "packages/@ember/-internals/glimmer/lib/templates/input.hbs",
  "scope": () => ({
    on
  }),
  "isStrictMode": true
});

const UNINITIALIZED = Object.freeze({});
function elementForEvent(event) {
  return event.target;
}
function valueForEvent(event) {
  return elementForEvent(event).value;
}
function devirtualize(callback) {
  return event => callback(valueForEvent(event), event);
}
function valueFrom(reference) {
  if (reference === undefined) {
    return new LocalValue(undefined);
  } else if (isConstRef(reference)) {
    return new LocalValue(valueForRef(reference));
  } else if (isUpdatableRef(reference)) {
    return new UpstreamValue(reference);
  } else {
    return new ForkedValue(reference);
  }
}
class LocalValue {
  static {
    decorateFieldV2(this.prototype, "value", [tracked]);
  }
  #value = (initializeDeferredDecorator(this, "value"), void 0);
  constructor(value) {
    this.value = value;
  }
  get() {
    return this.value;
  }
  set(value) {
    this.value = value;
  }
}
class UpstreamValue {
  constructor(reference) {
    this.reference = reference;
  }
  get() {
    return valueForRef(this.reference);
  }
  set(value) {
    updateRef(this.reference, value);
  }
}
class ForkedValue {
  local;
  upstream;
  lastUpstreamValue = UNINITIALIZED;
  constructor(reference) {
    this.upstream = new UpstreamValue(reference);
  }
  get() {
    let upstreamValue = this.upstream.get();
    if (upstreamValue !== this.lastUpstreamValue) {
      this.lastUpstreamValue = upstreamValue;
      this.local = new LocalValue(upstreamValue);
    }
    return this.local.get();
  }
  set(value) {
    this.local.set(value);
  }
}
class AbstractInput extends InternalComponent {
  validateArguments() {
    super.validateArguments();
  }
  _value = valueFrom(this.args.named['value']);
  get value() {
    return this._value.get();
  }
  set value(value) {
    this._value.set(value);
  }
  valueDidChange(event) {
    this.value = valueForEvent(event);
  }

  /**
   * The `change` and `input` actions need to be overridden in the `Input`
   * subclass. Unfortunately, some ember-source builds currently uses babel
   * loose mode to transpile its classes. Having the `@action` decorator on the
   * super class creates a getter on the prototype, and when the subclass
   * overrides the method, the loose mode transpilation would emit something
   * like `Subclass.prototype['change'] = function change() { ... }`, which
   * fails because `prototype['change']` is getter-only/readonly. The correct
   * solution is to use `Object.defineProperty(prototype, 'change', ...)` but
   * that requires disabling loose mode. For now, the workaround is to add the
   * decorator only on the subclass. This is more of a configuration issue on
   * our own builds and doesn't really affect apps.
   */

  /* @action */
  static {
    decorateMethodV2(this.prototype, "valueDidChange", [action]);
  }
  change(event) {
    this.valueDidChange(event);
  }

  /* @action */
  input(event) {
    this.valueDidChange(event);
  }
  keyUp(event) {
    switch (event.key) {
      case 'Enter':
        this.listenerFor('enter')(event);
        this.listenerFor('insert-newline')(event);
        break;
      case 'Escape':
        this.listenerFor('escape-press')(event);
        break;
    }
  }
  static {
    decorateMethodV2(this.prototype, "keyUp", [action]);
  }
  listenerFor(name) {
    let listener = super.listenerFor(name);
    if (this.isVirtualEventListener(name, listener)) {
      return devirtualize(listener);
    } else {
      return listener;
    }
  }
  isVirtualEventListener(name, _listener) {
    let virtualEvents = ['enter', 'insert-newline', 'escape-press'];
    return virtualEvents.indexOf(name) !== -1;
  }
}

/**
@module @ember/component
*/
let isValidInputType;
if (hasDOM) {
  const INPUT_TYPES = Object.create(null);
  const INPUT_ELEMENT = document.createElement('input');
  INPUT_TYPES[''] = false;
  INPUT_TYPES['text'] = true;
  INPUT_TYPES['checkbox'] = true;
  isValidInputType = type => {
    let isValid = INPUT_TYPES[type];
    if (isValid === undefined) {
      try {
        INPUT_ELEMENT.type = type;
        isValid = INPUT_ELEMENT.type === type;
      } catch (_e) {
        isValid = false;
      } finally {
        INPUT_ELEMENT.type = 'text';
      }
      INPUT_TYPES[type] = isValid;
    }
    return isValid;
  };
} else {
  isValidInputType = type => type !== '';
}

/**
  The `Input` component lets you create an HTML `<input>` element.

  ```gjs
  import { Input } from '@ember/component';
    
  <template>
    <Input @value="987" />
  </template>
  ```

  creates an `<input>` element with `type="text"` and value set to 987.

  ### Text field

  If no `type` argument is specified, a default of type 'text' is used.

  ```handlebars
  Search:
  <Input @value={{this.searchWord}} />
  ```

  In this example, the initial value in the `<input>` will be set to the value of
  `this.searchWord`. If the user changes the text, the value of `this.searchWord` will also be
  updated.

  ### Actions

  The `Input` component takes a number of arguments with callbacks that are invoked in response to
  user events.

  * `enter`
  * `insert-newline`
  * `escape-press`
  * `focus-in`
  * `focus-out`
  * `key-down`
  * `key-press`
  * `key-up`

  These callbacks are passed to `Input` like this:

  ```handlebars
  <Input @value={{this.searchWord}} @enter={{this.query}} />
  ```

  Starting with Ember Octane, we recommend using the `{{on}}` modifier to call actions
  on specific events, such as the input event.

  ```handlebars
  <label for="input-name">Name:</label>
  <Input
    @id="input-name"
    @value={{this.name}}
    {{on "input" this.validateName}}
  />
  ```

  The event name (e.g. `focusout`, `input`, `keydown`) always follows the casing
  that the HTML standard uses.

  ### `<input>` HTML Attributes to Avoid

  In most cases, if you want to pass an attribute to the underlying HTML `<input>` element, you
  can pass the attribute directly, just like any other Ember component.

  ```handlebars
  <Input @type="text" size="10" />
  ```

  In this example, the `size` attribute will be applied to the underlying `<input>` element in the
  outputted HTML.

  However, there are a few attributes where you **must** use the `@` version.

  * `@type`: This argument is used to control which Ember component is used under the hood
  * `@value`: The `@value` argument installs a two-way binding onto the element. If you wanted a
    one-way binding, use `<input>` with the `value` property and the `input` event instead.
  * `@checked` (for checkboxes): like `@value`, the `@checked` argument installs a two-way binding
    onto the element. If you wanted a one-way binding, use `<input type="checkbox">` with
    `checked` and the `input` event instead.

  ### Checkbox

  To create an `<input type="checkbox">`:

  ```handlebars
  Emberize Everything:
  <Input @type="checkbox" @checked={{this.isEmberized}} name="isEmberized" />
  ```

  This will bind the checked state of this checkbox to the value of `isEmberized` -- if either one
  changes, it will be reflected in the other.

  @method Input
  @for @ember/component
  @static
  @param {Hash} options
  @public
*/
class _Input extends AbstractInput {
  static toString() {
    return 'Input';
  }

  /**
   * The HTML class attribute.
   */
  get class() {
    if (this.isCheckbox) {
      return 'ember-checkbox ember-view';
    } else {
      return 'ember-text-field ember-view';
    }
  }

  /**
   * The HTML type attribute.
   */
  get type() {
    let type = this.named('type');
    if (type === null || type === undefined) {
      return 'text';
    }
    return isValidInputType(type) ? type : 'text';
  }
  get isCheckbox() {
    return this.named('type') === 'checkbox';
  }
  _checked = valueFrom(this.args.named['checked']);
  get checked() {
    if (this.isCheckbox) {
      return this._checked.get();
    } else {
      return undefined;
    }
  }
  set checked(checked) {
    this._checked.set(checked);
  }
  change(event) {
    if (this.isCheckbox) {
      this.checkedDidChange(event);
    } else {
      super.change(event);
    }
  }
  static {
    decorateMethodV2(this.prototype, "change", [action]);
  }
  input(event) {
    if (!this.isCheckbox) {
      super.input(event);
    }
  }
  static {
    decorateMethodV2(this.prototype, "input", [action]);
  }
  checkedDidChange(event) {
    let element = event.target;
    this.checked = element.checked;
  }
  static {
    decorateMethodV2(this.prototype, "checkedDidChange", [action]);
  }
  isSupportedArgument(name) {
    let supportedArguments = ['type', 'value', 'checked', 'enter', 'insert-newline', 'escape-press'];
    return supportedArguments.indexOf(name) !== -1 || super.isSupportedArgument(name);
  }
}
const Input = opaquify(_Input, InputTemplate);

const TextareaTemplate = templateFactory(
/*
  <textarea
  {{!-- for compatibility --}}
  id={{this.id}}
  class={{this.class}}

  ...attributes

  value={{this.value}}

  {{on "change" this.change}}
  {{on "input" this.input}}
  {{on "keyup" this.keyUp}}
  {{on "paste" this.valueDidChange}}
  {{on "cut" this.valueDidChange}}
/>
*/
{
  "id": null,
  "block": "[[[11,\"textarea\"],[16,1,[30,0,[\"id\"]]],[16,0,[30,0,[\"class\"]]],[17,1],[16,2,[30,0,[\"value\"]]],[4,[32,0],[\"change\",[30,0,[\"change\"]]],null],[4,[32,0],[\"input\",[30,0,[\"input\"]]],null],[4,[32,0],[\"keyup\",[30,0,[\"keyUp\"]]],null],[4,[32,0],[\"paste\",[30,0,[\"valueDidChange\"]]],null],[4,[32,0],[\"cut\",[30,0,[\"valueDidChange\"]]],null],[12],[13]],[\"&attrs\"],[]]",
  "moduleName": "packages/@ember/-internals/glimmer/lib/templates/textarea.hbs",
  "scope": () => ({
    on
  }),
  "isStrictMode": true
});

/**
@module @ember/component
*/

class _Textarea extends AbstractInput {
  static toString() {
    return 'Textarea';
  }
  get class() {
    return 'ember-text-area ember-view';
  }

  // See abstract-input.ts for why these are needed

  change(event) {
    super.change(event);
  }
  static {
    decorateMethodV2(this.prototype, "change", [action]);
  }
  input(event) {
    super.input(event);
  }
  static {
    decorateMethodV2(this.prototype, "input", [action]);
  }
  isSupportedArgument(name) {
    let supportedArguments = ['type', 'value', 'enter', 'insert-newline', 'escape-press'];
    return supportedArguments.indexOf(name) !== -1 || super.isSupportedArgument(name);
  }
}
const Textarea = opaquify(_Textarea, TextareaTemplate);

export { Input as I, Textarea as T };
