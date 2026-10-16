import { privatize } from '../@ember/-internals/container/index.js';
import { getOwner } from '../@ember/-internals/owner/index.js';
import { I as Input, T as Textarea } from './textarea-Bt9nkwXR.js';
import { LinkTo } from '../@ember/routing/index.js';
import { i as inTransaction, d as renderMain } from './render-OqKpH1Pf.js';
import { c as clientBuilder } from './api-DzOa0Acr.js';
import { r as rehydrationBuilder } from './rehydrate-builder-n_8RCUj9.js';
import { s as serializeBuilder } from './serialize-builder-CsG9WHVw.js';
import { g as guidFor } from './guid-Cbq2sNV_.js';
import { getViewId, getViewElement } from '../@ember/-internals/views/lib/system/utils.js';
import { associateDestroyableChild, isDestroyed, destroy, isDestroying } from '../@glimmer/destroyable/index.js';
import { a as createConstRef, v as valueForRef, c as createComputeRef, g as childRefFromParts, u as updateRef, U as UNDEFINED_REFERENCE } from './reference-CG0yPgLy.js';
import { c as createCapturedArgs, b as EMPTY_POSITIONAL, d as curry } from './arguments-Carzx7C4.js';
import { d as dict } from './collections-GpG8lT2g.js';
import { C as CurlyComponentManager, i as initialRenderInstrumentDetails, a as ComponentStateBucket, D as DIRTY_TAG, u as unwrapTemplate, B as BOUNDS } from './curly-xbTtts9R.js';
import { O as OutletComponent, c as createRootOutlet } from './outlet-DDxtxFLV.js';
import { g as getFactoryFor } from './container-BYOnjnwz.js';
import { _instrumentStart } from '../@ember/instrumentation/index.js';
import { c as capabilityFlagsFrom } from './capabilities-BuVYh-vx.js';
import { C as CONSTANT_TAG, c as consumeTag, D as DIRTY_TAG$1, r as createTag } from './cache-CofLhaS4.js';
import { R as ResolverImpl, B as BaseRenderer, e as errorLoopTransaction } from './index-_4333rii.js';
import { generateControllerFactory } from '../@ember/routing/lib/generate_controller.js';
import { i as internalHelper } from './internal-helper-Bz1lpDXr.js';
import { c as hasInternalComponentManager } from './api-DlJKfm_f.js';
import { schedule } from '../@ember/runloop/index.js';
import { t as templateFactory } from './index-kwuZeaNz.js';

const RootTemplate = templateFactory(
/*
  {{component this}}
*/
{
  "id": null,
  "block": "[[[46,[30,0],null,null,null]],[],[\"component\"]]",
  "moduleName": "packages/@ember/-internals/glimmer/lib/templates/root.hbs",
  "isStrictMode": true
});

class RootComponentManager extends CurlyComponentManager {
  component;
  constructor(component) {
    super();
    this.component = component;
  }
  create(_owner, _state, _args, {
    isInteractive
  }, dynamicScope) {
    let component = this.component;
    let finalizer = _instrumentStart('render.component', initialRenderInstrumentDetails, component);
    dynamicScope.view = component;
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
    let bucket = new ComponentStateBucket(component, null, CONSTANT_TAG, finalizer, hasWrappedElement, isInteractive);
    consumeTag(component[DIRTY_TAG]);
    return bucket;
  }
}

// ROOT is the top-level template it has nothing but one yield.
// it is supposed to have a dummy element
const ROOT_CAPABILITIES = {
  dynamicLayout: true,
  dynamicTag: true,
  prepareArgs: false,
  createArgs: false,
  attributeHook: true,
  elementHook: true,
  createCaller: true,
  dynamicScope: true,
  updateHook: true,
  createInstance: true,
  wrapped: true,
  willDestroy: false,
  hasSubOwner: false
};
class RootComponentDefinition {
  // handle is not used by this custom definition
  handle = -1;
  resolvedName = '-top-level';
  state;
  manager;
  capabilities = capabilityFlagsFrom(ROOT_CAPABILITIES);
  compilable = null;
  constructor(component) {
    this.manager = new RootComponentManager(component);
    let factory = getFactoryFor(component);
    this.state = factory;
  }
}

