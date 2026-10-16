import { E as ENV } from './env-DXxsTFkM.js';
import { h as hasDOM } from './has-dom-DdQORPzI.js';
import { assert } from '../@ember/debug/lib/assert.js';
import { schedule, _backburner, _getCurrentRunLoop } from '../@ember/runloop/index.js';
import { associateDestroyableChild, destroy, registerDestructor, isDestroying, isDestroyed } from '../@glimmer/destroyable/index.js';
import { artifacts } from '../@glimmer/program/index.js';
import { R as RuntimeOpImpl } from './program-BAh__OXZ.js';
import { c as clientBuilder } from './api-DzOa0Acr.js';
import { g as runtimeOptions, i as inTransaction, r as renderComponent$1 } from './render-OqKpH1Pf.js';
import { c as consumeTag, f as isTracking, a as valueForTag, k as CURRENT_TAG, v as validateTag } from './cache-CofLhaS4.js';
import { g as get$1, a as _getProp } from './property_get-DuDs6rLg.js';
import { _ as _setProp, s as set } from './property_set-BmAQ0MGK.js';
import './guid-Cbq2sNV_.js';
import setGlobalContext from '../@glimmer/global-context/index.js';
import { a as tagForProperty, t as tagForObject, o as objectAt } from './chain-tags-B2J7DsxO.js';
import { isEmberArray } from '../@ember/array/-internals.js';
import { i as isObject } from './spec-BXl1reqK.js';
import { t as tagFor } from './meta-BJtIZDir.js';
import { contentFor } from '../@ember/-internals/runtime/lib/mixins/-proxy.js';
import { i as isProxy } from './is_proxy-Bzg0d4m4.js';
import { v as valueForRef, c as createComputeRef, a as createConstRef, h as createInvokableRef, j as createReadOnlyRef, k as createUnboundRef } from './reference-CG0yPgLy.js';
import { i as internalHelper } from './internal-helper-Bz1lpDXr.js';
import { i as isHTMLSafe } from './index-D-xTBV4B.js';
import isArray from '../@ember/array/lib/is-array.js';
import { isFactory } from '../@ember/-internals/owner/index.js';
import { _instrumentStart } from '../@ember/instrumentation/index.js';
import { g as getComponentTemplate } from './template-Dc_cBOoX.js';
import { a as getInternalHelperManager, j as setInternalHelperManager, g as getInternalComponentManager } from './api-DlJKfm_f.js';
import { h as hash, f as fn, a as array } from './hash-b373B4IL.js';
import { g as get, c as concat } from './get-ZhOO_1qS.js';
import { o as on } from './on-B-5KCq9L.js';
import { T as TEMPLATE_ONLY_COMPONENT_MANAGER, t as templateOnlyComponent } from './template-only-DKNcKM5b.js';
import { i as isCurlyManager } from './curly-brand-B_F79Dep.js';
import { i as isClassicHelper } from './helper-brand-C9_8vvOf.js';
import { dasherize } from '../@ember/-internals/string/index.js';
import { a as uniqueId } from './unique-id-BJb1p8EG.js';
import { r as renderers } from './renderers-BjnN26_f.js';
import { E as EvaluationContextImpl } from './program-context-WVlzpPdi.js';

/**
@module ember
*/
const disallowDynamicResolution = internalHelper(({
  positional,
  named
}) => {
  const nameOrValueRef = positional[0];
  let typeRef = named['type'];
  let locRef = named['loc'];
  let originalRef = named['original'];
  // assert('[BUG] expecting a string literal for the `type` argument', isConstRef(typeRef));
  // assert('[BUG] expecting a string literal for the `loc` argument', isConstRef(locRef));
  // assert('[BUG] expecting a string literal for the `original` argument', isConstRef(originalRef));
  valueForRef(typeRef);
  valueForRef(locRef);
  valueForRef(originalRef);
  return createComputeRef(() => {
    let nameOrValue = valueForRef(nameOrValueRef);
    return nameOrValue;
  });
});

let helper;
{
  helper = args => {
    let arg = args.positional[0];
    return arg;
  };
}
const inElementNullCheckHelper = internalHelper(helper);

const normalizeClassHelper = internalHelper(({
  positional
}) => {
  return createComputeRef(() => {
    let classNameArg = positional[0];
    let valueArg = positional[1];
    let classNameParts = valueForRef(classNameArg).split('.');
    let className = classNameParts[classNameParts.length - 1];
    let value = valueForRef(valueArg);
    if (value === true) {
      return dasherize(className);
    } else if (!value && value !== 0) {
      return '';
    } else {
      return String(value);
    }
  });
});

/**
  @module ember
*/

const resolve = internalHelper(({
  positional
}, owner) => {
  let fullNameRef = positional[0];
  let fullName = valueForRef(fullNameRef);
  return createConstRef(owner.factoryFor(fullName)?.class);
});

/**
@module ember
*/

/**
  This reference is used to get the `[]` tag of iterables, so we can trigger
  updates to `{{each}}` when it changes. It is put into place by a template
  transform at build time, similar to the (-each-in) helper
*/
const trackArray = internalHelper(({
  positional
}) => {
  const inner = positional[0];
  return createComputeRef(() => {
    let iterable = valueForRef(inner);
    if (isObject(iterable)) {
      consumeTag(tagForProperty(iterable, '[]'));
    }
    return iterable;
  });
});

