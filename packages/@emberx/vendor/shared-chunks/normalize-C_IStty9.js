import { e as expect } from './collections-GpG8lT2g.js';
import { s as setLocalDebugType } from './debug-brand-B1TWjOCH.js';

class CursorImpl {
  constructor(element, nextSibling) {
    this.element = element;
    this.nextSibling = nextSibling;
    setLocalDebugType('cursor', this);
  }
}
class ConcreteBounds {
  constructor(parentNode, first, last) {
    this.parentNode = parentNode;
    this.first = first;
    this.last = last;
  }
  parentElement() {
    return this.parentNode;
  }
  firstNode() {
    return this.first;
  }
  lastNode() {
    return this.last;
  }
}
function move(bounds, reference) {
  let parent = bounds.parentElement();
  let first = bounds.firstNode();
  let last = bounds.lastNode();
  let current = first;
  while (true) {
    let next = current.nextSibling;
    parent.insertBefore(current, reference);
    if (current === last) {
      return next;
    }
    current = expect(next);
  }
}
function clear(bounds) {
  let parent = bounds.parentElement();
  let first = bounds.firstNode();
  let last = bounds.lastNode();
  let current = first;
  while (true) {
    let next = current.nextSibling;
    parent.removeChild(current);
    if (current === last) {
      return next;
    }
    current = expect(next);
  }
}

function normalizeStringValue(value) {
  if (isEmpty(value)) {
    return '';
  }
  return String(value);
}
function shouldCoerce(value) {
  return isString(value) || isEmpty(value) || typeof value === 'boolean' || typeof value === 'number';
}
function isEmpty(value) {
  return value === null || value === undefined || typeof value.toString !== 'function';
}
function isIndexable(value) {
  return value !== null && typeof value === 'object';
}
function isSafeString(value) {
  return isIndexable(value) && typeof value['toHTML'] === 'function';
}
function isNode(value) {
  return isIndexable(value) && typeof value['nodeType'] === 'number';
}
function isFragment(value) {
  return isIndexable(value) && value['nodeType'] === 11;
}
function isString(value) {
  return typeof value === 'string';
}

export { ConcreteBounds as C, CursorImpl as a, isEmpty as b, clear as c, isString as d, isFragment as e, isNode as f, isSafeString as i, move as m, normalizeStringValue as n, shouldCoerce as s };