const CAPABILITIES$1 = {
  dynamicLayout: true,
  dynamicTag: false,
  prepareArgs: false,
  createArgs: true,
  attributeHook: false,
  elementHook: false,
  createCaller: true,
  dynamicScope: true,
  updateHook: true,
  createInstance: true,
  wrapped: false,
  willDestroy: false,
  hasSubOwner: true
};
class MountManager {
  getDynamicLayout(state) {
    let templateFactory = state.engine.lookup('template:application');
    return unwrapTemplate(templateFactory(state.engine)).asLayout();
  }
  getCapabilities() {
    return CAPABILITIES$1;
  }
  getOwner(state) {
    return state.engine;
  }
  create(owner, {
    name
  }, args, env) {
    let engine = owner.buildChildEngineInstance(name);
    engine.boot();
    let applicationFactory = engine.factoryFor(`controller:application`);
    let controllerFactory = applicationFactory || generateControllerFactory(engine, 'application');
    let controller;
    let self;
    let bucket;
    let modelRef;
    if (args.named.has('model')) {
      modelRef = args.named.get('model');
    }
    if (modelRef === undefined) {
      controller = controllerFactory.create();
      self = createConstRef(controller);
      bucket = {
        engine,
        controller,
        self,
        modelRef
      };
    } else {
      let model = valueForRef(modelRef);
      controller = controllerFactory.create({
        model
      });
      self = createConstRef(controller);
      bucket = {
        engine,
        controller,
        self,
        modelRef
      };
    }
    if (env.debugRenderTree) {
      associateDestroyableChild(engine, controller);
    }
    return bucket;
  }
  getDebugName({
    name
  }) {
    return name;
  }
  getDebugCustomRenderTree(definition, state, args) {
    return [{
      bucket: state.engine,
      instance: state.engine,
      type: 'engine',
      name: definition.name,
      args
    }, {
      bucket: state.controller,
      instance: state.controller,
      type: 'route-template',
      name: 'application',
      args
    }];
  }
  getSelf({
    self
  }) {
    return self;
  }
  getDestroyable(bucket) {
    return bucket.engine;
  }
  didCreate() {}
  didUpdate() {}
  didRenderLayout() {}
  didUpdateLayout() {}
  update(bucket) {
    let {
      controller,
      modelRef
    } = bucket;
    if (modelRef !== undefined) {
      controller.set('model', valueForRef(modelRef));
    }
  }
}
const MOUNT_MANAGER = /*@__PURE__*/new MountManager();
class MountDefinition {
  // handle is not used by this custom definition
  handle = -1;
  state;
  manager = MOUNT_MANAGER;
  compilable = null;
  capabilities = capabilityFlagsFrom(CAPABILITIES$1);
  constructor(resolvedName) {
    this.resolvedName = resolvedName;
    this.state = {
      name: resolvedName
    };
  }
}

/**
@module @ember/helper
*/


