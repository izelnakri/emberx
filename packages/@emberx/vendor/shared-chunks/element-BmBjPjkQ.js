import { c as createComputeRef, v as valueForRef, N as NULL_REFERENCE } from './reference-CG0yPgLy.js';
import { s as setInternalComponentManager } from './api-DlJKfm_f.js';
import { i as internalHelper } from './internal-helper-Bz1lpDXr.js';

/**
  @module @ember/helper
*/


// ============ Element Component (for string tag names) ============
// Renders content wrapped in the specified HTML element, or just renders
// content without a wrapper for empty string.

const ELEMENT_CAPABILITIES = {
  createInstance: true,
  wrapped: true
};
class ElementComponentManager {
  getCapabilities() {
    return ELEMENT_CAPABILITIES;
  }
  getDebugName(state) {
    return `(element "${state.tagName}")`;
  }
  getSelf() {
    return NULL_REFERENCE;
  }
  getDestroyable() {
    return null;
  }
  didCreateElement() {}
  create(_owner, state) {
    // For empty string, return null so getTagName returns null (no wrapper element)
    return state.tagName || null;
  }
  getTagName(state) {
    return state;
  }
  didRenderLayout() {}
  didUpdateLayout() {}
  didCreate() {}
  didUpdate() {}
}
const ELEMENT_COMPONENT_MANAGER = new ElementComponentManager();
class ElementComponentDefinition {
  constructor(tagName) {
    this.tagName = tagName;
  }
  toString() {
    return `(element "${this.tagName}")`;
  }
}
setInternalComponentManager(ELEMENT_COMPONENT_MANAGER, ElementComponentDefinition.prototype);

// Cache component definitions per tag name to avoid creating duplicate definitions
const ELEMENT_DEFINITIONS = new Map();
function getElementDefinition(tagName) {
  let definition = ELEMENT_DEFINITIONS.get(tagName);
  if (definition === undefined) {
    definition = new ElementComponentDefinition(tagName);
    ELEMENT_DEFINITIONS.set(tagName, definition);
  }
  return definition;
}

// ============ Element Helper ============

const element = internalHelper(({
  positional,
  named
}) => {
  return createComputeRef(() => {
    let tagName = valueForRef(positional[0]);
    return getElementDefinition(tagName);
  }, null, 'element');
});

export { element as e };
