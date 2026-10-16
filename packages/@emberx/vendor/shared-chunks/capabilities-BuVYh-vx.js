import { I as InternalComponentCapabilities } from './flags-BZxHQ0yn.js';

function buildCapabilities(capabilities) {
  return capabilities;
}
const EMPTY = InternalComponentCapabilities.Empty;
/**
 * Converts a ComponentCapabilities object into a 32-bit integer representation.
 */
function capabilityFlagsFrom(capabilities) {
  return EMPTY | capability(capabilities, 'dynamicLayout') | capability(capabilities, 'dynamicTag') | capability(capabilities, 'prepareArgs') | capability(capabilities, 'createArgs') | capability(capabilities, 'attributeHook') | capability(capabilities, 'elementHook') | capability(capabilities, 'dynamicScope') | capability(capabilities, 'createCaller') | capability(capabilities, 'updateHook') | capability(capabilities, 'createInstance') | capability(capabilities, 'wrapped') | capability(capabilities, 'willDestroy') | capability(capabilities, 'hasSubOwner');
}
function capability(capabilities, capability) {
  return capabilities[capability] ? InternalComponentCapabilities[capability] : EMPTY;
}
function managerHasCapability(_manager, capabilities, capability) {
  return !!(capabilities & capability);
}
function hasCapability(capabilities, capability) {
  return !!(capabilities & capability);
}

export { buildCapabilities as b, capabilityFlagsFrom as c, hasCapability as h, managerHasCapability as m };
