/**
 * emberx's renderer: Glimmer's VM, set up as Ember's strict-mode renderer sets it up, without
 * Ember's run loop, object model and classic components, which Ember's Renderer brings in and
 * an emberx component never reaches. Renders are scheduled in a microtask rather than a run loop.
 */
import setGlobalContext from '@emberx/vendor/@glimmer/global-context';
import { EvaluationContextImpl } from '@emberx/vendor/@glimmer/opcode-compiler';
import { artifacts, RuntimeOpImpl } from '@emberx/vendor/@glimmer/program';
import { inTransaction, renderComponent, runtimeOptions } from '@emberx/vendor/@glimmer/runtime';
import { CURRENT_TAG, validateTag, valueForTag } from '@emberx/vendor/@glimmer/validator';
import { associateDestroyableChild, destroy, isDestroyed, isDestroying } from '@emberx/vendor/@glimmer/destroyable';
import { setInternalHelperManager } from '@emberx/vendor/@glimmer/manager';
import { createComputeRef, valueForRef } from '@emberx/vendor/@glimmer/reference';
import { consumeTag, tagFor } from '@emberx/vendor/@glimmer/validator';

export interface Root {
  destroy(): void;
  /** The first node it rendered, which a render that replaces it goes before. */
  firstNode(): unknown;
}

/** Whatever a builder function returns and renderComponent takes: Glimmer's TreeBuilder. */
type Builder = (env: unknown, cursor: { element: unknown; nextSibling: unknown }) => unknown;

/** What `{{#each-in}}` iterates: an object's values, by key. */
class EachInWrapper {
  inner: unknown;

  constructor(inner: unknown) {
    this.inner = inner;
  }
}

/**
 * The helpers Ember's template compiler calls on its own, as Ember's resolver has them:
 * `{{#each}}` iterates `(-track-array list)`, `{{#each-in}}` `(-each-in object)`, and
 * `{{#in-element}}`'s `insertBefore=null` is `(-in-el-null null)`.
 */
const BUILT_IN_HELPERS: Record<string, object> = {
  '-track-array': internalHelper((positional) =>
    createComputeRef(() => {
      const iterable = valueForRef(positional[0]);
      // An array changed in place, as @tracked's array is, dirties this tag.
      if (iterable !== null && typeof iterable === 'object') consumeTag(tagFor(iterable, '[]'));
      return iterable;
    }),
  ),
  '-each-in': internalHelper((positional) => createComputeRef(() => new EachInWrapper(valueForRef(positional[0])))),
  '-in-el-null': internalHelper((positional) => positional[0]),
};

/** Strict-mode templates take everything from their scope: only the built-ins are looked up by name. */
const RESOLVER = {
  lookupHelper: () => null,
  lookupModifier: () => null,
  lookupComponent: () => null,
  lookupBuiltInHelper: (name: string) => BUILT_IN_HELPERS[name] ?? null,
  lookupBuiltInModifier: () => null,
};

/** The renderers that have roots, which a revalidation renders again. */
const RENDERERS = new Set<Renderer>();
/** The renderer of each owner, for each document it renders into. */
const RENDERERS_BY_OWNER = new WeakMap<object, Map<unknown, Renderer>>();

let pendingRender: Promise<void> | undefined;
/** Teardown tasks queued and not yet run, which renderSettled waits for as Ember's run loop does. */
let pendingTeardown = 0;

setGlobalContext({
  scheduleRevalidate: scheduleRender,
  toBool,
  toIterator,
  getProp: (object: any, key: string) => object[key],
  setProp: (object: any, key: string, value: unknown) => (object[key] = value),
  getPath: (object: any, path: string) => path.split('.').reduce((value, key) => value?.[key], object),
  setPath: (object: any, path: string, value: unknown) => {
    const keys = path.split('.');
    const last = keys.pop() as string;
    keys.reduce((parent, key) => parent[key], object)[last] = value;
  },
  scheduleDestroy: <T>(destroyable: T, destructor: (destroyable: T) => void) =>
    scheduleTeardown(() => destructor(destroyable)),
  scheduleDestroyed: scheduleTeardown,
  warnIfStyleNotTrusted() {},
  assert() {},
  deprecate() {},
});

class Renderer {
  #context: any;
  #owner: object;
  #roots: Array<{ result: any }> = [];
  #lastRevision = -1;

  constructor(owner: object, document: unknown, isInteractive: boolean) {
    const shared = artifacts();
    const env = { isInteractive, enableDebugTooling: false, owner, onTransactionCommit() {} };
    const options = runtimeOptions({ document } as any, env as any, shared, RESOLVER as any);

    this.#owner = owner;
    this.#context = new EvaluationContextImpl(shared, (heap: any) => new RuntimeOpImpl(heap), options);
  }

