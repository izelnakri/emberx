export { trackedArray, trackedMap, trackedObject, trackedSet, trackedWeakMap, trackedWeakSet } from '../../@ember/reactive/collections.js';
export { d as dirtyTagFor, t as tagFor, a as tagMetaFor } from '../../shared-chunks/meta-BJtIZDir.js';
export { T as TrackedValue, a as trackedData, t as trackedValue } from '../../shared-chunks/tracked-value-CR6kx-73.js';
export { A as ALLOW_CYCLES, h as COMPUTE, j as CONSTANT, C as CONSTANT_TAG, k as CURRENT_TAG, l as CurrentTag, I as INITIAL, V as VOLATILE, m as VOLATILE_TAG, n as VolatileTag, o as beginTrackFrame, p as beginUntrackFrame, q as bump, d as combine, c as consumeTag, e as createCache, r as createTag, b as createUpdatableTag, D as dirtyTag, s as endTrackFrame, w as endUntrackFrame, g as getValue, i as isConst, x as isConstTag, f as isTracking, y as resetTracking, t as track, u as untrack, U as updateTag, v as validateTag, a as valueForTag } from '../../shared-chunks/cache-CofLhaS4.js';

/* eslint-disable @typescript-eslint/no-non-null-assertion -- @fixme */

const debug = {};

const GLIMMER_VALIDATOR_REGISTRATION = Symbol('GLIMMER_VALIDATOR_REGISTRATION');
if (Reflect.has(globalThis, GLIMMER_VALIDATOR_REGISTRATION)) {
  throw new Error('The `@glimmer/validator` library has been included twice in this application. It could be different versions of the package, or the same version included twice by mistake. `@glimmer/validator` depends on having a single copy of the package in use at any time in an application, even if they are the same version. You must dedupe your build to remove the duplicate packages in order to prevent this error.');
}
Reflect.set(globalThis, GLIMMER_VALIDATOR_REGISTRATION, true);

export { debug };
