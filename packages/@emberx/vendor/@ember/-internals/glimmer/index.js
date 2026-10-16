export { t as template, a as templateCacheCounters } from '../../../shared-chunks/index-kwuZeaNz.js';
export { O as OutletView, R as Renderer, a as RootTemplate, s as setupApplicationRegistry, b as setupEngineRegistry } from '../../../shared-chunks/setup-registry-BVfYGE0S.js';
export { I as Input, T as Textarea } from '../../../shared-chunks/textarea-Bt9nkwXR.js';
export { LinkTo } from '../../routing/index.js';
export { default as Component, setComponentManager } from '../../component/index.js';
export { default as Helper, helper } from '../../component/helper.js';
export { S as SafeString, T as TrustedHTML, h as htmlSafe, i as isHTMLSafe, a as isTrustedHTML, t as trustHTML } from '../../../shared-chunks/index-D-xTBV4B.js';
export { D as DOMChanges } from '../../../shared-chunks/render-OqKpH1Pf.js';
export { D as DOMTreeConstruction } from '../../../shared-chunks/api-DzOa0Acr.js';
export { i as isSerializationFirstNode } from '../../../shared-chunks/rehydrate-builder-n_8RCUj9.js';
export { NodeDOMTreeConstruction } from '../../../@glimmer/node/index.js';
export { e as element } from '../../../shared-chunks/element-BmBjPjkQ.js';
export { u as uniqueId } from '../../../shared-chunks/unique-id-BJb1p8EG.js';
export { _ as _resetRenderers, r as renderComponent, a as renderSettled } from '../../../shared-chunks/index-_4333rii.js';
export { c as componentCapabilities, m as modifierCapabilities } from '../../../shared-chunks/api-B_poQGXS.js';

// STATE within a module is frowned upon, this exists
// to support Ember.TEMPLATES but shield ember internals from this legacy
// global API.

let TEMPLATES = {};
function setTemplates(templates) {
  TEMPLATES = templates;
}
function getTemplates() {
  return TEMPLATES;
}
function getTemplate(name) {
  if (Object.prototype.hasOwnProperty.call(TEMPLATES, name)) {
    return TEMPLATES[name];
  }
}
function hasTemplate(name) {
  return Object.prototype.hasOwnProperty.call(TEMPLATES, name);
}
function setTemplate(name, template) {
  return TEMPLATES[name] = template;
}

export { getTemplate, getTemplates, hasTemplate, setTemplate, setTemplates };