  render(
    component: object,
    into: unknown,
    nextSibling: unknown,
    args: Record<string, unknown>,
    builder: Builder,
  ): Root {
    const root = { result: undefined as any, destroy: () => destroy(root) };
    inTransaction(this.#context.env, () => {
      const tree = builder(this.#context.env, { element: into, nextSibling });
      root.result = renderComponent(this.#context, tree as any, this.#owner, component, args).sync();
    });
    associateDestroyableChild(root, root.result);
    // Destroying the owner, as resetRendering does, destroys what rendered with it.
    associateDestroyableChild(this.#owner, root);
    this.#roots.push(root);
    RENDERERS.add(this);
    this.#lastRevision = valueForTag(CURRENT_TAG);

    return {
      destroy: () => {
        this.#roots = this.#roots.filter((each) => each !== root);
        if (this.#roots.length === 0) RENDERERS.delete(this);
        root.destroy();
      },
      firstNode: () => root.result.firstNode(),
    };
  }

  revalidate(): void {
    if (validateTag(CURRENT_TAG, this.#lastRevision)) return;

    inTransaction(this.#context.env, () => {
      for (const { result } of this.#roots) {
        if (!isDestroying(result) && !isDestroyed(result)) result.rerender({ alwaysRevalidate: false });
      }
    });
    this.#lastRevision = valueForTag(CURRENT_TAG);
  }
}

export interface RenderOptions {
  into: unknown;
  /** The node in `into` to render before: the end of it by default. */
  nextSibling?: unknown;
  args?: Record<string, unknown>;
  owner: object;
  document: unknown;
  /** Glimmer's clientBuilder, rehydrationBuilder to adopt a server's markup, or @glimmer/node's serializeBuilder. */
  builder: Builder;
  /** Whether modifiers and `{{on}}` run: off on a server. */
  interactive: boolean;
}

/** Renders `component` into `into` with the element builder given. */
export function render(
  component: object,
  { into, nextSibling = null, args = {}, owner, document, builder, interactive }: RenderOptions,
): Root {
  let renderers = RENDERERS_BY_OWNER.get(owner);
  if (!renderers) {
    renderers = new Map();
    RENDERERS_BY_OWNER.set(owner, renderers);
  }
  let renderer = renderers.get(document);
  if (!renderer) {
    renderer = new Renderer(owner, document, interactive);
    renderers.set(document, renderer);
  }

  return renderer.render(component, into, nextSibling, args, builder);
}

/** Resolves once the renders tracked state scheduled, and the teardown of what they removed, have run. */
export async function renderSettled(): Promise<void> {
  do {
    await (pendingRender ?? Promise.resolve());
  } while (pendingRender || pendingTeardown > 0);
}

/** Forgets every renderer, so the next render starts afresh: between tests. */
export function resetRenderers(): void {
  RENDERERS.clear();
}

function scheduleTeardown(task: () => void): void {
  pendingTeardown++;
  queueMicrotask(() => {
    try {
      task();
    } finally {
      pendingTeardown--;
    }
  });
}

function scheduleRender(): void {
  pendingRender ??= Promise.resolve().then(() => {
    pendingRender = undefined;
    for (const renderer of RENDERERS) renderer.revalidate();
  });
}

function internalHelper(compute: (positional: any[]) => unknown): object {
  const helper = ({ positional }: { positional: any[] }) => compute(positional);
  return setInternalHelperManager(helper as any, {} as any);
}

function toBool(value: unknown): boolean {
  return Array.isArray(value) ? value.length !== 0 : Boolean(value);
}

/**
 * What `{{#each}}` iterates, as Glimmer's IteratorDelegate: an array, an iterable, or a
 * forEach-able; `{{#each-in}}`, an object's values with its keys as their memos.
 */
function toIterator(iterable: any): any {
  if (iterable instanceof EachInWrapper) {
    const object = iterable.inner as Record<string, unknown> | null;
    const keys = object !== null && typeof object === 'object' ? Object.keys(object) : [];
    return keys.length === 0
      ? null
      : iterator(
          keys.map((key) => object![key]),
          keys,
        );
  }
  if (iterable === null || typeof iterable !== 'object') return null;

  const values: unknown[] = Array.isArray(iterable)
    ? iterable
    : typeof iterable[Symbol.iterator] === 'function'
      ? [...iterable]
      : typeof iterable.forEach === 'function'
        ? (() => {
            const collected: unknown[] = [];
            iterable.forEach((value: unknown) => collected.push(value));
            return collected;
          })()
        : [];
  return values.length === 0
    ? null
    : iterator(
        values,
        values.map((_, index) => index),
      );
}

function iterator(values: unknown[], memos: unknown[]): object {
  let position = 0;
  return {
    isEmpty: () => false,
    next: () => (position < values.length ? { value: values[position], memo: memos[position++] } : null),
  };
}
