import { getOwner, setOwner } from '../@ember/-internals/owner/index.js';
import { g as guidFor } from './guid-Cbq2sNV_.js';
import { getViewElement, clearElementView, clearViewElement, addChildView, setViewElement, setElementView } from '../@ember/-internals/views/lib/system/utils.js';
import { _instrumentStart } from '../@ember/instrumentation/index.js';
import { c as createComputeRef, v as valueForRef, e as createPrimitiveRef, f as childRefFor, g as childRefFromParts, a as createConstRef, b as isUpdatableRef, u as updateRef } from './reference-CG0yPgLy.js';
import { f as reifyPositional } from './arguments-Carzx7C4.js';
import { E as EMPTY_ARRAY } from './array-utils-CZQxrdD3.js';
import { a as valueForTag, p as beginUntrackFrame, w as endUntrackFrame, o as beginTrackFrame, s as endTrackFrame, c as consumeTag, v as validateTag } from './cache-CofLhaS4.js';
import { g as get } from './property_get-DuDs6rLg.js';
import { dasherize } from '../@ember/-internals/string/index.js';
import { registerDestructor } from '../@glimmer/destroyable/index.js';
import { MUTABLE_CELL } from '../@ember/-internals/views/lib/compat/attrs.js';
import { C as CURLY_MANAGER_BRAND } from './curly-brand-B_F79Dep.js';

/**
 * @deprecated
 */
function unwrapTemplate(template) {
  if (template.result === 'error') {
    throw new Error(`Compile Error: ${template.problem} @ ${template.span.start}..${template.span.end}`);
  }
  return template;
}

function isTemplateFactory(template) {
  return typeof template === 'function';
}

function referenceForParts(rootRef, parts) {
  let isAttrs = parts[0] === 'attrs';

  // TODO deprecate this
  if (isAttrs) {
    parts.shift();
    if (parts.length === 1) {
      return childRefFor(rootRef, parts[0]);
    }
  }
  return childRefFromParts(rootRef, parts);
}
function parseAttributeBinding(microsyntax) {
  let colonIndex = microsyntax.indexOf(':');
  if (colonIndex === -1) {
    return [microsyntax, microsyntax, true];
  } else {
    let prop = microsyntax.substring(0, colonIndex);
    let attribute = microsyntax.substring(colonIndex + 1);
    return [prop, attribute, false];
  }
}
function installAttributeBinding(component, rootRef, parsed, operations) {
  let [prop, attribute, isSimple] = parsed;
  if (attribute === 'id') {
    // SAFETY: `get` could not infer the type of `prop` and just gave us `unknown`.
    //         we may want to throw an error in the future if the value isn't string or null/undefined.
    let elementId = get(component, prop);
    if (elementId === undefined || elementId === null) {
      elementId = component.elementId;
    }
    let elementIdRef = createPrimitiveRef(elementId);
    operations.setAttribute('id', elementIdRef, true, null);
    return;
  }
  let isPath = prop.indexOf('.') > -1;
  let reference = isPath ? referenceForParts(rootRef, prop.split('.')) : childRefFor(rootRef, prop);
  operations.setAttribute(attribute, reference, false, null);
}
function createClassNameBindingRef(rootRef, microsyntax, operations) {
  let parts = microsyntax.split(':');
  let [prop, truthy, falsy] = parts;
  let isStatic = prop === '';
  if (isStatic) {
    operations.setAttribute('class', createPrimitiveRef(truthy), true, null);
  } else {
    let isPath = prop.indexOf('.') > -1;
    let parts = isPath ? prop.split('.') : [];
    let value = isPath ? referenceForParts(rootRef, parts) : childRefFor(rootRef, prop);
    let ref;
    if (truthy === undefined) {
      ref = createSimpleClassNameBindingRef(value, isPath ? parts[parts.length - 1] : prop);
    } else {
      ref = createColonClassNameBindingRef(value, truthy, falsy);
    }
    operations.setAttribute('class', ref, false, null);
  }
}
function createSimpleClassNameBindingRef(inner, path) {
  let dasherizedPath;
  return createComputeRef(() => {
    let value = valueForRef(inner);
    if (value === true) {
      return dasherizedPath || (dasherizedPath = dasherize(path));
    } else if (value || value === 0) {
      return String(value);
    } else {
      return null;
    }
  });
}
function createColonClassNameBindingRef(inner, truthy, falsy) {
  return createComputeRef(() => {
    return valueForRef(inner) ? truthy : falsy;
  });
}

