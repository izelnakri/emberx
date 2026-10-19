import { renderComponent as emberRenderComponent, renderSettled } from '@emberx/vendor/@ember/renderer';
import { setComponentTemplate } from '@emberx/vendor/@glimmer/manager';
import { createTemplateFactory } from '@emberx/vendor/@ember/template-factory';
import { destroy, registerDestructor, unregisterDestructor } from '@emberx/vendor/@ember/destroyable';
import { createCache, getValue } from '@emberx/vendor/@glimmer/tracking/primitives/cache';
import { getOwner } from '@emberx/vendor/@glimmer/owner';
import templateOnlyComponent from '@emberx/vendor/@ember/component/template-only';
import type EmberOwner from '@emberx/vendor/@ember/owner';

// @glimmer/component, the base class Ember apps use (@emberx/vendor).
import Component from '@emberx/vendor/@glimmer/component';

import { fn, hash, array, get, concat } from '@emberx/vendor/@ember/helper';
import { on } from '@emberx/vendor/@ember/modifier';
import BUILTINS from './builtins.ts';
import createTemplate, { isTemplateCompilerLoaded, loadTemplateCompiler } from './create-template.ts';
import {
  buildWaiter,
  getPendingWaiterState,
  hasPendingWaiters,
  waitFor,
  waitForPromise,
  waitersSettled,
  type PendingWaiterState,
  type TestWaiter,
  type TestWaiterDebugInfo,
} from './waiters.ts';
import {
  _resetRenderers,
  isServerRendered,
  rehydrationBuilder,
  renderWithBuilder,
  tracked,
} from './ember-internals.ts';

interface Owner {
  [key: string]: any;
}

interface FreeObject {
  [propName: string]: any;
}

/**
 * The component classes whose templates are set. Kept here rather than as a
 * static flag, which a subclass would inherit: a subclass rendered after its
 * parent would then skip its own template and render the parent's.
 */
const COMPILED = new WeakSet<EmberXComponentClass>();

const AsyncFunction = (async () => {}).constructor;
const ASYNC_ACTIONS_PROMISE_QUEUE = new Set();

/** Where an error an `@action` throws goes, instead of up the event that ran it: see setOnerror. */
let onerror: ((error: unknown) => void) | undefined;

/** The owner a render that names none renders with: see renderingOwnerFor. */
const DEFAULT_OWNER = {};

/**
 * The static side of an emberx component class: the whole surface that
 * `renderComponent` and `traverseAndCompileAllComponents` touch.
 *
 * This is deliberately structural rather than `typeof EmberXComponent`. The
 * latter carries a *generic* construct signature (`new <Args>(...)`), which a
 * subclass that pins its `Args` type argument — `@emberx/router`'s `Route`,
 * whose constructor is `new (owner, args: FreeObject) => Route` — is not
 * assignable to. Only the statics matter here, so only the statics are asked for.
 */
export interface EmberXComponentClass {
  includes: FreeObject;
  template: string | PrecompiledTemplate;
  setTemplate(template: string | PrecompiledTemplate): unknown;
}

/**
 * A template @emberx/component/precompile compiled at build time: given the
 * template's scope, its wire format, for Ember's createTemplateFactory.
 */
export type PrecompiledTemplate = (scope: FreeObject) => object;

export type { PendingWaiterState, TestWaiter, TestWaiterDebugInfo };

export default class EmberXComponent<Args extends FreeObject = FreeObject> extends Component<{
  Args: { Named: Args };
}> {
  // @glimmer/component types the owner as @ember/owner's Owner; emberx's is any
  // object, @emberx/router's static Owner class among them.
  constructor(owner: object, args: Args) {
    super(owner as EmberOwner, args);
  }

  static includes = {};
  static template: string | PrecompiledTemplate;
  /** Compiles the template, unless the build already did (@emberx/component/precompile). */
  static setTemplate(template: string | PrecompiledTemplate) {
    // A new object: `includes` may be a parent class's, or the one the caller passed to render().
    const scope = { ...BUILTINS, ...this.includes };
    const templateFactory: any =
      typeof template === 'function'
        ? createTemplateFactory(template(scope) as any)
        : createTemplate(template || ``, { strictMode: true }, scope);

    setComponentTemplate(templateFactory, this);

    return templateFactory;
  }
}

export function getAsyncActionsQueue() {
  return ASYNC_ACTIONS_PROMISE_QUEUE;
}

