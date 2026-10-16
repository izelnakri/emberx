let assert = () => {};
function setAssert(implementation) {
  assert = implementation;
  return implementation;
}

export { assert, setAssert };
