function lookupDescriptor(obj, keyName) {
  let current = obj;
  do {
    let descriptor = Object.getOwnPropertyDescriptor(current, keyName);
    if (descriptor !== undefined) {
      return descriptor;
    }
    current = Object.getPrototypeOf(current);
  } while (current !== null);
  return null;
}

export { lookupDescriptor as l };
