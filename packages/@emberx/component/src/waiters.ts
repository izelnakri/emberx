/**
 * Test waiters, with @ember/test-waiters' API: app code marks async work that
 * is neither an `@action` nor a router transition, a service's fetch or a
 * timer, and @emberx/test-helpers' settled() waits for it too. In app code, so
 * here rather than in the test helpers, which an app does not ship.
 *
 * As in Ember, a waiter's debug info has the stack where its work began only
 * with debug checks on (EMBERX_DEBUG), as taking one costs. Unlike Ember's,
 * which a test polls every 10ms, waitersSettled() resolves as the last piece of
 * work ends.
 */

declare const EMBERX_DEBUG: boolean | undefined;

/** Where a waiter's piece of work began: its label, and its stack with debug checks on. */
export interface TestWaiterDebugInfo {
  label: string | undefined;
  stack: string | undefined;
}

/** What getPendingWaiterState() returns: how much work is under way, and each waiter's, by its name. */
export interface PendingWaiterState {
  pending: number;
  waiters: Record<string, TestWaiterDebugInfo[]>;
}

/** A waiter for work that begins and ends in different places: a socket's messages, a timer. */
export interface TestWaiter<T = unknown> {
  readonly name: string;
  /** Marks work under way, by `token` or one made for it, which it returns for endAsync(). */
  beginAsync(token?: T, label?: string): T;
  /** Ends the work `token` marks. */
  endAsync(token: T): void;
  /** Whether this waiter has no work under way. */
  waitUntil(): boolean;
  /** Where its work under way began. */
  debugInfo(): TestWaiterDebugInfo[];
  /** Forgets its work under way, as if it had all ended. */
  reset(): void;
}

const DEBUG = typeof EMBERX_DEBUG !== 'undefined' && Boolean(EMBERX_DEBUG);
/** Every waiter there is, by its name. */
const WAITERS = new Map<string, TestWaiterImpl>();
/** What waitersSettled() resolves once no waiter has work under way. */
const SETTLED_CALLBACKS = new Set<() => void>();

/** How many pieces of work every waiter has under way, together. */
let pending = 0;

class TestWaiterImpl<T = unknown> implements TestWaiter<T> {
  readonly name: string;
  #items = new Map<T, TestWaiterDebugInfo>();
  #nextToken = 0;

  constructor(name: string) {
    this.name = name;
  }

  beginAsync(token: T = this.#nextToken++ as T, label?: string): T {
    if (this.#items.has(token)) {
      throw new Error(`beginAsync called for ${String(token)} but it is already pending.`);
    }

    this.#items.set(token, { label, stack: DEBUG ? new Error().stack : undefined });
    pending++;
    return token;
  }

  endAsync(token: T): void {
    if (!this.#items.delete(token)) {
      throw new Error(
        `testWaiter.endAsync called with no preceding testWaiter.beginAsync call. Test waiter: ${this.name}`,
      );
    }

    workEnded(1);
  }

  waitUntil(): boolean {
    return this.#items.size === 0;
  }

  debugInfo(): TestWaiterDebugInfo[] {
    return [...this.#items.values()];
  }

  reset(): void {
    const ended = this.#items.size;
    this.#items.clear();
    workEnded(ended);
  }
}

/** What waitForPromise() and waitFor() mark their promises with, as Ember's do. */
const PROMISE_WAITER = buildWaiter('promise-waiter');

/**
 * A waiter named `name`, for work that a promise does not stand for. Building
 * one by a name already built returns that one.
 *
 *   const waiter = buildWaiter('chat-socket');
 *   const token = waiter.beginAsync();
 *   socket.addEventListener('message', () => waiter.endAsync(token), { once: true });
 */
export function buildWaiter<T = unknown>(name: string): TestWaiter<T> {
  let waiter = WAITERS.get(name);
  if (!waiter) {
    waiter = new TestWaiterImpl(name);
    WAITERS.set(name, waiter);
  }
  return waiter as TestWaiter<T>;
}

/**
 * Marks `promise` as work settled() waits for, until it settles, and returns it.
 *
 *   this.posts = await waitForPromise(fetch('/posts').then((response) => response.json()));
 */
export function waitForPromise<T>(promise: Promise<T>, label?: string): Promise<T> {
  // A token of its own, so the same promise can be waited for twice.
  const token = PROMISE_WAITER.beginAsync({}, label);
  const end = () => PROMISE_WAITER.endAsync(token);
  promise.then(end, end);

  return promise;
}

/**
 * The promise an async method or function returns, marked as waitForPromise()
 * marks it: `@waitFor async load() {}` on a service's method, or
 * `waitFor(async () => {})` around a function.
 */
export function waitFor<Method extends (...args: any[]) => any>(
  method: Method,
  contextOrLabel?: ClassMethodDecoratorContext | string,
): Method {
  const label = typeof contextOrLabel === 'object' ? String(contextOrLabel.name) : contextOrLabel;

  return function (this: unknown, ...args: unknown[]) {
    const result = method.apply(this, args);
    return typeof result?.then === 'function' ? waitForPromise(result, label) : result;
  } as Method;
}

/** Whether any waiter has work under way. */
export function hasPendingWaiters(): boolean {
  return pending > 0;
}

/** How much work is under way, and where each waiter's began, by the waiter's name. */
export function getPendingWaiterState(): PendingWaiterState {
  const waiters: Record<string, TestWaiterDebugInfo[]> = {};
  WAITERS.forEach((waiter) => {
    if (!waiter.waitUntil()) waiters[waiter.name] = waiter.debugInfo();
  });

  return { pending, waiters };
}

/** Resolves once no waiter has work under way. */
export function waitersSettled(): Promise<void> {
  if (pending === 0) return Promise.resolve();

  return new Promise((resolve) => SETTLED_CALLBACKS.add(resolve));
}

function workEnded(count: number): void {
  pending -= count;
  if (pending === 0) {
    SETTLED_CALLBACKS.forEach((resolve) => resolve());
    SETTLED_CALLBACKS.clear();
  }
}