/**
@module @ember/helper
*/

/**
  The `{{#each}}` keyword loops over elements in a collection. It is an extension
  of the base Handlebars `{{#each}}` helper.

  The default behavior of `{{#each}}` is to yield its inner block once for every
  item in an array passing the item as the first block parameter.

  ```gjs {data-filename="app/components/developer-list.gjs"}
  import Component from '@glimmer/component';

  export default class DeveloperList extends Component {
    developers = [
      { name: 'Yehuda' },
      { name: 'Tom' },
      { name: 'Paul' },
    ];

    <template>
      <ul>
        {{#each this.developers as |person|}}
          <li>Hello, {{person.name}}!</li>
        {{/each}}
      </ul>
    </template>
  }
  ```

  The same rules apply to arrays of primitives:

  ```gjs {data-filename="app/components/developer-names.gjs"}
  import Component from '@glimmer/component';

  export default class DeveloperNames extends Component {
    developerNames = ['Yehuda', 'Tom', 'Paul'];

    <template>
      <ul>
        {{#each this.developerNames as |name|}}
          <li>Hello, {{name}}!</li>
        {{/each}}
      </ul>
    </template>
  }
  ```

  `{{#each}}` also supports native JavaScript [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
  values and other iterables:

  ```gjs {data-filename="app/components/developer-set.gjs"}
  import Component from '@glimmer/component';

  export default class DeveloperSet extends Component {
    developers = new Set([
      { name: 'Yehuda' },
      { name: 'Tom' },
      { name: 'Paul' },
    ]);

    <template>
      <ul>
        {{#each this.developers as |person|}}
          <li>Hello, {{person.name}}!</li>
        {{/each}}
      </ul>
    </template>
  }
  ```

  During iteration, the index of each item in the array is provided as a second
  block parameter:

  ```gjs {data-filename="app/components/developer-list-with-index.gjs"}
  import Component from '@glimmer/component';

  export default class DeveloperListWithIndex extends Component {
    developers = [
      { name: 'Yehuda' },
      { name: 'Tom' },
      { name: 'Paul' },
    ];

    <template>
      <ul>
        {{#each this.developers as |person index|}}
          <li>Hello, {{person.name}}! You're number {{index}} in line</li>
        {{/each}}
      </ul>
    </template>
  }
  ```

  `#each` is a keyword and does not need to be imported.

  ### Specifying Keys

  In order to improve rendering speed, Ember will try to reuse the DOM elements
  where possible. Specifically, if the same item is present in the array both
  before and after the change, its DOM output will be reused.

  The `key` option is used to tell Ember how to determine if the items in the
  array being iterated over with `{{#each}}` has changed between renders. By
  default the item's object identity is used.

  This is usually sufficient, so in most cases, the `key` option is simply not
  needed. However, in some rare cases, the objects' identities may change even
  though they represent the same underlying data.

  For example, mapping over `people` produces a new array of new objects on each
  render. Use `key` so Ember can match items across those renders:

  ```gjs {data-filename="app/components/mapped-developers.gjs"}
  import Component from '@glimmer/component';

  export default class MappedDevelopers extends Component {
    people = [
      { name: 'Yehuda' },
      { name: 'Tom' },
      { name: 'Paul' },
    ];

    get developers() {
      return this.people.map((person) => {
        return { ...person, type: 'developer' };
      });
    }

    <template>
      <ul>
        {{#each this.developers key="name" as |person|}}
          <li>Hello, {{person.name}}!</li>
        {{/each}}
      </ul>
    </template>
  }
  ```

  By doing so, Ember will use the value of the property specified (`person.name`
  in the example) to find a "match" from the previous render. That is, if Ember
  has previously seen an object from the `developers` array with a matching
  name, its DOM elements will be re-used.

  There are two special values for `key`:

    * `@index` - The index of the item in the array.
    * `@identity` - The item in the array itself.

  ### {{else}} condition

  `{{#each}}` can have a matching `{{else}}`. The contents of this block will render
  if the collection is empty.

  ```gjs {data-filename="app/components/available-developers.gjs"}
  import Component from '@glimmer/component';

  export default class AvailableDevelopers extends Component {
    developers = [];

    <template>
      <ul>
        {{#each this.developers as |person|}}
          <li>{{person.name}} is available!</li>
        {{else}}
          <li>Sorry, nobody is available for this task.</li>
        {{/each}}
      </ul>
    </template>
  }
  ```

  @method each
  @for Keywords
  @static
  @noimport
  @public
 */