/**
  The `{{mount}}` helper lets you embed a routeless engine in a template.
  Mounting an engine will cause an instance to be booted and its `application`
  template to be rendered.

  For example, the following template mounts the `ember-chat` engine:

  ```gjs {data-filename="app/templates/application.gjs"}
  {{mount "ember-chat"}}
  ```

  Additionally, you can also pass in a `model` argument that will be
  set as the engines model. This can be an existing object:

  ```hbs
  <div>
    {{mount 'admin' model=userSettings}}
  </div>
  ```

  Or an inline `hash`, and you can even pass components:

  ```gjs
  import SignInButton from '../components/sign-in-button';
  <template>
    <div>
      <h1>Application template!</h1>
      {{mount 'admin' model=(hash
          title='Secret Admin'
          signInButton=SignInButton
      )}}
    </div>
  </template>
  ```
 
 `mount` is built-in and does not need to be imported.

  @method mount
  @param {String} name Name of the engine to mount.
  @param {Object} [model] Object that will be set as
                          the model of the engine.
  @for Keywords
  @static
  @noimport
  @public
*/
const mountHelper = /*@__PURE__*/internalHelper((args, owner) => {
  let nameRef = args.positional[0];
  let captured;
  captured = createCapturedArgs(args.named, EMPTY_POSITIONAL);
  let lastName, lastDef;
  return createComputeRef(() => {
    let name = valueForRef(nameRef);
    if (typeof name === 'string') {
      if (lastName === name) {
        return lastDef;
      }
      lastName = name;
      lastDef = curry(0, new MountDefinition(name), owner, captured, true);
      return lastDef;
    } else {
      lastDef = null;
      lastName = null;
      return null;
    }
  });
});

const CAPABILITIES = {
  dynamicLayout: false,
  dynamicTag: false,
  prepareArgs: false,
  createArgs: true,
  attributeHook: false,
  elementHook: false,
  createCaller: false,
  dynamicScope: false,
  updateHook: false,
  createInstance: true,
  wrapped: false,
  willDestroy: false,
  hasSubOwner: false
};
const CAPABILITIES_MASK = /*@__PURE__*/capabilityFlagsFrom(CAPABILITIES);
class RouteTemplateManager {
  create(_owner, _definition, args) {
    let self = args.named.get('controller');
    let controller = valueForRef(self);
    return {
      self,
      controller
    };
  }
  getSelf({
    self
  }) {
    return self;
  }
  getDebugName({
    name
  }) {
    return `route-template (${name})`;
  }
  getDebugCustomRenderTree({
    name
  }, state, args) {
    return [{
      bucket: state,
      type: 'route-template',
      name,
      args,
      instance: state.controller
    }];
  }
  getCapabilities() {
    return CAPABILITIES;
  }
  didRenderLayout() {}
  didUpdateLayout() {}
  didCreate() {}
  didUpdate() {}
  getDestroyable() {
    return null;
  }
}
const ROUTE_TEMPLATE_MANAGER = /*@__PURE__*/new RouteTemplateManager();

/**
 * This "upgrades" a route template into a invocable component. Conceptually
 * it can be 1:1 for each unique `Template`, but it's also cheap to construct,
 * so unless the stability is desirable for other reasons, it's probably not
 * worth caching this.
 */
class RouteTemplate {
  // handle is not used by this custom definition
  handle = -1;
  resolvedName;
  state;
  manager = ROUTE_TEMPLATE_MANAGER;
  capabilities = CAPABILITIES_MASK;
  compilable;
  constructor(name, template) {
    let unwrapped = unwrapTemplate(template);
    // TODO This actually seems inaccurate – it ultimately came from the
    // outlet's name. Also, setting this overrides `getDebugName()` in that
    // message. Is that desirable?
    this.resolvedName = name;
    this.state = {
      name
    };
    this.compilable = unwrapped.asLayout();
  }
}

// TODO a lot these fields are copied from the adjacent existing components
// implementation, haven't looked into who cares about `ComponentDefinition`
// and if it is appropriate here. It seems like this version is intended to
// be used with `curry` which probably isn't necessary here. It could be the
// case that we just want to do something more similar to `InternalComponent`
// (the one we used to implement `Input` and `LinkTo`). For now it follows
// the same pattern to get things going.
function makeRouteTemplate(owner, name, template) {
  let routeTemplate = new RouteTemplate(name, template);
  return curry(0, routeTemplate, owner, null, true);
}

/**
 @module @ember/helper
 */

