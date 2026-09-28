import { renderComponent as emberRenderComponent, renderSettled } from '@ember/renderer';
// Internal, but it is what Ember's own test setup uses between tests. See resetRendering().
import { _resetRenderers } from '@ember/-internals/glimmer';
import { setComponentTemplate } from '@glimmer/manager';
import { getOwner } from '@glimmer/owner';
import templateOnlyComponent from '@ember/component/template-only';

// The Glimmer component base class, vendored in ./glimmer-component. See that
// file for why it is not the `@glimmer/component` package.
import Component from './glimmer-component';

import { fn, hash, array, get, concat } from '@ember/helper';
import { on } from '@ember/modifier';
import { and, or, not, eq, neq, gt, gte, lt, lte, assign, debug, drop, take } from '@emberx/helper';
import createTemplate from './create-template';

import { tracked } from '@glimmer/tracking';
import { action as emberAction } from '@ember/object';

interface Owner {
  [key: string]: any;
}

interface FreeObject {
  [propName: string]: any;
}

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
  compiled: boolean;
  includes: FreeObject;
  template: string;
  setTemplate(sourceCode: string): unknown;
}

export default class EmberXComponent<Args extends FreeObject = FreeObject> extends Component<{
  Args: Args;
}> {
  static compiled = false;
  static includes = {};
  static template: string;
  static setTemplate(sourceCode: string) {
    const scope = Object.assign(this.includes, {
      fn,
      hash,
      array,
      get,
      concat,
      on,
      and,
      or,
      not,
      eq: eq,
      neq: neq,
      gt,
      gte,
      lt,
      lte,
      assign,
      debug,
      drop,
      take,
    });
    const templateFactory: any = createTemplate(sourceCode || ``, { strictMode: true }, scope);

    setComponentTemplate(templateFactory, this);

    return templateFactory;
  }
}

const AsyncFunction = (async () => {}).constructor;
const ASYNC_ACTIONS_PROMISE_QUEUE = new Set();

export function getAsyncActionsQueue() {
  return ASYNC_ACTIONS_PROMISE_QUEUE;
}

// @ts-ignore
export function action(context, value, descriptor) {
  if (descriptor) {
    const actionFunction = descriptor.value;
    Object.assign(descriptor, {
      value() {
        if (actionFunction instanceof AsyncFunction) {
          // @ts-ignore NOTE: this hack allows @emberx/test-helper input helpers to listen the finish of async
          const promise = actionFunction.apply(this, arguments);

          ASYNC_ACTIONS_PROMISE_QUEUE.add(promise);
          promise.finally(() => ASYNC_ACTIONS_PROMISE_QUEUE.delete(promise));

          return promise;
        }

        return actionFunction.apply(this, arguments);
      },
    });

    // @ts-ignore: @ember/object's action is typed as a decorator, and is called as one here
    return emberAction(context, value, descriptor);
  }

  // @ts-ignore: as above
  return emberAction(context, value, descriptor);
}

/**
 * Renders into `element` and resolves once the render has settled, as
 * @glimmer/core's renderComponent did. Ember's renderComponent takes `into`
 * rather than `element` and returns synchronously; `owner` and `args` are the
 * same.
 */
async function renderComponent(ComponentClass: EmberXComponentClass, optionsOrElement: any): Promise<void> {
  const { element, ...options }: any =
    optionsOrElement instanceof HTMLElement ? { element: optionsOrElement } : optionsOrElement;

  traverseAndCompileAllComponents(ComponentClass);

  const owner = options.owner ? renderingOwnerFor(options.owner) : undefined;
  emberRenderComponent(ComponentClass as object, { ...options, owner, into: element });

  return renderSettled();
}

/**
 * Ember keeps one renderer per owner, and a root that throws during its first
 * render stays in that renderer: every later render through the same owner
 * re-renders it and throws again. emberx renders everything with one static
 * Owner, so one failed render would break every render after it.
 *
 * Each owner therefore renders through a stand-in that inherits from it
 * (getOwner(component).services still resolves), and resetRendering() drops the
 * stand-ins along with Ember's global renderer list, giving the next render a
 * fresh renderer.
 */
let renderingOwners = new WeakMap<object, object>();

function renderingOwnerFor(owner: object): object {
  let renderingOwner = renderingOwners.get(owner);
  if (!renderingOwner) {
    renderingOwner = Object.create(owner) as object;
    renderingOwners.set(owner, renderingOwner);
  }
  return renderingOwner;
}

/** Forgets every renderer. @emberx/test-helpers calls this after each test. */
function resetRendering(): void {
  renderingOwners = new WeakMap();
  _resetRenderers();
}

/** Resolves once pending renders have flushed. Kept under its @glimmer/core name. */
function didRender(): Promise<void> {
  return renderSettled();
}

function service(...args: any[]) {
  const [target, key] = args;

  if (!target || !key) {
    throw new Error(
      `You attempted to use @service with an argument, you can only use it with the owners exact service name. Example: @service locale`,
    );
  }

  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: false,
    get() {
      const owner = getOwner(this) as Owner;
      if (owner && owner.services) {
        return owner.services[key];
      }

      return {};
    },
  });

  return target[key];
}

function hbs(sourceCode: TemplateStringsArray): string {
  return sourceCode[0];
}

function traverseAndCompileAllComponents(ComponentClass: EmberXComponentClass) {
  if ('compiled' in ComponentClass && !ComponentClass.compiled) {
    if (ComponentClass.template) {
      ComponentClass.setTemplate(ComponentClass.template);
    }
    ComponentClass.compiled = true;

    Object.entries(ComponentClass.includes).forEach(([_key, value]: [string, any]) =>
      traverseAndCompileAllComponents(value),
    );
  }
}

export {
  didRender,
  resetRendering,
  createTemplate,
  setComponentTemplate,
  getOwner,
  templateOnlyComponent,
  renderComponent,
  hbs,
  fn,
  hash,
  array,
  get,
  concat,
  on,
  service,
  tracked,
  traverseAndCompileAllComponents,
};