/**
  The `{{#each-in}}` keyword loops over properties on an object, or entries in a
  native JavaScript [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).

  For example, given this component definition:

  ```gjs {data-filename="app/components/developer-details.gjs"}
  import Component from '@glimmer/component';
  import { tracked } from '@glimmer/tracking';

  export default class DeveloperDetails extends Component {
    @tracked developer = {
      name: 'Shelly Sails',
      age: 42,
    };

    <template>
      <ul>
        {{#each-in this.developer as |key value|}}
          <li>{{key}}: {{value}}</li>
        {{/each-in}}
      </ul>
    </template>
  }
  ```

  This template would display all properties on the `developer`
  object in a list, outputting their name and age:

  ```html
  <ul>
    <li>name: Shelly Sails</li>
    <li>age: 42</li>
  </ul>
  ```

  The same pattern works with a `Map`:

  ```gjs {data-filename="app/components/developer-map.gjs"}
  import Component from '@glimmer/component';

  export default class DeveloperMap extends Component {
    map = new Map([
      ['name', 'Shelly Sails'],
      ['age', 42],
    ]);

    <template>
      <ul>
        {{#each-in this.map as |key value|}}
          <li>{{key}}: {{value}}</li>
        {{/each-in}}
      </ul>
    </template>
  }
  ```

  When a `Map` uses object keys, you can pass `key="@identity"` to explicitly
  track entries across re-renders using the JavaScript identity of each key:

  ```gjs {data-filename="app/components/object-keyed-map.gjs"}
  import Component from '@glimmer/component';

  export default class ObjectKeyedMap extends Component {
    map = new Map([
      [{ name: 'one' }, 'foo'],
      [{ name: 'two' }, 'bar'],
    ]);

    <template>
      <ul>
        {{#each-in this.map key="@identity" as |key value|}}
          <li>{{key.name}}: {{value}}</li>
        {{/each-in}}
      </ul>
    </template>
  }
  ```

  `#each-in` is a keyword and does not need to be imported.

  @method each-in
  @static
  @noimport
  @for Keywords
  @public
  @since 2.1.0
*/
class EachInWrapper {
  constructor(inner) {
    this.inner = inner;
  }
}
const eachIn = internalHelper(({
  positional
}) => {
  const inner = positional[0];
  return createComputeRef(() => {
    let iterable = valueForRef(inner);
    consumeTag(tagForObject(iterable));
    if (isProxy(iterable)) {
      // this is because the each-in doesn't actually get(proxy, 'key') but bypasses it
      // and the proxy's tag is lazy updated on access
      iterable = contentFor(iterable);
    }
    return new EachInWrapper(iterable);
  });
});

/**
@module @ember/helper
*/

/**
  The `mut` helper is a shortcut for updating for args.
    
  However, defining update functions on your backing class is preferable to using `mut`.
    
  More directly: Don't use `mut`. 

  The `mut` helper, when used with `fn`, will return a function that
  sets the value passed to `mut` to its first argument. As an example, we can create a
  button that increments a value passing the value directly to the `fn`:

  ```handlebars
  <MyChild @childClickCount={{this.totalClicks}} @clickCountChange={{fn (mut this.totalClicks)}} />
  ```

  The child `Component` would invoke the function with the new click count:

  ```gjs {data-filename="app/components/my-child.gjs"}
  import Component from '@glimmer/component';
  import { action } from '@ember/object';
    
  export default class MyChild extends Component {
    @action
    update() {
      this.args.clickCountChange(this.args.childClickCount + 1);
    }
    
    <template>
      <button {{on "click" this.update}}>
        Click me!
      </button>
    </template>
  }
  ```

  The `mut` helper changes the `totalClicks` value to what was provided as the `fn` argument.

  @method mut
  @param {Object} [attr] the "two-way" attribute that can be modified.
  @static
  @for Keywords
  @public
*/

const mut = internalHelper(({
  positional
}) => {
  let ref = positional[0];
  return createInvokableRef(ref);
});

/**
@module @ember/helper
*/


/**
  The `readonly` helper let's you specify that a binding is one-way only,
  instead of two-way.
  
  This is a vestigial helper from the days of `@ember/component` and does not apply to
  components extending from `@glimmer/component`.
    
  When you pass a `readonly` binding from an outer context (e.g. parent component),
  to to an inner context (e.g. child component), you are saying that changing that
  property in the inner context does not change the value in the outer context.

  To specify that a binding is read-only, when invoking the child `Component`:

  ```app/components/my-parent.js
  export default class MyParent extends Component {
    totalClicks = 3;
  }
  ```

  Now, when you update `childClickCount`:

  ```app/components/my-child.js
  export default class MyChild extends Component {
    click() {
      this.incrementProperty('childClickCount');
    }
  }
  ```

  The value updates in the child component, but not the parent component:

  ```app/templates/components/my-child.hbs
  {{log childClickCount}} //-> 4
  ```

  ```app/templates/components/my-parent.hbs
  {{log totalClicks}} //-> 3
  <MyChild @childClickCount={{readonly totalClicks}} />
  ```
  or
  ```app/templates/components/my-parent.hbs
  {{log totalClicks}} //-> 3
  {{my-child childClickCount=(readonly totalClicks)}}
  ```

  ### Objects and Arrays

  When passing a property that is a complex object (e.g. object, array) instead of a primitive object (e.g. number, string),
  only the reference to the object is protected using the readonly helper.
  This means that you can change properties of the object both on the parent component, as well as the child component.
  The `readonly` binding behaves similar to the `const` keyword in JavaScript.

  Let's look at an example:

  First let's set up the parent component:

  ```app/components/my-parent.js
  import Component from '@ember/component';

  export default class MyParent extends Component {
    clicks: null,

    init() {
      this._super(...arguments);
      this.set('clicks', { total: 3 });
    }
  }
  ```

  ```app/templates/components/my-parent.hbs
  {{log clicks.total}} //-> 3
  <MyChild @childClicks={{readonly clicks}} />
  ```
  ```app/templates/components/my-parent.hbs
  {{log clicks.total}} //-> 3
  {{my-child childClicks=(readonly clicks)}}
  ```

  Now, if you update the `total` property of `childClicks`:

  ```app/components/my-child.js
  import Component from '@ember/component';

  export default class MyChild extends Component {
    click() {
      this.get('clicks').incrementProperty('total');
    }
  }
  ```

  You will see the following happen:

  ```app/templates/components/my-parent.hbs
  {{log clicks.total}} //-> 4
  <MyChild @childClicks={{readonly clicks}} />
  ```
  or
  ```app/templates/components/my-parent.hbs
  {{log clicks.total}} //-> 4
  {{my-child childClicks=(readonly clicks)}}
  ```

  ```app/templates/components/my-child.hbs
  {{log childClicks.total}} //-> 4
  ```

  @method readonly
  @param {Object} [attr] the read-only attribute.
  @for Keywords
  @noimport
  @static
  @private
*/
const readonly = internalHelper(({
  positional
}) => {
  let firstArg = positional[0];
  return createReadOnlyRef(firstArg);
});

