export { E as ENV, g as getENV } from '../../../shared-chunks/env-DXxsTFkM.js';

const global = globalThis;
const Ember = global['Ember'];

// legacy imports/exports/lookup stuff (should we keep this??)
const context = Ember === undefined ? {
  imports: global,
  exports: global,
  lookup: global
} : {
  // import jQuery
  imports: Ember.imports || global,
  // export Ember
  exports: Ember.exports || global,
  // search for Namespaces
  lookup: Ember.lookup || global
};
function getLookup() {
  return context.lookup;
}
function setLookup(value) {
  context.lookup = value;
}

export { context, getLookup, setLookup };
