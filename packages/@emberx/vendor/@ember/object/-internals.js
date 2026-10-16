export { g as cacheFor } from '../../shared-chunks/computed_cache-DmYKevAP.js';
export { g as guidFor } from '../../shared-chunks/guid-Cbq2sNV_.js';
import '../../shared-chunks/super-BBBjgF69.js';
import EmberObject from './index.js';

// Here we have runtime shenanigans to add debug-only errors to the class in dev
// builds. Those runtime shenanigans produce the need for type-level shenanigans
// to match: if we just assign without an explicit type annotation on the `let`
// binding below for `FrameworkObject`, TS gets stuck because this creates
// `FrameworkObject` with a class expression (rather than the usual class
// declaration form). That in turn means TS needs to be able to fully name the
// type produced by the class expression, which includes the `OWNER` symbol from
// `@glimmer/owner`.
//
// By explicitly giving the declaration a type when assigning it the class
// expression, instead of relying on inference, TS no longer needs to name the
// `OWNER` property key from the super class, eliminating the private name
// shenanigans.

// eslint-disable-next-line @typescript-eslint/no-empty-object-type

let FrameworkObject = class FrameworkObject extends EmberObject {};

export { FrameworkObject };