/**
@module @ember/helper
*/


/**
  The `{{unbound}}` helper disconnects the one-way binding of a property,
  essentially freezing its value at the moment of rendering. For example,
  in this example the display of the variable `name` will not change even
  if it is set with a new value:

  ```handlebars
  {{unbound this.name}}
  ```

  Like any helper, the `unbound` helper can accept a nested helper expression.
  This allows for custom helpers to be rendered unbound:

  ```handlebars
  {{unbound (some-custom-helper)}}
  {{unbound (capitalize this.name)}}
  {{! You can use any helper, including unbound, in a nested expression }}
  {{capitalize (unbound this.name)}}
  ```

  The `unbound` helper only accepts a single argument, and it return an
  unbound value.
 
 `unbound` is a template keyword and does not need to be imported.

  @method unbound
  @static
  @noimport
  @for Keywords
  @public
*/

const unbound = internalHelper(({
  positional,
  named
}) => {
  return createUnboundRef(valueForRef(positional[0]));
});

function instrumentationPayload(name) {
  return {
    object: `component:${name}`
  };
}
function componentFor(name, owner) {
  let fullName = `component:${name}`;
  return owner.factoryFor(fullName) || null;
}
function lookupComponentPair(owner, name) {
  let component = componentFor(name, owner);
  if (isFactory(component) && component.class) {
    let layout = getComponentTemplate(component.class);
    if (layout !== undefined) {
      return {
        component,
        layout
      };
    }
  }
  if (component === null) {
    return null;
  } else {
    return {
      component,
      layout: null
    };
  }
}
const BUILTIN_KEYWORD_HELPERS = {
  mut,
  readonly,
  unbound,
  '-hash': hash,
  '-each-in': eachIn,
  '-normalize-class': normalizeClassHelper,
  '-resolve': resolve,
  '-track-array': trackArray,
  '-in-el-null': inElementNullCheckHelper
};
const BUILTIN_HELPERS = {
  ...BUILTIN_KEYWORD_HELPERS,
  array,
  concat,
  fn,
  get,
  hash,
  'unique-id': uniqueId,
  // In prod builds, this is a no-op helper and is unused in practice. We shouldn't need
  // to add it at all, but the current test build doesn't produce a "prod compiler", so
  // we ended up running the debug-build for the template compliler in prod tests. Once
  // that is fixed, this can be conditionally included only in DEBUG. For now, this
  // allows the test to work and does not really harm anything, since it's just a no-op
  // pass-through helper. Keeping it inside the object literal (rather than a top-level
  // conditional assignment) keeps this module free of top-level side effects so that
  // consumers that never resolve anything dynamically can tree-shake the whole table.
  '-disallow-dynamic-resolution': disallowDynamicResolution
};

// With the implementation of RFC #1006(https://rfcs.emberjs.com/id/1006-deprecate-action-template-helper), the `action` modifer was removed. It was the
// only built-in keyword modifier, so this object is currently empty.
const BUILTIN_KEYWORD_MODIFIERS = {};
const BUILTIN_MODIFIERS = {
  ...BUILTIN_KEYWORD_MODIFIERS,
  on
};
class ResolverImpl {
  componentDefinitionCache = new Map();
  lookupPartial() {
    return null;
  }
  lookupHelper(name, owner) {
    let helper = BUILTIN_HELPERS[name];
    if (helper !== undefined) {
      return helper;
    }
    let factory = owner.factoryFor(`helper:${name}`);
    if (factory === undefined) {
      return null;
    }
    let definition = factory.class;
    if (definition === undefined) {
      return null;
    }
    if (typeof definition === 'function' && isClassicHelper(definition)) {
      // For classic class based helpers, we need to pass the factoryFor result itself rather
      // than the raw value (`factoryFor(...).class`). This is because injections are already
      // bound in the factoryFor result, including type-based injections

      // The classic helper manager is registered on the classic `Helper` base
      // class; deriving it from the definition (rather than importing it from
      // the module that defines `Helper`) keeps this module from pulling in
      // the classic object model when no classic helpers are in use.
      let manager = getInternalHelperManager(definition);
      {
        setInternalHelperManager(manager, factory);
      }
      return factory;
    }
    return definition;
  }
  lookupBuiltInHelper(name) {
    return BUILTIN_KEYWORD_HELPERS[name] ?? null;
  }
  lookupModifier(name, owner) {
    let builtin = BUILTIN_MODIFIERS[name];
    if (builtin !== undefined) {
      return builtin;
    }
    let modifier = owner.factoryFor(`modifier:${name}`);
    if (modifier === undefined) {
      return null;
    }
    return modifier.class || null;
  }
  lookupBuiltInModifier(name) {
    return BUILTIN_KEYWORD_MODIFIERS[name] ?? null;
  }
  lookupComponent(name, owner) {
    let pair = lookupComponentPair(owner, name);
    if (pair === null) {
      return null;
    }
    let template = null;
    let key;
    if (pair.component === null) {
      key = template = pair.layout(owner);
    } else {
      key = pair.component;
    }
    let cachedComponentDefinition = this.componentDefinitionCache.get(key);
    if (cachedComponentDefinition !== undefined) {
      return cachedComponentDefinition;
    }
    if (template === null && pair.layout !== null) {
      template = pair.layout(owner);
    }
    let finalizer = _instrumentStart('render.getComponentDefinition', instrumentationPayload, name);
    let definition = null;
    if (pair.component === null) {
      definition = {
        state: templateOnlyComponent(undefined, name),
        manager: TEMPLATE_ONLY_COMPONENT_MANAGER,
        template
      };
    } else {
      let factory = pair.component;
      let ComponentClass = factory.class;
      let manager = getInternalComponentManager(ComponentClass);
      definition = {
        state: isCurlyManager(manager) ? factory : ComponentClass,
        manager,
        template
      };
    }
    finalizer();
    this.componentDefinitionCache.set(key, definition);
    return definition;
  }
}

