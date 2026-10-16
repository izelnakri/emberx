import { setOwner } from '../-internals/owner/index.js';
import { FrameworkObject } from '../object/-internals.js';
import { g as getDebugName } from '../../shared-chunks/get-debug-name-BDxIL2Y1.js';
import { join } from '../runloop/index.js';
import { i as helperCapabilities } from '../../shared-chunks/api-DlJKfm_f.js';
import { b as setHelperManager } from '../../shared-chunks/api-B_poQGXS.js';
import { r as createTag, D as DIRTY_TAG, c as consumeTag } from '../../shared-chunks/cache-CofLhaS4.js';
import { I as IS_CLASSIC_HELPER } from '../../shared-chunks/helper-brand-C9_8vvOf.js';

/**
@module @ember/component
*/

const RECOMPUTE_TAG = Symbol('RECOMPUTE_TAG');

// Signature type utilities

// eslint-disable-next-line @typescript-eslint/no-empty-object-type

// Implements Ember's `Factory` interface and tags it for narrowing/checking.

// A zero-runtime-overhead private symbol to use in branding the component to
// preserve its type parameter.

/**
  Ember Helpers are functions that can compute values, and are used in templates.
  For example, this code calls a helper named `format-currency`:

  ```gjs {data-filename="app/templates/application.gjs"}
  import Cost from '../components/cost';

  <template>
    <Cost @cents={{230}} />
  </template>
  ```

  ```gjs {data-filename="app/components/cost.gjs"}
  import formatCurrency from '../helpers/format-currency';

  <template>
    <div>{{formatCurrency @cents currency="$"}}</div>
  </template>
  ```

  Additionally a helper can be called as a nested helper.
  In this example, we show the formatted currency value if the `showMoney`
  named argument is truthy.

  ```gjs
  import formatCurrency from '../helpers/format-currency';

  <template>
    {{if @showMoney (formatCurrency @cents currency="$")}}
  </template>
  ```

  Helpers defined using a class must provide a `compute` function. For example:

  ```app/helpers/format-currency.js
  import Helper from '@ember/component/helper';

  export default class extends Helper {
    compute([cents], { currency }) {
      return `${currency}${cents * 0.01}`;
    }
  }
  ```

  Each time the input to a helper changes, the `compute` function will be
  called again.

  As instances, these helpers also have access to the container and will accept
  injected dependencies.

  Additionally, class helpers can call `recompute` to force a new computation.

  @class Helper
  @extends CoreObject
  @public
  @since 1.13.0
*/
// ESLint doesn't understand declaration merging.
/* eslint-disable import/export */

class Helper extends FrameworkObject {
  static isHelperFactory = true;
  static [IS_CLASSIC_HELPER] = true;

  // `packages/ember/index.js` was setting `Helper.helper`. This seems like
  // a bad idea and probably not something we want. We've moved that definition
  // here, but it should definitely be reviewed and probably removed.
  /** @deprecated */
  static helper = helper;

  // SAFETY: this is initialized in `init`, rather than `constructor`. It is
  // safe to `declare` like this *if and only if* nothing uses the constructor
  // directly in this class, since nothing else can run before `init`.

  // SAFETY: this has no runtime existence whatsoever; it is a "phantom type"
  // here to preserve the type param.

  init(properties) {
    super.init(properties);
    this[RECOMPUTE_TAG] = createTag();
  }

  /**
    On a class-based helper, it may be useful to force a recomputation of that
    helpers value. This is akin to `rerender` on a component.
     In most cases, `recompute` is not needed because accessing tracked
    properties in `compute` will automatically re-run the helper when
    those properties change. Use `recompute` only when you need to
    trigger a recomputation imperatively, for example in response to an
    external event:
     ```app/helpers/current-time.js
    import Helper from '@ember/component/helper';
     export default class CurrentTimeHelper extends Helper {
      interval = null;
       compute() {
        return new Date().toLocaleTimeString();
      }
       constructor() {
        super(...arguments);
        this.interval = setInterval(() => this.recompute(), 1000);
      }
       willDestroy() {
        super.willDestroy();
        clearInterval(this.interval);
      }
    }
    ```
     @method recompute
    @public
    @since 1.13.0
  */
  recompute() {
    join(() => DIRTY_TAG(this[RECOMPUTE_TAG]));
  }
}
/* eslint-enable import/export */

class ClassicHelperManager {
  capabilities = helperCapabilities('3.23', {
    hasValue: true,
    hasDestroyable: true
  });
  ownerInjection;
  constructor(owner) {
    let ownerInjection = {};
    setOwner(ownerInjection, owner);
    this.ownerInjection = ownerInjection;
  }
  createHelper(definition, args) {
    let instance = isFactoryManager(definition) ? definition.create() : definition.create(this.ownerInjection);
    return {
      instance,
      args
    };
  }
  getDestroyable({
    instance
  }) {
    return instance;
  }
  getValue({
    instance,
    args
  }) {
    let {
      positional,
      named
    } = args;
    let ret = instance.compute(positional, named);
    consumeTag(instance[RECOMPUTE_TAG]);
    return ret;
  }
  getDebugName(definition) {
    return getDebugName((definition.class || definition)['prototype']);
  }
}
function isFactoryManager(obj) {
  return obj != null && 'class' in obj;
}
setHelperManager(owner => {
  return new ClassicHelperManager(owner);
}, Helper);

