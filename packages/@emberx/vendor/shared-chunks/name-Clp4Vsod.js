import { i as isObject } from './spec-BXl1reqK.js';

const NAMES = new WeakMap();
function setName(obj, name) {
  if (isObject(obj)) NAMES.set(obj, name);
}
function getName(obj) {
  return NAMES.get(obj);
}

export { getName as g, setName as s };
