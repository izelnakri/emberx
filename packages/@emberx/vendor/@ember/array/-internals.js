const EMBER_ARRAYS = new WeakSet();
function setEmberArray(obj) {
  EMBER_ARRAYS.add(obj);
}
function isEmberArray(obj) {
  return EMBER_ARRAYS.has(obj);
}

export { isEmberArray, setEmberArray };