function toIterator(iterable) {
  if (iterable instanceof EachInWrapper) {
    return toEachInIterator(iterable.inner);
  } else {
    return toEachIterator(iterable);
  }
}
function toEachInIterator(iterable) {
  if (!isIndexable(iterable)) {
    return null;
  }
  if (Array.isArray(iterable) || isEmberArray(iterable)) {
    return ObjectIterator.fromIndexable(iterable);
  } else if (isNativeIterable(iterable)) {
    return MapLikeNativeIterator.from(iterable);
  } else if (hasForEach(iterable)) {
    return ObjectIterator.fromForEachable(iterable);
  } else {
    return ObjectIterator.fromIndexable(iterable);
  }
}
function toEachIterator(iterable) {
  if (!isObject(iterable)) {
    return null;
  }
  if (Array.isArray(iterable)) {
    return ArrayIterator.from(iterable);
  } else if (isEmberArray(iterable)) {
    return EmberArrayIterator.from(iterable);
  } else if (isNativeIterable(iterable)) {
    return ArrayLikeNativeIterator.from(iterable);
  } else if (hasForEach(iterable)) {
    return ArrayIterator.fromForEachable(iterable);
  } else {
    return null;
  }
}
class BoundedIterator {
  position = 0;
  constructor(length) {
    this.length = length;
  }
  isEmpty() {
    return false;
  }
  memoFor(position) {
    return position;
  }
  next() {
    let {
      length,
      position
    } = this;
    if (position >= length) {
      return null;
    }
    let value = this.valueFor(position);
    let memo = this.memoFor(position);
    this.position++;
    return {
      value,
      memo
    };
  }
}
class ArrayIterator extends BoundedIterator {
  static from(iterable) {
    return iterable.length > 0 ? new this(iterable) : null;
  }
  static fromForEachable(object) {
    let array = [];
    object.forEach(item => array.push(item));
    return this.from(array);
  }
  constructor(array) {
    super(array.length);
    this.array = array;
  }
  valueFor(position) {
    return this.array[position];
  }
}
class EmberArrayIterator extends BoundedIterator {
  static from(iterable) {
    return iterable.length > 0 ? new this(iterable) : null;
  }
  constructor(array) {
    super(array.length);
    this.array = array;
  }
  valueFor(position) {
    return objectAt(this.array, position);
  }
}
class ObjectIterator extends BoundedIterator {
  static fromIndexable(obj) {
    let keys = Object.keys(obj);
    if (keys.length === 0) {
      return null;
    } else {
      let values = [];
      for (let key of keys) {
        let value;
        value = obj[key];

        // Add the tag of the returned value if it is an array, since arrays
        // should always cause updates if they are consumed and then changed
        if (isTracking()) {
          consumeTag(tagFor(obj, key));
          if (Array.isArray(value)) {
            consumeTag(tagFor(value, '[]'));
          }
        }
        values.push(value);
      }
      return new this(keys, values);
    }
  }
  static fromForEachable(obj) {
    let keys = [];
    let values = [];
    let length = 0;
    let isMapLike = false;

    // Not using an arrow function here so we can get an accurate `arguments`
    obj.forEach(function (value, key) {
      isMapLike = isMapLike || arguments.length >= 2;
      if (isMapLike) {
        keys.push(key);
      }
      values.push(value);
      length++;
    });
    if (length === 0) {
      return null;
    } else if (isMapLike) {
      return new this(keys, values);
    } else {
      return new ArrayIterator(values);
    }
  }
  constructor(keys, values) {
    super(values.length);
    this.keys = keys;
    this.values = values;
  }
  valueFor(position) {
    return this.values[position];
  }
  memoFor(position) {
    return this.keys[position];
  }
}
class NativeIterator {
  static from(iterable) {
    let iterator = iterable[Symbol.iterator]();
    let result = iterator.next();
    let {
      done
    } = result;
    if (done) {
      return null;
    } else {
      return new this(iterator, result);
    }
  }
  position = 0;
  constructor(iterable, result) {
    this.iterable = iterable;
    this.result = result;
  }
  isEmpty() {
    return false;
  }
  next() {
    let {
      iterable,
      result,
      position
    } = this;
    if (result.done) {
      return null;
    }
    let value = this.valueFor(result, position);
    let memo = this.memoFor(result, position);
    this.position++;
    this.result = iterable.next();
    return {
      value,
      memo
    };
  }
}
class ArrayLikeNativeIterator extends NativeIterator {
  valueFor(result) {
    return result.value;
  }
  memoFor(_result, position) {
    return position;
  }
}
class MapLikeNativeIterator extends NativeIterator {
  valueFor(result) {
    return result.value[1];
  }
  memoFor(result) {
    return result.value[0];
  }
}
function hasForEach(value) {
  return value != null && typeof value['forEach'] === 'function';
}
function isNativeIterable(value) {
  return value != null && typeof value[Symbol.iterator] === 'function';
}
function isIndexable(value) {
  return value !== null && (typeof value === 'object' || typeof value === 'function');
}