/**
  The `{{outlet}}` helper lets you specify where a child route will render in
  your template. An important use of the `{{outlet}}` helper is in your
  application's `application.gjs` file:

  ```gjs {data-filename="app/templates/application.gjs"}
  import MyHeader from '../components/my-header';
  import MyFooter from '../components/my-footer';
    
  <template>
    <MyHeader />
  
    <div class="my-dynamic-content">
      <!-- this content will change based on the current route, which depends on the current URL -->
      {{outlet}}
    </div>
  
    <MyFooter />
  </template>
  ```

  See the [routing guide](https://guides.emberjs.com/release/routing/rendering-a-template/) for more
  information on how your `route` interacts with the `{{outlet}}` helper.
  Note: Your content __will not render__ if there isn't an `{{outlet}}` for it.

  `outlet` is built-in and does not need to be imported. 
 
  @method outlet
  @for Keywords
  @static
  @noimport
  @public
*/
const outletHelper = /*@__PURE__*/internalHelper((_args, owner, scope) => {
  let outletRef = createComputeRef(() => {
    let state = valueForRef(scope.get('outletState'));
    return state?.outlets?.main;
  });
  let lastState = null;
  let outlet = null;
  return createComputeRef(() => {
    let outletState = valueForRef(outletRef);
    let state = stateFor(outletRef, outletState);

    // This code is deliberately using the behavior in glimmer-vm where in
    // <@Component />, the component is considered stabled via `===`, and
    // will continue to re-render in-place as long as the `===` holds, but
    // when it changes to a different object, it teardown the old component
    // (running destructors, etc), and render the component in its place (or
    // nothing if the new value is nullish. Here we are carefully exploiting
    // that fact, and returns the same stable object so long as it is the
    // same route, but return a different one when the route changes. On the
    // other hand, changing the model only intentionally do not teardown the
    // component and instead re-render in-place.
    if (!isStable(state, lastState)) {
      lastState = state;
      if (state !== null) {
        // If we are crossing an engine mount point, this is how the owner
        // gets switched.
        let outletOwner = outletState?.render?.owner ?? owner;
        let named = dict();

        // Here we either have a raw template that needs to be normalized,
        // or a component that we can render as-is. `RouteTemplate` upgrades
        // the template into a component so we can have a unified code path.
        // We still store the original `template` value, because we rely on
        // its identity for the stability check, and the `RouteTemplate`
        // wrapper doesn't dedup for us.
        let template = state.template;
        let component;
        if (hasInternalComponentManager(template)) {
          component = template;
        } else {
          component = makeRouteTemplate(outletOwner, state.name, template);
        }

        // Component is stable for the lifetime of the outlet
        named['Component'] = createConstRef(component);

        // Controller is stable for the lifetime of the outlet
        named['controller'] = createConstRef(state.controller);

        // Create a ref for the model
        let modelRef = childRefFromParts(outletRef, ['render', 'model']);

        // Store the value of the model
        let model = valueForRef(modelRef);

        // The controller for this outlet, used to verify the outletRef
        // still points to the correct route's data.
        let outletController = state.controller;

        // Create a compute ref which we pass in as the `{{@model}}` reference
        // for the outlet. This ref will update and return the value of the
        // model _until_ the outlet itself changes. Once the outlet changes,
        // dynamic scope also changes, and so the original model ref would not
        // provide the correct updated value. So we stop updating and return
        // the _last_ model value for that outlet.
        //
        // We also verify that the outletRef still resolves to this route's
        // data by comparing controller identity. This handles the case where
        // a parent outlet is torn down first: the dynamic scope refs now
        // point to the new route's outlet state, but this outlet's outer
        // compute ref hasn't re-evaluated yet, so `lastState === state` is
        // still true. The controller check catches this case.
        named['model'] = createComputeRef(() => {
          if (lastState === state) {
            let currentOutlet = valueForRef(outletRef);
            if (currentOutlet?.render?.controller === outletController) {
              model = valueForRef(modelRef);
            }
          }
          return model;
        });
        let args = createCapturedArgs(named, EMPTY_POSITIONAL);

        // Package up everything
        outlet = curry(0, new OutletComponent(owner, state), outletOwner, args, true);
      } else {
        outlet = null;
      }
    }
    return outlet;
  });
});
function stateFor(ref, outlet) {
  if (outlet === undefined) return null;
  let render = outlet.render;
  if (render === undefined) return null;
  let template = render.template;
  // The type doesn't actually allow for `null`, but if we make it past this
  // point it is really important that we have _something_ to render. We could
  // assert, but that is probably overly strict for very little to gain.
  if (template === undefined || template === null) return null;
  return {
    ref,
    name: render.name,
    template,
    controller: render.controller
  };
}
function isStable(state, lastState) {
  if (state === null || lastState === null) {
    return false;
  }
  return state.template === lastState.template && state.controller === lastState.controller;
}

