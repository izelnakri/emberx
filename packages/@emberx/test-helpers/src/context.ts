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

export function setContext(targetContext: FreeObject): FreeObject {
  context = targetContext;

  return context;
}

export function getContext(): FreeObject {
  return context;
}
