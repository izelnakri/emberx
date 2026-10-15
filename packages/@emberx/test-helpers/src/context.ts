// TODO: expose owner that can be changed? maybe limit with Object.defineProperty(this, 'owner'
// also this.element maybe
interface FreeObject {
  [propName: string]: any;
}

// NOTE: the definite-assignment assertion matches `getContext`'s existing
// contract, which already promises a `FreeObject`. `setupTest`'s `beforeEach`
// installs the context before any helper reads it; calling `getContext()` before
// that still returns `undefined` at runtime.
let context!: FreeObject;

/** The running test's `assert`, for helpers that act on the test itself, such as pauseTest. */
let assert: { timeout(duration: number): void } | undefined;

export function setContext(targetContext: FreeObject, targetAssert?: { timeout(duration: number): void }): FreeObject {
  context = targetContext;
  assert = targetAssert;

  return context;
}

export function getAssert() {
  return assert;
}

export function getContext(): FreeObject {
  return context;
}
