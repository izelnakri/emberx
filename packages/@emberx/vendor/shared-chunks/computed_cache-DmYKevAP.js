import { peekMeta } from '../@ember/-internals/meta/lib/meta.js';

function getCachedValueFor(obj, key) {
  let meta = peekMeta(obj);
  if (meta) {
    return meta.valueFor(key);
  } else {
    return undefined;
  }
}

export { getCachedValueFor as g };
