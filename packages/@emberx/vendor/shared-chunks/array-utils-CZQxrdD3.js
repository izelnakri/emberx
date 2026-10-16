const EMPTY_ARRAY = Object.freeze([]);
function emptyArray() {
  return EMPTY_ARRAY;
}
const EMPTY_STRING_ARRAY = emptyArray();
const EMPTY_NUMBER_ARRAY = emptyArray();

/**
 * This function returns `true` if the input array is the special empty array sentinel,
 * which is sometimes used for optimizations.
 */
function isEmptyArray(input) {
  return input === EMPTY_ARRAY;
}
function* reverse(input) {
  for (let i = input.length - 1; i >= 0; i--) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
    yield input[i];
  }
}
function* enumerate(input) {
  let i = 0;
  for (const item of input) {
    yield [i++, item];
  }
}
/**
 * Zip two tuples with the same type and number of elements.
 */
function* zipTuples(left, right) {
  for (let i = 0; i < left.length; i++) {
    yield [i, left[i], right[i]];
  }
}
function* zipArrays(left, right) {
  for (let i = 0; i < left.length; i++) {
    const perform = i < right.length ? 'retain' : 'pop';
    yield [perform, i, left[i], right[i]];
  }
  for (let i = left.length; i < right.length; i++) {
    yield ['push', i, undefined, right[i]];
  }
}

export { EMPTY_ARRAY as E, EMPTY_NUMBER_ARRAY as a, EMPTY_STRING_ARRAY as b, emptyArray as c, zipTuples as d, enumerate as e, isEmptyArray as i, reverse as r, zipArrays as z };
