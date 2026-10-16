import { associateDestroyableChild } from '../@glimmer/destroyable/index.js';
import { a as getInternalHelperManager, f as hasValue, h as hasDestroyable } from './api-DlJKfm_f.js';
import { getOwner } from '../@glimmer/owner/index.js';
import { e as createCache, g as getValue } from './cache-CofLhaS4.js';
import { E as EMPTY_ARGS, a as EMPTY_NAMED, b as EMPTY_POSITIONAL } from './arguments-Carzx7C4.js';

function getArgs(proxy) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
  return getValue(proxy.argsCache);
}
class SimpleArgsProxy {
  argsCache;
  constructor(context, computeArgs = () => EMPTY_ARGS) {
    let argsCache = createCache(() => computeArgs(context));
    {
      this.argsCache = argsCache;
    }
  }
  get named() {
    return getArgs(this).named || EMPTY_NAMED;
  }
  get positional() {
    return getArgs(this).positional || EMPTY_POSITIONAL;
  }
}

////////////

function invokeHelper(context, definition, computeArgs) {
  const owner = getOwner(context);
  const internalManager = getInternalHelperManager(definition);
  const manager = internalManager.getDelegateFor(owner);
  let args = new SimpleArgsProxy(context, computeArgs);
  let bucket = manager.createHelper(definition, args);
  let cache;
  if (hasValue(manager)) {
    cache = createCache(() => {
      return manager.getValue(bucket);
    });
    associateDestroyableChild(context, cache);
  } else {
    throw new Error('TODO: unreachable, to be implemented with hasScheduledEffect');
  }
  if (hasDestroyable(manager)) {
    let destroyable = manager.getDestroyable(bucket);
    associateDestroyableChild(cache, destroyable);
  }
  return cache;
}

export { invokeHelper as i };