function NOOP() {}

/**
  @module ember
*/

/**
  Represents the internal state of the component.

  @class ComponentStateBucket
  @private
*/
class ComponentStateBucket {
  classRef = null;
  rootRef;
  argsRevision;
  constructor(component, args, argsTag, finalizer, hasWrappedElement, isInteractive) {
    this.component = component;
    this.args = args;
    this.argsTag = argsTag;
    this.finalizer = finalizer;
    this.hasWrappedElement = hasWrappedElement;
    this.isInteractive = isInteractive;
    this.classRef = null;
    this.argsRevision = args === null ? 0 : valueForTag(argsTag);
    this.rootRef = createConstRef(component);
    registerDestructor(this, () => this.willDestroy(), true);
    registerDestructor(this, () => this.component.destroy());
  }
  willDestroy() {
    let {
      component,
      isInteractive
    } = this;
    if (isInteractive) {
      beginUntrackFrame();
      component.trigger('willDestroyElement');
      component.trigger('willClearRender');
      endUntrackFrame();
      let element = getViewElement(component);
      if (element) {
        clearElementView(element);
        clearViewElement(component);
      }
    }
    component.renderer.unregister(component);
  }
  finalize() {
    let {
      finalizer
    } = this;
    finalizer();
    this.finalizer = NOOP;
  }
}

// ComponentArgs takes EvaluatedNamedArgs and converts them into the
// inputs needed by CurlyComponents (attrs and props, with mutable
// cells, etc).
function processComponentArgs(namedArgs) {
  let attrs = Object.create(null);
  let props = Object.create(null);
  for (let name in namedArgs) {
    let ref = namedArgs[name];
    let value = valueForRef(ref);
    if (isUpdatableRef(ref)) {
      attrs[name] = new MutableCell(ref, value);
    } else {
      attrs[name] = value;
    }
    props[name] = value;
  }
  props.attrs = attrs;
  return props;
}
const REF = Symbol('REF');
class MutableCell {
  value;
  [MUTABLE_CELL];
  [REF];
  constructor(ref, value) {
    this[MUTABLE_CELL] = true;
    this[REF] = ref;
    this.value = value;
  }
  update(val) {
    updateRef(this[REF], val);
  }
}

const COMPONENT_ARGS_MAP = new WeakMap();
function getComponentCapturedArgs(component) {
  return COMPONENT_ARGS_MAP.get(component);
}
const DIRTY_TAG = Symbol('DIRTY_TAG');
const IS_DISPATCHING_ATTRS = Symbol('IS_DISPATCHING_ATTRS');
const BOUNDS = Symbol('BOUNDS');
const EMBER_VIEW_REF = createPrimitiveRef('ember-view');
function aliasIdToElementId(args, props) {
  if (args.named.has('id')) {
    props.elementId = props.id;
  }
}

