// TODO: expose owner that can be changed? maybe limit with Object.defineProperty(this, 'owner'
// also this.element maybe
interface FreeObject {
  [propName: string]: any;
}

let context;

export function setContext(targetContext: FreeObject): FreeObject {
  context = targetContext;

  return context;
}

export function getContext(): FreeObject {
  return context;
}