function toBool(predicate) {
  if (isProxy(predicate)) {
    consumeTag(tagForProperty(predicate, 'content'));
    return Boolean(get$1(predicate, 'isTruthy'));
  } else if (isArray(predicate)) {
    consumeTag(tagForProperty(predicate, '[]'));
    return predicate.length !== 0;
  } else if (isHTMLSafe(predicate)) {
    return Boolean(predicate.toString());
  } else {
    return Boolean(predicate);
  }
}

///////////

// Setup global context

setGlobalContext({
  scheduleRevalidate() {
    _backburner.ensureInstance();
  },
  toBool,
  toIterator,
  getProp: _getProp,
  setProp: _setProp,
  getPath: get$1,
  setPath: set,
  scheduleDestroy(destroyable, destructor) {
    schedule('actions', null, destructor, destroyable);
  },
  scheduleDestroyed(finalizeDestructor) {
    schedule('destroy', null, finalizeDestructor);
  },
  warnIfStyleNotTrusted(value) {
  },
  assert(test, msg, options) {
  },
  deprecate(msg, test, options) {
  }
});

///////////

// Define environment delegate

class EmberEnvironmentDelegate {
  enableDebugTooling = ENV._DEBUG_RENDER_TREE;
  constructor(owner, isInteractive) {
    this.owner = owner;
    this.isInteractive = isInteractive;
  }
  onTransactionCommit() {}
}

const NO_OP = () => {};

// This wrapper logic prevents us from rerendering in case of a hard failure
// during render. This prevents infinite revalidation type loops from occuring,
// and ensures that errors are not swallowed by subsequent follow on failures.
function errorLoopTransaction(fn) {
  {
    return fn;
  }
}

/**
 * The interface the `RendererState` needs from a render root. The base
 * renderer only ever creates `ComponentRootState`s; the classic renderer
 * (`./renderer`) adds `ClassicRootState` for outlet/classic-component roots.
 */