const ROUTER_KEYWORD_HELPERS = {
  '-mount': mountHelper,
  '-outlet': outletHelper
};

/**
 * The resolver used by the classic application `Renderer`. It extends the
 * shared `ResolverImpl` with the keywords that require the router and engine
 * infrastructure (`{{outlet}}` and `{{mount}}`). Keeping these out of the
 * base resolver means renderers that have no router (e.g. `renderComponent`)
 * do not pull the outlet/engine machinery into the build.
 */
class RouterResolver extends ResolverImpl {
  lookupBuiltInHelper(name) {
    return ROUTER_KEYWORD_HELPERS[name] ?? super.lookupBuiltInHelper(name);
  }

  // Loose-mode templates resolve the wrapped `{{outlet}}` / `{{mount}}`
  // keywords (`{{component (-outlet)}}`) through `lookupHelper`, not
  // `lookupBuiltInHelper`, so the router keywords have to be added to both
  // lookup paths.
  lookupHelper(name, owner) {
    return ROUTER_KEYWORD_HELPERS[name] ?? super.lookupHelper(name, owner);
  }
}

// We use the `InternalOwner` notion here because we actually need all of its
// API for using with renderers (normally, it will be `EngineInstance`).
// We use `getOwner` from our internal home for it rather than the narrower
// public API for the same reason.
const TOP_LEVEL_NAME = '-top-level';
class OutletView {
  static extend(injections) {
    return class extends OutletView {
      static create(options) {
        if (options) {
          return super.create(Object.assign({}, injections, options));
        } else {
          return super.create(injections);
        }
      }
    };
  }
  static reopenClass(injections) {
    Object.assign(this, injections);
  }
  static create(options) {
    let {
      environment: _environment,
      application: namespace,
      template: templateFactory
    } = options;
    let owner = getOwner(options);
    let template = templateFactory(owner);
    return new OutletView(_environment, owner, template, namespace);
  }
  ref;
  state;
  constructor(_environment, owner, template, namespace) {
    this._environment = _environment;
    this.owner = owner;
    this.template = template;
    this.namespace = namespace;
    let outletStateTag = createTag();
    let outletState = {
      outlets: {
        main: undefined
      },
      render: {
        owner: owner,
        name: TOP_LEVEL_NAME,
        controller: undefined,
        model: undefined,
        template
      }
    };
    let ref = this.ref = createComputeRef(() => {
      consumeTag(outletStateTag);
      return outletState;
    }, state => {
      DIRTY_TAG$1(outletStateTag);
      outletState.outlets['main'] = state;
    });
    this.state = {
      ref,
      name: TOP_LEVEL_NAME,
      template,
      controller: undefined
    };
  }
  appendTo(selector) {
    let target;
    if (this._environment.hasDOM) {
      target = typeof selector === 'string' ? document.querySelector(selector) : selector;
    } else {
      target = selector;
    }
    let renderer = this.owner.lookup('renderer:-dom');

    // SAFETY: It's not clear that this cast is safe.
    // The types for appendOutletView may be incorrect or this is a potential bug.
    schedule('render', renderer, 'appendOutletView', this, target);
  }
  rerender() {
    /**/
  }
  setOutletState(state) {
    updateRef(this.ref, state);
  }
  destroy() {
    /**/
  }
}