/**
 * Sends what an `@action` throws to `handler` instead of up the event that ran
 * it, where a browser only reports it, as `Ember.onerror` does. An async
 * action's failure is in the promise it returns. @emberx/test-helpers sets one
 * in every test, so a helper that fired the event fails with it; `undefined`
 * removes it.
 */
export function setOnerror(handler: ((error: unknown) => void) | undefined): void {
  onerror = handler;
}

/**
 * `@action`: binds a method to its instance, so `{{on "click" this.save}}`
 * calls it on the component it belongs to, and records the promise of an
 * async one, which @emberx/test-helpers' settled() waits for.
 */
export function action<This, Args extends unknown[], Return>(
  method: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
): (this: This, ...args: Args) => Return {
  if (context.kind !== 'method') {
    throw new Error(`@action decorates a method, not ${String(context.name)}.`);
  }
  const name = context.name;

  function settledAware(this: This, ...args: Args): Return {
    let result: Return;
    try {
      result = method.apply(this, args);
    } catch (error) {
      if (!onerror) throw error;

      onerror(error);
      return undefined as Return;
    }
    if (method instanceof AsyncFunction) {
      const promise = result as Promise<unknown>;
      const settle = () => ASYNC_ACTIONS_PROMISE_QUEUE.delete(promise);
      ASYNC_ACTIONS_PROMISE_QUEUE.add(promise);
      // Not finally(), whose promise would reject unhandled with a failed action: settled() reports it.
      promise.then(settle, settle);
    }
    return result;
  }
  context.addInitializer(function (this: This) {
    (this as Record<PropertyKey, unknown>)[name] = settledAware.bind(this);
  });

  return settledAware;
}

/**
 * Renders into `element` and resolves once the render has settled, as
 * @glimmer/core's renderComponent did. Ember's renderComponent takes `into`
 * rather than `element` and returns synchronously; `owner` and `args` are the
 * same.
 *
 * An element that holds markup @emberx/ssr rendered, which starts with
 * Glimmer's serialization marker, is hydrated instead: the render adopts the
 * server's DOM, and from then on updates it in place. A later render into the
 * same element replaces the hydrated one, as renderComponent replaces its own.
 */
async function renderComponent(ComponentClass: EmberXComponentClass, optionsOrElement: any): Promise<void> {
  const { element, ...options }: any =
    optionsOrElement instanceof HTMLElement ? { element: optionsOrElement } : optionsOrElement;

  // Awaited only when it loads the compiler: otherwise the render is synchronous, as Ember's is.
  const compiling = compileTemplates(ComponentClass);
  if (compiling) await compiling;

  // Always an owner: Ember defaults it to a new `{}` per call and keeps one
  // renderer per owner, so an ownerless render would build a whole renderer
  // (and program heap) every time.
  const owner = renderingOwnerFor(options.owner ?? DEFAULT_OWNER);

  if (isServerRendered(element)) {
    const renderer = renderWithBuilder(ComponentClass, {
      into: element,
      args: options.args,
      owner,
      document: element.ownerDocument,
      builder: rehydrationBuilder,
      interactive: true,
    });
    hydratedRenderers.set(element, renderer);

    return renderSettled();
  }

  const hydrated = hydratedRenderers.get(element);
  if (hydrated) {
    hydratedRenderers.delete(element);
    hydrated.destroy();
    // The hydrated render's teardown finishes before anything renders in its place.
    await renderSettled();
  }

  emberRenderComponent(ComponentClass as object, { ...options, owner, into: element });

  return renderSettled();
}

/** Renderers that hydrated server-rendered markup, by the element they hydrated. */
const hydratedRenderers = new Map<Element, { destroy(): void }>();

/**
 * Ember keeps one renderer per owner, and a root that throws during its first
 * render stays in that renderer: every later render through the same owner
 * re-renders it and throws again. emberx renders everything with one static
 * Owner, so one failed render would break every render after it.
 *
 * Each owner therefore renders through a stand-in that inherits from it
 * (getOwner(component).services still resolves), and resetRendering() destroys
 * the stand-ins, and with them everything rendered through them, then drops
 * Ember's global renderer list, giving the next render a fresh renderer.
 */
let renderingOwners = new Map<object, object>();

/**
 * Destroys everything rendered so far, so none of it keeps running, and forgets
 * every renderer. @emberx/test-helpers calls this after each test.
 */
function resetRendering(): void {
  // Ember makes each root a destroyable child of the owner it rendered with.
  renderingOwners.forEach((renderingOwner) => destroy(renderingOwner));
  renderingOwners = new Map();
  hydratedRenderers.forEach((renderer) => renderer.destroy());
  hydratedRenderers.clear();
  _resetRenderers();
}