class ComponentRootState {
  type = 'component';
  #result;
  #render;
  constructor(state, definition, options) {
    this.#render = errorLoopTransaction(() => {
      let iterator = renderComponent$1(state.context, state.builder(state.env, options.into), state.owner, definition, options?.args);
      let result = this.#result = iterator.sync();
      associateDestroyableChild(this, this.#result);
      this.#render = errorLoopTransaction(() => {
        if (isDestroying(result) || isDestroyed(result)) return;
        return result.rerender({
          alwaysRevalidate: false
        });
      });
    });
  }
  isFor(_possibleRoot) {
    return false;
  }
  render() {
    // A root can be destroyed before its first render, e.g. when it was added
    // during a render transaction and destroyed before the transaction got to it.
    if (isDestroying(this)) return;
    this.#render();
  }
  destroy() {
    destroy(this);
  }
  get destroyed() {
    return isDestroyed(this);
  }
  get result() {
    return this.#result;
  }
}
function _resetRenderers() {
  renderers.length = 0;
}
function register(renderer) {
  renderers.push(renderer);
}
function deregister(renderer) {
  let index = renderers.indexOf(renderer);
  renderers.splice(index, 1);
}
function loopBegin() {
  for (let renderer of renderers) {
    renderer.rerender();
  }
}
let renderSettledDeferred = null;
/*
  Returns a promise which will resolve when rendering has settled. Settled in
  this context is defined as when all of the tags in use are "current" (e.g.
  `renderers.every(r => r._isValid())`). When this is checked at the _end_ of
  the run loop, this essentially guarantees that all rendering is completed.

  @method renderSettled
  @returns {Promise<void>} a promise which fulfills when rendering has settled
*/
function renderSettled() {
  if (renderSettledDeferred === null) {
    let resolve;
    let promise = new Promise(r => resolve = r);
    renderSettledDeferred = {
      promise,
      resolve
    };
    // if there is no current runloop, the promise created above will not have
    // a chance to resolve (because its resolved in backburner's "end" event)
    if (!_getCurrentRunLoop()) {
      // ensure a runloop has been kicked off
      _backburner.schedule('actions', null, NO_OP);
    }
  }
  return renderSettledDeferred.promise;
}
function resolveRenderPromise() {
  if (renderSettledDeferred !== null) {
    let resolve = renderSettledDeferred.resolve;
    renderSettledDeferred = null;
    _backburner.join(null, resolve);
  }
}
let loops = 0;
function loopEnd() {
  for (let renderer of renderers) {
    if (!renderer.isValid()) {
      if (loops > ENV._RERENDER_LOOP_LIMIT) {
        loops = 0;
        // TODO: do something better
        renderer.destroy();
        throw new Error('infinite rendering invalidation detected');
      }
      loops++;
      return _backburner.join(null, NO_OP);
    }
  }
  loops = 0;
  resolveRenderPromise();
}
_backburner.on('begin', loopBegin);
_backburner.on('end', loopEnd);
class RendererState {
  static create(data, renderer) {
    const state = new RendererState(data, renderer);
    associateDestroyableChild(renderer, state);
    return state;
  }
  #data;
  #lastRevision = -1;
  #inRenderTransaction = false;
  #destroyed = false;
  #roots = [];
  #removedRoots = [];
  #registered = false;
  constructor(data, renderer) {
    this.#data = data;
    registerDestructor(this, () => {
      this.clearAllRoots(renderer);
    });
  }
  get debug() {
    return {
      roots: this.#roots,
      inRenderTransaction: this.#inRenderTransaction,
      isInteractive: this.isInteractive
    };
  }
  get roots() {
    return this.#roots;
  }
  get owner() {
    return this.#data.owner;
  }
  get builder() {
    return this.#data.builder;
  }
  get context() {
    return this.#data.context;
  }
  get env() {
    return this.context.env;
  }
  get isInteractive() {
    return this.#data.context.env.isInteractive;
  }
  renderRoot(root, renderer) {
    let roots = this.#roots;
    roots.push(root);
    associateDestroyableChild(this, root);

    // Destroying a root (e.g. via the `RenderResult` from `renderComponent`)
    // must release it, otherwise the root -- and the renderer, which stays in
    // the global `renderers` list while it has roots -- is retained forever.
    registerDestructor(root, () => {
      if (this.#inRenderTransaction) {
        // `renderRoots` is iterating `roots`; let it remove this one.
        if (!this.#removedRoots.includes(root)) this.#removedRoots.push(root);
      } else {
        this.#removeRoot(root, renderer);
      }
    });
    this.#register(renderer);
    this.#renderRootsTransaction(renderer);
    return root;
  }
  #renderRootsTransaction(renderer) {
    if (this.#inRenderTransaction) {
      // currently rendering roots, a new root was added and will
      // be processed by the existing _renderRoots invocation
      return;
    }

    // used to prevent calling _renderRoots again (see above)
    // while we are actively rendering roots
    this.#inRenderTransaction = true;
    let completedWithoutError = false;
    try {
      this.renderRoots(renderer);
      completedWithoutError = true;
    } finally {
      if (!completedWithoutError) {
        this.#lastRevision = valueForTag(CURRENT_TAG);
      }
      this.#inRenderTransaction = false;
    }
  }
  renderRoots(renderer) {
    let roots = this.#roots;
    let removedRoots = this.#removedRoots;
    let initialRootsLength;
    do {
      initialRootsLength = roots.length;
      inTransaction(this.context.env, () => {
        // ensure that for the first iteration of the loop
        // each root is processed
        for (let i = 0; i < roots.length; i++) {
          let root = roots[i];
          (false && !(root) && assert('has root', root));
          if (root.destroyed) {
            // add to the list of roots to be removed
            // they will be removed from `this._roots` later
            removedRoots.push(root);

            // skip over roots that have been marked as destroyed
            continue;
          }

          // when processing non-initial reflush loops,
          // do not process more roots than needed
          if (i >= initialRootsLength) {
            continue;
          }
          root.render();
        }
        this.#lastRevision = valueForTag(CURRENT_TAG);
      });
    } while (roots.length > initialRootsLength);

    // remove any roots that were destroyed during this transaction
    while (removedRoots.length) {
      this.#removeRoot(removedRoots.pop(), renderer);
    }
  }
  #removeRoot(root, renderer) {
    let roots = this.#roots;
    let rootIndex = roots.indexOf(root);
    if (rootIndex !== -1) {
      roots.splice(rootIndex, 1);
    }
    if (roots.length === 0) {
      this.#deregister(renderer);
    }
  }
  #register(renderer) {
    if (!this.#registered) {
      this.#registered = true;
      register(renderer);
    }
  }
  #deregister(renderer) {
    if (this.#registered) {
      this.#registered = false;
      deregister(renderer);
    }
  }
  scheduleRevalidate(renderer) {
    _backburner.scheduleOnce('render', this, this.revalidate, renderer);
  }
  isValid() {
    return this.#destroyed || this.#roots.length === 0 || validateTag(CURRENT_TAG, this.#lastRevision);
  }
  revalidate(renderer) {
    if (this.isValid()) {
      return;
    }
    this.#renderRootsTransaction(renderer);
  }
  clearAllRoots(renderer) {
    let roots = this.#roots;
    for (let root of roots) {
      destroy(root);
    }
    this.#removedRoots.length = 0;
    this.#roots = [];
    this.#deregister(renderer);
  }
}

/**
 * The returned object from `renderComponent`
 * @public
 * @module @ember/renderer
 */