class DynamicScope {
  constructor(view, outletState) {
    this.view = view;
    this.outletState = outletState;
  }
  child() {
    return new DynamicScope(this.view, this.outletState);
  }
  get(key) {
    return this.outletState;
  }
  set(key, value) {
    this.outletState = value;
    return value;
  }
}
class ClassicRootState {
  type = 'classic';
  id;
  result;
  destroyed;
  render;
  env;
  constructor(root, context, owner, template, self, parentElement, dynamicScope, builder) {
    this.root = root;
    this.id = root instanceof OutletView ? guidFor(root) : getViewId(root);
    this.result = undefined;
    this.destroyed = false;
    this.env = context.env;
    this.render = errorLoopTransaction(() => {
      let layout = unwrapTemplate(template).asLayout();
      let iterator = renderMain(context, owner, self, builder(context.env, {
        element: parentElement,
        nextSibling: null
      }), layout, dynamicScope);
      let result = this.result = iterator.sync();
      associateDestroyableChild(this, result);
      this.render = errorLoopTransaction(() => {
        if (isDestroying(result) || isDestroyed(result)) return;
        return result.rerender({
          alwaysRevalidate: false
        });
      });
    });
  }
  isFor(possibleRoot) {
    return this.root === possibleRoot;
  }
  destroy() {
    let {
      result,
      env
    } = this;
    this.destroyed = true;
    this.root = null;
    this.result = undefined;
    this.render = undefined;
    if (result !== undefined) {
      /*
       Handles these scenarios:
        * When roots are removed during standard rendering process, a transaction exists already
         `.begin()` / `.commit()` are not needed.
       * When roots are being destroyed manually (`component.append(); component.destroy() case), no
         transaction exists already.
       * When roots are being destroyed during `Renderer#destroy`, no transaction exists
        */

      inTransaction(env, () => destroy(result));
    }
  }
}
class Renderer extends BaseRenderer {
  _rootTemplate;
  _viewRegistry;
  static create(props) {
    let {
      _viewRegistry
    } = props;
    let owner = getOwner(props);
    let document = owner.lookup('service:-document');
    let env = owner.lookup('-environment:main');
    let rootTemplate = owner.lookup(privatize`template:-root`);
    let builder = owner.lookup('service:-dom-builder');
    return new this(owner, document, env, rootTemplate, _viewRegistry, builder);
  }
  constructor(owner, document, env, rootTemplate, viewRegistry, builder = clientBuilder, resolver = new RouterResolver()) {
    super(owner, env, document, resolver, builder);
    this._rootTemplate = rootTemplate(owner);
    this._viewRegistry = viewRegistry || owner.lookup('-view-registry:main');
  }

  // renderer HOOKS