/** Resolves once pending renders have flushed. Kept under its @glimmer/core name. */
function didRender(): Promise<void> {
  return renderSettled();
}

/**
 * `@service locale`: the owner's service of that name, as the instance is
 * built. Its owner is set by then: the component base class sets it first.
 */
function service<This extends object, Value>(
  _value: undefined,
  context: ClassFieldDecoratorContext<This, Value>,
): (this: This) => Value {
  if (context.kind !== 'field') {
    throw new Error(`@service decorates a field, named as the service: \`@service locale\`.`);
  }
  const name = String(context.name);

  return function (this: This): Value {
    const owner = getOwner(this) as Owner | undefined;
    return (owner?.services?.[name] ?? {}) as Value;
  };
}

/**
 * `@cached get total()`: the getter's value, kept until the tracked state it
 * read changes, for a getter that is costly to run again on every render.
 * Built on Ember's public cache primitives, as Ember's own @cached is.
 */
function cached<This extends object, Value>(
  getter: (this: This) => Value,
  context: ClassGetterDecoratorContext<This, Value>,
): (this: This) => Value {
  if (context.kind !== 'getter') {
    throw new Error(`@cached decorates a getter, not ${String(context.name)}.`);
  }
  const caches = new WeakMap<This, ReturnType<typeof createCache<Value>>>();

  return function (this: This): Value {
    let cache = caches.get(this);
    if (!cache) {
      cache = createCache(() => getter.call(this));
      caches.set(this, cache);
    }
    return getValue(cache) as Value;
  };
}

function hbs(sourceCode: TemplateStringsArray): string {
  return sourceCode[0];
}

/**
 * Sets the templates of `ComponentClass` and of the components it includes,
 * loading the template compiler first when one of them is a string to
 * compile. Without a compiler to load, it sets them before it returns, so a
 * render that follows it is as synchronous as Ember's.
 */
function compileTemplates(ComponentClass: EmberXComponentClass): Promise<void> | void {
  if (isTemplateCompilerLoaded() || !hasRuntimeTemplate(ComponentClass, new Set())) {
    return traverseAndCompileAllComponents(ComponentClass);
  }

  return loadTemplateCompiler().then(() => traverseAndCompileAllComponents(ComponentClass));
}

function traverseAndCompileAllComponents(ComponentClass: EmberXComponentClass) {
  // `includes` also holds helpers and modifiers, which have no template.
  if (typeof ComponentClass?.setTemplate !== 'function' || COMPILED.has(ComponentClass)) return;

  if (ComponentClass.template) {
    ComponentClass.setTemplate(ComponentClass.template);
  }
  // Marked once it compiled, so a broken template fails again on the next render,
  // and before its includes, which may include it back.
  COMPILED.add(ComponentClass);

  Object.values(ComponentClass.includes).forEach(traverseAndCompileAllComponents);
}

export {
  didRender,
  resetRendering,
  renderWithBuilder,
  createTemplate,
  setComponentTemplate,
  getOwner,
  templateOnlyComponent,
  renderComponent,
  compileTemplates,
  loadTemplateCompiler,
  isTemplateCompilerLoaded,
  hbs,
  fn,
  hash,
  array,
  get,
  concat,
  on,
  service,
  tracked,
  cached,
  registerDestructor,
  unregisterDestructor,
  waitForPromise,
  waitFor,
  buildWaiter,
  hasPendingWaiters,
  getPendingWaiterState,
  waitersSettled,
  traverseAndCompileAllComponents,
};

/** Whether `ComponentClass`, or a component it includes, has a template to compile at runtime. */
function hasRuntimeTemplate(ComponentClass: EmberXComponentClass, seen: Set<object>): boolean {
  if (typeof ComponentClass?.setTemplate !== 'function' || COMPILED.has(ComponentClass) || seen.has(ComponentClass)) {
    return false;
  }

  seen.add(ComponentClass);
  return (
    typeof ComponentClass.template === 'string' ||
    Object.values(ComponentClass.includes).some((included) => hasRuntimeTemplate(included, seen))
  );
}

function renderingOwnerFor(owner: object): object {
  let renderingOwner = renderingOwners.get(owner);
  if (!renderingOwner) {
    renderingOwner = Object.create(owner) as object;
    renderingOwners.set(owner, renderingOwner);
  }
  return renderingOwner;
}
