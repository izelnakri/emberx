function unwrap(val) {
  return val;
}
function expect(val, message) {
  return val;
}
function exhausted(value) {
}

function isPresentArray(list) {
  return list ? list.length > 0 : false;
}
function asPresentArray(list, message = `unexpected empty list`) {
  return list;
}
function getLast(list) {
  return list.length === 0 ? undefined : list[list.length - 1];
}
function getFirst(list) {
  return list.length === 0 ? undefined : list[0];
}
function mapPresentArray(list, mapper) {
  if (list === null) {
    return null;
  }
  let out = [];
  for (let item of list) {
    out.push(mapper(item));
  }
  return out;
}

function dict() {
  return Object.create(null);
}
function isDict(u) {
  return u !== null && u !== undefined;
}
function isIndexable(u) {
  return typeof u === 'function' || typeof u === 'object' && u !== null;
}
class StackImpl {
  stack;
  current = null;
  constructor(values = []) {
    this.stack = values;
  }
  get size() {
    return this.stack.length;
  }
  push(item) {
    this.current = item;
    this.stack.push(item);
  }
  pop() {
    let item = this.stack.pop();
    this.current = getLast(this.stack) ?? null;
    return item === undefined ? null : item;
  }
  nth(from) {
    let len = this.stack.length;
    return len < from ? null : unwrap(this.stack[len - from]);
  }
  isEmpty() {
    return this.stack.length === 0;
  }
  snapshot() {
    return [...this.stack];
  }
  toArray() {
    return this.stack;
  }
}

export { StackImpl as S, isPresentArray as a, getLast as b, isIndexable as c, dict as d, expect as e, asPresentArray as f, getFirst as g, exhausted as h, isDict as i, mapPresentArray as m, unwrap as u };