  appendOutletView(view, target) {
    // TODO: This bypasses the {{outlet}} syntax so logically duplicates
    // some of the set up code. Since this is all internal (or is it?),
    // we can refactor this to do something more direct/less convoluted
    // and with less setup, but get it working first
    let outlet = createRootOutlet(view);
    let {
      name,
      /* controller, */template
    } = view.state;
    let named = dict();
    named['Component'] = createConstRef(makeRouteTemplate(view.owner, name, template));

    // TODO: is this guaranteed to be undefined? It seems to be the
    // case in the `OutletView` class. Investigate how much that class
    // exists as an internal implementation detail only, or if it was
    // used outside of core. As far as I can tell, test-helpers uses
    // it but only for `setOutletState`.
    // named['controller'] = createConstRef(controller, '@controller');
    // Update: at least according to the debug render tree tests, we
    // appear to always expect this to be undefined. Not a definitive
    // source by any means, but is useful evidence
    named['controller'] = UNDEFINED_REFERENCE;
    named['model'] = UNDEFINED_REFERENCE;
    let args = createCapturedArgs(named, EMPTY_POSITIONAL);
    this._appendDefinition(view, curry(0, outlet, view.owner, args, true), target);
  }
  appendTo(view, target) {
    let definition = new RootComponentDefinition(view);
    this._appendDefinition(view, curry(0, definition, this.state.owner, null, true), target);
  }
  _appendDefinition(root, definition, target) {
    let self = createConstRef(definition);
    let dynamicScope = new DynamicScope(null, UNDEFINED_REFERENCE);
    let rootState = new ClassicRootState(root, this.state.context, this.state.owner, this._rootTemplate, self, target, dynamicScope, this.state.builder);
    this.state.renderRoot(rootState, this);
  }
  cleanupRootFor(component) {
    // no need to cleanup roots if we have already been destroyed
    if (isDestroyed(this)) {
      return;
    }
    let roots = this.state.roots;

    // traverse in reverse so we can remove items
    // without mucking up the index
    let i = roots.length;
    while (i--) {
      let root = roots[i];
      if (root.type === 'classic' && root.isFor(component)) {
        root.destroy();
        roots.splice(i, 1);
      }
    }
  }
  remove(view) {
    view._transitionTo('destroying');
    this.cleanupRootFor(view);
    if (this.state.isInteractive) {
      view.trigger('didDestroyElement');
    }
  }
  get _roots() {
    return this.state.debug.roots;
  }
  get _inRenderTransaction() {
    return this.state.debug.inRenderTransaction;
  }
  get _isInteractive() {
    return this.state.debug.isInteractive;
  }
  get _context() {
    return this.state.context;
  }
  register(view) {
    let id = getViewId(view);
    this._viewRegistry[id] = view;
  }
  unregister(view) {
    delete this._viewRegistry[getViewId(view)];
  }
  getElement(component) {
    if (this._isInteractive) {
      return getViewElement(component);
    } else {
      throw new Error('Accessing `this.element` is not allowed in non-interactive environments (such as FastBoot).');
    }
  }
  getBounds(component) {
    let bounds = component[BOUNDS];
    let parentElement = bounds.parentElement();
    let firstNode = bounds.firstNode();
    let lastNode = bounds.lastNode();
    return {
      parentElement,
      firstNode,
      lastNode
    };
  }
}

const OutletTemplate = templateFactory(
/*
  {{component (outletHelper)}}
*/
{
  "id": null,
  "block": "[[[46,[28,[32,0],null,null],null,null,null]],[],[\"component\"]]",
  "moduleName": "packages/@ember/-internals/glimmer/lib/templates/outlet.hbs",
  "scope": () => ({
    outletHelper
  }),
  "isStrictMode": true
});

function setupApplicationRegistry(registry) {
  // because we are using injections we can't use instantiate false
  // we need to use bind() to copy the function so factory for
  // association won't leak
  registry.register('service:-dom-builder', {
    // Additionally, we *must* constrain this to require `props` on create, else
    // we *know* it cannot have an owner.
    create(props) {
      let owner = getOwner(props);
      let env = owner.lookup('-environment:main');
      switch (env._renderMode) {
        case 'serialize':
          return serializeBuilder.bind(null);
        case 'rehydrate':
          return rehydrationBuilder.bind(null);
        default:
          return clientBuilder.bind(null);
      }
    }
  });
  registry.register(privatize`template:-root`, RootTemplate);
  registry.register('renderer:-dom', Renderer);
}
function setupEngineRegistry(registry) {
  registry.optionsForType('template', {
    instantiate: false
  });
  registry.register('view:-outlet', OutletView);
  registry.register('template:-outlet', OutletTemplate);
  registry.optionsForType('helper', {
    instantiate: false
  });
  registry.register('component:input', Input);
  registry.register('component:link-to', LinkTo);
  registry.register('component:textarea', Textarea);
}

export { OutletView as O, Renderer as R, RootTemplate as a, setupEngineRegistry as b, setupApplicationRegistry as s };
