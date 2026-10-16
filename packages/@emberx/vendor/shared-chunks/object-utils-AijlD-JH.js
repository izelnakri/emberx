const assign = Object.assign;
function values(obj) {
  return Object.values(obj);
}
function entries(dict) {
  return Object.entries(dict);
}
function keys(obj) {
  return Object.keys(obj);
}

export { assign as a, entries as e, keys as k, values as v };
