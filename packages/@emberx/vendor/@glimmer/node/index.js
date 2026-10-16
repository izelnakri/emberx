import { C as ConcreteBounds } from '../../shared-chunks/normalize-C_IStty9.js';
import { D as DOMTreeConstruction } from '../../shared-chunks/api-DzOa0Acr.js';
import createHTMLDocument from '../../@simple-dom/document/index.js';
export { s as serializeBuilder } from '../../shared-chunks/serialize-builder-CsG9WHVw.js';

class NodeDOMTreeConstruction extends DOMTreeConstruction {
  // Hides property on base class
  constructor(doc) {
    super(doc || createHTMLDocument());
  }

  // override to prevent usage of `this.document` until after the constructor
  setupUselessElement() {}
  insertHTMLBefore(parent, reference, html) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated, @typescript-eslint/no-non-null-assertion
    let raw = this.document.createRawHTMLSection(html);
    parent.insertBefore(raw, reference);
    return new ConcreteBounds(parent, raw, raw);
  }

  // override to avoid SVG detection/work when in node (this is not needed in SSR)
  createElement(tag) {
    return this.document.createElement(tag);
  }

  // override to avoid namespace shenanigans when in node (this is not needed in SSR)
  setAttribute(element, name, value) {
    element.setAttribute(name, value);
  }
}

export { NodeDOMTreeConstruction };
