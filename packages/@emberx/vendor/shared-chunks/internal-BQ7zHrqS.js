import { setOwner } from '../@ember/-internals/owner/index.js';
import { g as guidFor } from './guid-Cbq2sNV_.js';
import './env-DXxsTFkM.js';
import { assert } from '../@ember/debug/lib/assert.js';
import { s as setComponentTemplate } from './template-Dc_cBOoX.js';
import { s as setInternalComponentManager } from './api-DlJKfm_f.js';
import { v as valueForRef, a as createConstRef } from './reference-CG0yPgLy.js';
import { u as untrack } from './cache-CofLhaS4.js';

function NOOP() {}
class InternalComponent {
  // Override this
  static toString() {
    return 'internal component';
  }
  constructor(owner, args, caller) {
    this.owner = owner;
    this.args = args;
    this.caller = caller;
    setOwner(this, owner);
  }

  /**
   * The default HTML id attribute. We don't really _need_ one, this is just
   * added for compatibility as it's hard to tell if people rely on it being
   * present, and it doens't really hurt.
   *
   * However, don't rely on this internally, like passing it to `getElementId`.
   * This can be (and often is) overriden by passing an `id` attribute on the
   * invocation, which shadows this default id via `...attributes`.
   */
  get id() {
    return guidFor(this);
  }

  /**
   * The default HTML class attribute. Similar to the above, we don't _need_
   * them, they are just added for compatibility as it's similarly hard to tell
   * if people rely on it in their CSS etc, and it doens't really hurt.
   */
  get class() {
    return 'ember-view';
  }
  validateArguments() {
    for (let name of Object.keys(this.args.named)) {
      if (!this.isSupportedArgument(name)) {
        this.onUnsupportedArgument(name);
      }
    }
  }
  named(name) {
    let ref = this.args.named[name];
    return ref ? valueForRef(ref) : undefined;
  }
  positional(index) {
    let ref = this.args.positional[index];
    return ref ? valueForRef(ref) : undefined;
  }
  listenerFor(name) {
    let listener = this.named(name);
    if (listener) {
      return listener;
    } else {
      return NOOP;
    }
  }
  isSupportedArgument(_name) {
    return false;
  }
  onUnsupportedArgument(_name) {}
  toString() {
    return `<${this.constructor}:${guidFor(this)}>`;
  }
}
const OPAQUE_CONSTRUCTOR_MAP = new WeakMap();
function opaquify(constructor, template) {
  let _opaque = {
    // Factory interface
    create() {
      throw assert('Use constructor instead of create');
    },
    toString() {
      return constructor.toString();
    }
  };
  let opaque = _opaque;
  OPAQUE_CONSTRUCTOR_MAP.set(opaque, constructor);
  setInternalComponentManager(INTERNAL_COMPONENT_MANAGER, opaque);
  setComponentTemplate(template, opaque);
  return opaque;
}
function deopaquify(opaque) {
  let constructor = OPAQUE_CONSTRUCTOR_MAP.get(opaque);
  return constructor;
}
const CAPABILITIES = {
  dynamicLayout: false,
  dynamicTag: false,
  prepareArgs: false,
  createArgs: true,
  attributeHook: false,
  elementHook: false,
  createCaller: true,
  dynamicScope: false,
  updateHook: false,
  createInstance: true,
  wrapped: false,
  willDestroy: false,
  hasSubOwner: false
};
class InternalManager {
  getCapabilities() {
    return CAPABILITIES;
  }
  create(owner, definition, args, _env, _dynamicScope, caller) {
    let ComponentClass = deopaquify(definition);
    let instance = new ComponentClass(owner, args.capture(), valueForRef(caller));
    untrack(instance['validateArguments'].bind(instance));
    return instance;
  }
  didCreate() {}
  didUpdate() {}
  didRenderLayout() {}
  didUpdateLayout() {}
  getDebugName(definition) {
    return definition.toString();
  }
  getSelf(instance) {
    return createConstRef(instance);
  }
  getDestroyable(instance) {
    return instance;
  }
}
const INTERNAL_COMPONENT_MANAGER = new InternalManager();

export { InternalComponent as I, opaquify as o };
