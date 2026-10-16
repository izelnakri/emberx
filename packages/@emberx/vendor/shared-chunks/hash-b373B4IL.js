import { c as createComputeRef, d as isInvokableRef, u as updateRef } from './reference-CG0yPgLy.js';
import { f as reifyPositional, g as check, e as reifyNamed } from './arguments-Carzx7C4.js';
import { j as setInternalHelperManager } from './api-DlJKfm_f.js';

/* eslint-disable @typescript-eslint/no-empty-object-type */
function buildUntouchableThis(source) {
  let context = null;
  return context;
}

function internalHelper(helper) {
  return setInternalHelperManager(helper, {});
}

const array = internalHelper(({
  positional
}) => {
  return createComputeRef(() => reifyPositional(positional), null, 'array');
});

const context = buildUntouchableThis();
const fn = internalHelper(({
  positional
}) => {
  let callbackRef = check(positional[0]);
  return createComputeRef(() => {
    return (...invocationArgs) => {
      let [fn, ...args] = reifyPositional(positional);
      if (isInvokableRef(callbackRef)) {
        let value = args.length > 0 ? args[0] : invocationArgs[0];
        return void updateRef(callbackRef, value);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- @fixme
        return fn.call(context, ...args, ...invocationArgs);
      }
    };
  }, null, 'fn');
});

const hash = internalHelper(({
  named
}) => {
  let ref = createComputeRef(() => {
    return reifyNamed(named);
  }, null, 'hash');

  // Setup the children so that templates can bypass getting the value of
  // the reference and treat children lazily
  let children = new Map();
  for (let name in named) {
    children.set(name, named[name]);
  }
  ref.children = children;
  return ref;
});

export { array as a, fn as f, hash as h, internalHelper as i };