function intoTarget(into) {
  if ('element' in into) {
    return into;
  } else {
    return {
      element: into,
      nextSibling: null
    };
  }
}

/**
 * Render a component into a DOM element.
 *
 * @method renderComponent
 * @static
 * @for @ember/renderer
 * @param {Object} component The component to render.
 * @param {Object} options
 * @param {Element} options.into Where to render the component in to.
 * @param {Object} [options.owner] Optionally specify the owner to use. This will be used for injections, and overall cleanup.
 * @param {Object} [options.env] Optional renderer configuration
 * @param {Object} [options.args] Optionally pass args in to the component. These may be reactive as long as it is an object or object-like
 * @public
 */
function renderComponent(
/**
 * The component definition to render.
 *
 * Any component that has had its manager registered is valid.
 * For the component-types that ship with ember, manager registration
 * does not need to be worried about.
 */
component, {
  owner = {},
  env,
  into,
  args
}) {
  /**
   * SAFETY: we should figure out what we need out of a `document` and narrow the API.
   *         this exercise should also end up beginning to define what we need for CLI rendering (or to other outputs)
   */
  let document = env && 'document' in env ? env?.['document'] : globalThis.document;

  // Reuse renderer per owner to avoid creating multiple EvaluationContexts
  // which can cause tracking frame conflicts
  let renderer = RENDERER_CACHE.get(owner);
  if (!renderer) {
    renderer = BaseRenderer.strict(owner, document, {
      ...env,
      isInteractive: env?.isInteractive ?? true,
      hasDOM: env && 'hasDOM' in env ? Boolean(env?.['hasDOM']) : true
    });
    RENDERER_CACHE.set(owner, renderer);
  }

  /**
   * Replace all contents, if we've rendered multiple times.
   *
   * https://github.com/emberjs/rfcs/pull/1099/files#diff-2b962105b9083ca84579cdc957f27f49407440f3c5078083fa369ec18cc46da8R365
   *
   * We could later add an option to not do this behavior
   *
   * NOTE: destruction is async
   */
  let existing = RENDER_CACHE.get(into);
  if (existing?.glimmerResult) {
    existing.result.destroy();
  }
  /**
   * We can only replace the inner HTML the first time.
   * Because destruction is async, it won't be safe to
   * do this again, and we'll have to rely on the above destroy.
   */
  if (!existing && into instanceof Element) {
    into.innerHTML = '';
  }

  /**
   * If there's an existing render result with valid bounds, use its
   * firstNode as the nextSibling so that new content is inserted at
   * the same DOM position. This ensures stable ordering when multiple
   * renderComponent calls target the same element and one is re-invoked
   * (e.g., due to tracked dependency changes).
   *
   * The old content's DOM nodes are still present (destruction is async),
   * so firstNode() is a valid position reference. The new content is placed
   * BEFORE the old content. When the old content is eventually destroyed
   * (async clear of bounds), the new content remains in the correct position.
   */
  let renderTarget = into;
  if (existing?.glimmerResult) {
    let parentElement = into instanceof Element ? into : into.element;
    let firstNode = existing.glimmerResult.firstNode();
    renderTarget = {
      element: parentElement,
      nextSibling: firstNode
    };
  }
  let root = renderer.render(component, {
    into: renderTarget,
    args
  });
  let innerResult = root.result;

  // Destroying the root (rather than only its inner result) also removes it
  // from the renderer, so nothing keeps it -- or `into` -- alive afterwards.
  associateDestroyableChild(owner, root);
  let result = {
    destroy() {
      destroy(root);
    }
  };
  RENDER_CACHE.set(into, {
    result,
    glimmerResult: innerResult
  });
  return result;
}
const RENDER_CACHE = new WeakMap();
const RENDERER_CACHE = new WeakMap();
class BaseRenderer {
  static strict(owner, document, options) {
    return new BaseRenderer(owner, {
      hasDOM: hasDOM,
      ...options
    }, document, new ResolverImpl(), clientBuilder);
  }
  state;
  constructor(owner, envOptions, document, resolver, builder) {
    let sharedArtifacts = artifacts();

    /**
     * SAFETY: are there consequences for being looser with *this* owner?
     *         the public API for `owner` is kinda `Partial<InternalOwner>`
     *         aka: implement only what you need.
     *         But for actual ember apps, you *need* to implement everything
     *         an app needs (which will actually change and become less over time)
     */
    let env = new EmberEnvironmentDelegate(owner, envOptions.isInteractive);
    let options = runtimeOptions({
      document
    }, env, sharedArtifacts, resolver);
    let context = new EvaluationContextImpl(sharedArtifacts, heap => new RuntimeOpImpl(heap), options);
    this.state = RendererState.create({
      owner,
      context,
      builder
    }, this);
  }
  get debugRenderTree() {
    let {
      debugRenderTree
    } = this.state.env;
    return debugRenderTree;
  }
  isValid() {
    return this.state.isValid();
  }
  destroy() {
    destroy(this);
  }
  render(component, options) {
    const root = new ComponentRootState(this.state, component, {
      args: options.args,
      into: intoTarget(options.into)
    });
    return this.state.renderRoot(root, this);
  }
  rerender() {
    this.state.scheduleRevalidate(this);
  }
}

export { BaseRenderer as B, ResolverImpl as R, _resetRenderers as _, renderSettled as a, errorLoopTransaction as e, renderComponent as r };
