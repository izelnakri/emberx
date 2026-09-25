/**
 * The Glimmer component base class and its component manager.
 *
 * This is vendored from `@glimmer/component@2.0.0-beta.21` (MIT, Tilde Inc.),
 * whose entire runtime is the ~60 lines below. That package is published as an
 * *ember-addon*, so installing it also installs `ember-cli-babel`, `broccoli-*`
 * and `ember-cli-typescript` as runtime dependencies — 394 of the 423 packages
 * in emberx's Glimmer dependency tree, none of which emberx can use, because
 * emberx deliberately has no ember-cli build pipeline.
 *
 * Vendoring keeps behaviour identical while making the dependency honest.
 * Upstream: https://github.com/glimmerjs/glimmer.js/tree/master/packages/%40glimmer/component
 */
import {
  componentCapabilities,
  setComponentManager,
  setOwner,
  type ComponentManager,
  type ComponentCapabilities,
} from '@glimmer/core';
import type { Arguments } from '@glimmer/interfaces';

/**
 * Development-only assertions, off by default.
 *
 * `@glimmer/env` ships `DEBUG = false` and relies on a build plugin
 * (babel-plugin-debug-macros) to flip it on in development. emberx has no such
 * plugin, so these assertions have never run in this project — which is why
 * @emberx/router constructs `new Route()` with no arguments, and why the test
 * suite does the same. Defaulting to `false` preserves that behaviour exactly.
 *
 * Opt in with `--define:EMBERX_DEBUG=true` to get the upstream checks; the
 * branches constant-fold away when it is left unset.
 */
declare const EMBERX_DEBUG: boolean | undefined;
const DEBUG = typeof EMBERX_DEBUG === 'undefined' ? false : EMBERX_DEBUG;

const DESTROYING = new WeakMap<GlimmerComponent<unknown>, boolean>();
const DESTROYED = new WeakMap<GlimmerComponent<unknown>, boolean>();

/**
 * Tracks which `args` objects were created by the component manager, so that
 * `new SomeComponent()` called directly from user code fails loudly instead of
 * rendering a component with a broken `this.args`.
 */
const ARGS_SET = new WeakMap<object, boolean>();

export type Args<S> = S extends { Args: infer A } ? A : Record<string, unknown>;

/**
 * The base class for emberx components. Defines an encapsulated UI element:
 * a template plus, optionally, this backing object.
 *
 * Arguments passed by a parent component are available as `this.args` in
 * JavaScript and as `@argumentName` in the template. Properties declared on the
 * class are internal to the component.
 */
export default class GlimmerComponent<S = unknown> {
  /**
   * Named arguments passed to this component from its parent. Read-only:
   * arguments are owned by the caller, not by this component.
   */
  readonly args: Readonly<Args<S>>;

  constructor(owner: unknown, args: Args<S>) {
    // Upstream @glimmer/component requires `typeof owner === 'object'`. emberx
    // passes @emberx/router's `Owner` — a static class used as a registry —
    // which is a function, so that predicate rejects every emberx component.
    // Accepting functions keeps the assertion's real purpose (catching a
    // `super()` call that forwarded neither owner nor args) while matching how
    // emberx actually models ownership.
    const hasOwner = owner !== null && (typeof owner === 'object' || typeof owner === 'function');

    if (DEBUG && !(hasOwner && ARGS_SET.has(args as object))) {
      throw new Error(
        `You must pass both the owner and args to super() in your component: ${this.constructor.name}. ` +
          `You can pass them directly, or use ...arguments to pass all arguments through.`,
      );
    }

    this.args = args;

    DESTROYING.set(this as GlimmerComponent<unknown>, false);
    DESTROYED.set(this as GlimmerComponent<unknown>, false);

    setOwner(this, owner as object);
  }

  get isDestroying(): boolean {
    return DESTROYING.get(this as GlimmerComponent<unknown>) || false;
  }

  get isDestroyed(): boolean {
    return DESTROYED.get(this as GlimmerComponent<unknown>) || false;
  }

  /** Called before the component is removed from the DOM. */
  willDestroy(): void {}
}

interface ComponentConstructor<T> {
  new (owner: unknown, args: Record<string, unknown>): T;
}

const CAPABILITIES: ComponentCapabilities = componentCapabilities('3.13', {
  destructor: true,
});

class GlimmerComponentManager implements ComponentManager<GlimmerComponent<unknown>> {
  capabilities = CAPABILITIES;

  constructor(private owner: unknown) {}

  createComponent(
    ComponentClass: ComponentConstructor<GlimmerComponent<unknown>>,
    args: Arguments,
  ): GlimmerComponent<unknown> {
    // Read `named` exactly once: it is a getter that materialises a new object
    // on each access, so registering one object and constructing with another
    // would make the constructor's ARGS_SET check fail for every component.
    const named = args.named;

    if (DEBUG) {
      ARGS_SET.set(named, true);
    }

    return new ComponentClass(this.owner, named);
  }

  getContext(component: GlimmerComponent<unknown>): GlimmerComponent<unknown> {
    return component;
  }

  destroyComponent(component: GlimmerComponent<unknown>): void {
    DESTROYING.set(component, true);
    component.willDestroy();
    DESTROYED.set(component, true);
  }
}

setComponentManager((owner: unknown) => new GlimmerComponentManager(owner), GlimmerComponent);
