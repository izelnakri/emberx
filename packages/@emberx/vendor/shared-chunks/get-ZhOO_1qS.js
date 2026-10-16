import { c as createComputeRef, U as UNDEFINED_REFERENCE, v as valueForRef } from './reference-CG0yPgLy.js';
import { f as reifyPositional } from './arguments-Carzx7C4.js';
import { i as internalHelper } from './hash-b373B4IL.js';
import { setPath, getPath } from '../@glimmer/global-context/index.js';
import { i as isDict } from './collections-GpG8lT2g.js';

const isEmpty = value => {
  return value === null || value === undefined || typeof value.toString !== 'function';
};
const normalizeTextValue = value => {
  if (isEmpty(value)) {
    return '';
  }
  return String(value);
};
const concat = internalHelper(({
  positional
}) => {
  return createComputeRef(() => reifyPositional(positional).map(normalizeTextValue).join(''), null, 'concat');
});

const get = internalHelper(({
  positional
}) => {
  let sourceRef = positional[0] ?? UNDEFINED_REFERENCE;
  let pathRef = positional[1] ?? UNDEFINED_REFERENCE;
  return createComputeRef(() => {
    let source = valueForRef(sourceRef);
    if (isDict(source)) {
      return getPath(source, String(valueForRef(pathRef)));
    }
  }, value => {
    let source = valueForRef(sourceRef);
    if (isDict(source)) {
      return setPath(source, String(valueForRef(pathRef)), value);
    }
  }, 'get');
});

export { concat as c, get as g };