// We must traverse the attributeBindings in reverse keeping track of
// what has already been applied. This is essentially refining the concatenated
// properties applying right to left.
function applyAttributeBindings(attributeBindings, component, rootRef, operations) {
  let seen = [];
  let i = attributeBindings.length - 1;
  while (i !== -1) {
    let binding = attributeBindings[i];
    let parsed = parseAttributeBinding(binding);
    let attribute = parsed[1];
    if (seen.indexOf(attribute) === -1) {
      seen.push(attribute);
      installAttributeBinding(component, rootRef, parsed, operations);
    }
    i--;
  }
  if (seen.indexOf('id') === -1) {
    let id = component.elementId ? component.elementId : guidFor(component);
    operations.setAttribute('id', createPrimitiveRef(id), false, null);
  }
}
class CurlyComponentManager {
  [CURLY_MANAGER_BRAND] = true;
  templateFor(component) {
    let {
      layout,
      layoutName
    } = component;
    let owner = getOwner(component);
    let factory;
    if (layout === undefined) {
      if (layoutName !== undefined) {
        let _factory = owner.lookup(`template:${layoutName}`);
        factory = _factory;
      } else {
        return null;
      }
    } else if (isTemplateFactory(layout)) {
      factory = layout;
    } else {
      // no layout was found, use the default layout
      return null;
    }
    return unwrapTemplate(factory(owner)).asWrappedLayout();
  }
  getDynamicLayout(bucket) {
    return this.templateFor(bucket.component);
  }
  getTagName(state) {
    let {
      component,
      hasWrappedElement
    } = state;
    if (!hasWrappedElement) {
      return null;
    }
    return component && component.tagName || 'div';
  }
  getCapabilities() {
    return CURLY_CAPABILITIES;
  }
  prepareArgs(ComponentClass, args) {
    if (args.named.has('__ARGS__')) {
      let {
        __ARGS__,
        ...rest
      } = args.named.capture();
      let __args__ = valueForRef(__ARGS__);
      let prepared = {
        positional: __args__.positional,
        named: {
          ...rest,
          ...__args__.named
        }
      };
      return prepared;
    }
    const {
      positionalParams
    } = ComponentClass.class ?? ComponentClass;

    // early exits
    if (positionalParams === undefined || positionalParams === null || args.positional.length === 0) {
      return null;
    }
    let named;
    if (typeof positionalParams === 'string') {
      let captured = args.positional.capture();
      named = {
        [positionalParams]: createComputeRef(() => reifyPositional(captured))
      };
      Object.assign(named, args.named.capture());
    } else if (Array.isArray(positionalParams) && positionalParams.length > 0) {
      const count = Math.min(positionalParams.length, args.positional.length);
      named = {};
      Object.assign(named, args.named.capture());
      for (let i = 0; i < count; i++) {
        let name = positionalParams[i];
        named[name] = args.positional.at(i);
      }
    } else {
      return null;
    }
    return {
      positional: EMPTY_ARRAY,
      named
    };
  }

