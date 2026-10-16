import { i as isObject } from './spec-BXl1reqK.js';

const PROXIES = new WeakSet();
function isProxy(value) {
  if (isObject(value)) {
    return PROXIES.has(value);
  }
  return false;
}
function setProxy(object) {
  if (isObject(object)) {
    PROXIES.add(object);
  }
}

export { isProxy as i, setProxy as s };
