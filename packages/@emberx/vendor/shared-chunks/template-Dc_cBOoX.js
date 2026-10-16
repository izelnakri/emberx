const TEMPLATES = new WeakMap();
const getPrototypeOf = Reflect.getPrototypeOf;
function setComponentTemplate(factory, obj) {
  TEMPLATES.set(obj, factory);
  return obj;
}
function getComponentTemplate(obj) {
  let pointer = obj;
  while (pointer !== null) {
    let template = TEMPLATES.get(pointer);
    if (template !== undefined) {
      return template;
    }
    pointer = getPrototypeOf(pointer);
  }
  return undefined;
}

export { getComponentTemplate as g, setComponentTemplate as s };
