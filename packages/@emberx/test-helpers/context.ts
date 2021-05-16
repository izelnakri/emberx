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