///////////

class Wrapper {
  isHelperFactory = true;
  constructor(compute) {
    this.compute = compute;
  }
  create() {
    // needs new instance or will leak containers
    return {
      compute: this.compute
    };
  }
}
class SimpleClassicHelperManager {
  capabilities = helperCapabilities('3.23', {
    hasValue: true
  });
  createHelper(definition, args) {
    return () => definition.compute.call(null, args.positional, args.named);
  }
  getValue(fn) {
    return fn();
  }
  getDebugName(definition) {
    return getDebugName(definition.compute);
  }
}
const SIMPLE_CLASSIC_HELPER_MANAGER = new SimpleClassicHelperManager();
setHelperManager(() => SIMPLE_CLASSIC_HELPER_MANAGER, Wrapper.prototype);

/*
  Function-based helpers need to present with a constructor signature so that
  type parameters can be preserved when `helper()` is passed a generic function
  (this is particularly key for checking helper invocations with Glint).
  Accordingly, we define an abstract class and declaration merge it with the
  interface; this inherently provides an `abstract` constructor. Since it is
  `abstract`, it is not callable, which is important since end users should not
  be able to do `let myHelper = helper(someFn); new myHelper()`.
 */

/**
 * The type of a function-based helper.
 *
 * @note This is *not* user-constructible: it is exported only so that the type
 *   returned by the `helper` function can be named (and indeed can be exported
 *   like `export default helper(...)` safely).
 */
// Making `FunctionBasedHelper` an alias this way allows callers to name it in
// terms meaningful to *them*, while preserving the type behavior described on
// the `abstract class FunctionBasedHelperInstance` below.

// This abstract class -- specifically, its `protected abstract __concrete__`
// member -- prevents subclasses from doing `class X extends helper(..)`, since
// that is an error at runtime. While it is rare that people would type that, it
// is not impossible and we use this to give them early signal via the types for
// a behavior which will break (and in a somewhat inscrutable way!) at runtime.
//
// This is needful because we lie about what this actually is for Glint's sake:
// a function-based helper returns a `Factory<SimpleHelper>`, which is designed
// to be "opaque" from a consumer's POV, i.e. not user-callable or constructible
// but only useable in a template (or via `invokeHelper()` which also treats it
// as a fully opaque `object` from a type POV). But Glint needs a `Helper<S>` to
// make it work the same way as class-based helpers. (Note that this does not
// hold for plain functions as helpers, which it can handle distinctly.) This
// signature thus makes it so that the item is usable *as* a `Helper` in Glint,
// but without letting end users treat it as a helper class instance.

/**
  In many cases it is not necessary to use the full `Helper` class.
  The `helper` method create pure-function helpers without instances.
  For example:

  ```app/helpers/format-currency.js
  import { helper } from '@ember/component/helper';

  export default helper(function([cents], {currency}) {
    return `${currency}${cents * 0.01}`;
  });
  ```

  @static
  @param {Function} helper The helper function
  @method helper
  @for @ember/component/helper
  @public
  @since 1.13.0
*/
// This overload allows users to write types directly on the callback passed to
// the `helper` function and infer the resulting type correctly.

// This overload allows users to provide a `Signature` type explicitly at the
// helper definition site, e.g. `helper<Sig>((pos, named) => {...})`. **Note:**
// this overload must appear second, since TS' inference engine will not
// correctly infer the type of `S` here from the types on the supplied callback.

function helper(helperFn) {
  // SAFETY: this is completely lies, in two ways:
  //
  // 1. `Wrapper` is a `Factory<SimpleHelper<S>>`, but from the perspective of
  //    any external callers (i.e. Ember *users*), it is quite important that
  //    the `Factory` relationship be hidden, because it is not public API for
  //    an end user to call `.create()` on a helper created this way. Instead,
  //    we provide them an `abstract new` signature (which means it cannot be
  //    directly constructed by calling `new` on it) and which does not have the
  //    `.create()` signature on it anymore.
  //
  // 2. The produced type here ends up being a subtype of `Helper`, which is not
  //    strictly true. This is necessary for the sake of Glint, which provides
  //    its information by way of a "declaration merge" with `Helper<S>` in the
  //    case of items produced by `helper()`.
  //
  // Long-term, this entire construct can go away in favor of deprecating the
  // `helper()` invocation in favor of using plain functions.
  return new Wrapper(helperFn);
}

export { Helper as default, helper };