  /*
   * This hook is responsible for actually instantiating the component instance.
   * It also is where we perform additional bookkeeping to support legacy
   * features like exposed by view mixins like ChildViewSupport, ActionSupport,
   * etc.
   */
  create(owner, ComponentClass, args, {
    isInteractive
  }, dynamicScope, callerSelfRef) {
    // Get the nearest concrete component instance from the scope. "Virtual"
    // components will be skipped.
    let parentView = dynamicScope.view;

    // Capture the arguments, which tells Glimmer to give us our own, stable
    // copy of the Arguments object that is safe to hold on to between renders.
    let capturedArgs = args.named.capture();
    beginTrackFrame();
    let props = processComponentArgs(capturedArgs);
    let argsTag = endTrackFrame();

    // Alias `id` argument to `elementId` property on the component instance.
    aliasIdToElementId(args, props);

    // Set component instance's parentView property to point to nearest concrete
    // component.
    props.parentView = parentView;

    // Save the current `this` context of the template as the component's
    // `_target`, so bubbled actions are routed to the right place.
    props._target = valueForRef(callerSelfRef);
    setOwner(props, owner);

    // caller:
    // <FaIcon @name="bug" />
    //
    // callee:
    // <i class="fa-{{@name}}"></i>

    // Now that we've built up all of the properties to set on the component instance,
    // actually create it.
    beginUntrackFrame();
    let component = ComponentClass.create(props);

    // Store capturedArgs in a WeakMap keyed by the component instance so that
    // PROPERTY_DID_CHANGE can look them up
    COMPONENT_ARGS_MAP.set(component, capturedArgs);
    let finalizer = _instrumentStart('render.component', initialRenderInstrumentDetails, component);

    // We become the new parentView for downstream components, so save our
    // component off on the dynamic scope.
    dynamicScope.view = component;

    // Unless we're the root component, we need to add ourselves to our parent
    // component's childViews array.
    if (parentView !== null && parentView !== undefined) {
      addChildView(parentView, component);
    }
    component.trigger('didReceiveAttrs');
    let hasWrappedElement = component.tagName !== '';

    // We usually do this in the `didCreateElement`, but that hook doesn't fire for tagless components
    if (!hasWrappedElement) {
      if (isInteractive) {
        component.trigger('willRender');
      }
      component._transitionTo('hasElement');
      if (isInteractive) {
        component.trigger('willInsertElement');
      }
    }

    // Track additional lifecycle metadata about this component in a state bucket.
    // Essentially we're saving off all the state we'll need in the future.
    let bucket = new ComponentStateBucket(component, capturedArgs, argsTag, finalizer, hasWrappedElement, isInteractive);
    if (args.named.has('class')) {
      bucket.classRef = args.named.get('class');
    }
    if (isInteractive && hasWrappedElement) {
      component.trigger('willRender');
    }
    endUntrackFrame();

    // consume every argument so we always run again
    consumeTag(bucket.argsTag);
    consumeTag(component[DIRTY_TAG]);
    return bucket;
  }
  getDebugName(definition) {
    return definition.fullName || definition.normalizedName || definition.class?.name || definition.name;
  }
  getSelf({
    rootRef
  }) {
    return rootRef;
  }
  didCreateElement({
    component,
    classRef,
    isInteractive,
    rootRef
  }, element, operations) {
    setViewElement(component, element);
    setElementView(element, component);
    let {
      attributeBindings,
      classNames,
      classNameBindings
    } = component;
    if (attributeBindings && attributeBindings.length) {
      applyAttributeBindings(attributeBindings, component, rootRef, operations);
    } else {
      let id = component.elementId ? component.elementId : guidFor(component);
      operations.setAttribute('id', createPrimitiveRef(id), false, null);
    }
    if (classRef) {
      const ref = createSimpleClassNameBindingRef(classRef);
      operations.setAttribute('class', ref, false, null);
    }
    if (classNames && classNames.length) {
      classNames.forEach(name => {
        operations.setAttribute('class', createPrimitiveRef(name), false, null);
      });
    }
    if (classNameBindings && classNameBindings.length) {
      classNameBindings.forEach(binding => {
        createClassNameBindingRef(rootRef, binding, operations);
      });
    }
    operations.setAttribute('class', EMBER_VIEW_REF, false, null);
    if ('ariaRole' in component) {
      operations.setAttribute('role', childRefFor(rootRef, 'ariaRole'), false, null);
    }
    component._transitionTo('hasElement');
    if (isInteractive) {
      beginUntrackFrame();
      component.trigger('willInsertElement');
      endUntrackFrame();
    }
  }
  didRenderLayout(bucket, bounds) {
    bucket.component[BOUNDS] = bounds;
    bucket.finalize();
  }
  didCreate({
    component,
    isInteractive
  }) {
    if (isInteractive) {
      component._transitionTo('inDOM');
      component.trigger('didInsertElement');
      component.trigger('didRender');
    }
  }
  update(bucket) {
    let {
      component,
      args,
      argsTag,
      argsRevision,
      isInteractive
    } = bucket;
    bucket.finalizer = _instrumentStart('render.component', rerenderInstrumentDetails, component);
    beginUntrackFrame();
    if (args !== null && !validateTag(argsTag, argsRevision)) {
      beginTrackFrame();
      let props = processComponentArgs(args);
      argsTag = bucket.argsTag = endTrackFrame();
      bucket.argsRevision = valueForTag(argsTag);
      component[IS_DISPATCHING_ATTRS] = true;
      component.setProperties(props);
      component[IS_DISPATCHING_ATTRS] = false;
      component.trigger('didUpdateAttrs');
      component.trigger('didReceiveAttrs');
    }
    if (isInteractive) {
      component.trigger('willUpdate');
      component.trigger('willRender');
    }
    endUntrackFrame();
    consumeTag(argsTag);
    consumeTag(component[DIRTY_TAG]);
  }
  didUpdateLayout(bucket) {
    bucket.finalize();
  }
  didUpdate({
    component,
    isInteractive
  }) {
    if (isInteractive) {
      component.trigger('didUpdate');
      component.trigger('didRender');
    }
  }
  getDestroyable(bucket) {
    return bucket;
  }
}
function initialRenderInstrumentDetails(component) {
  return component.instrumentDetails({
    initialRender: true
  });
}
function rerenderInstrumentDetails(component) {
  return component.instrumentDetails({
    initialRender: false
  });
}
const CURLY_CAPABILITIES = {
  dynamicLayout: true,
  dynamicTag: true,
  prepareArgs: true,
  createArgs: true,
  attributeHook: true,
  elementHook: true,
  createCaller: true,
  dynamicScope: true,
  updateHook: true,
  createInstance: true,
  wrapped: true,
  willDestroy: true,
  hasSubOwner: false
};
const CURLY_COMPONENT_MANAGER = /*@__PURE__*/new CurlyComponentManager();

export { BOUNDS as B, CurlyComponentManager as C, DIRTY_TAG as D, IS_DISPATCHING_ATTRS as I, ComponentStateBucket as a, CURLY_COMPONENT_MANAGER as b, getComponentCapturedArgs as g, initialRenderInstrumentDetails as i, unwrapTemplate as u };
