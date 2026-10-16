import { S as StackImpl, e as expect } from './collections-GpG8lT2g.js';
import { a as assert } from './assert-Zqc4wiAV.js';
import { s as setLocalDebugType } from './debug-brand-B1TWjOCH.js';
import { registerDestructor, destroy } from '../@glimmer/destroyable/index.js';
import { i as isSafeString, n as normalizeStringValue, a as CursorImpl, C as ConcreteBounds, c as clear } from './normalize-C_IStty9.js';
import { a as castToBrowser } from './simple-cast-DCvJLSin.js';
import { n as normalizeProperty } from './props-fiqxqhAH.js';

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const COMMENT_NODE = 8;
const NS_MATHML = 'http://www.w3.org/1998/Math/MathML';
const NS_SVG = 'http://www.w3.org/2000/svg';
const INSERT_BEFORE_BEGIN = 'beforebegin';
const INSERT_BEFORE_END = 'beforeend';

const badProtocols = ['javascript:', 'vbscript:'];
const badTags = ['A', 'AREA', 'BODY', 'LINK', 'IMG', 'IFRAME', 'BASE', 'FORM', 'BUTTON', 'INPUT'];
const badTagsForDataURI = ['EMBED'];
const badTagsForDataProtocol = ['IFRAME', 'OBJECT'];
const badAttributes = ['href', 'src', 'background', 'action', 'formaction', 'xlink:href'];
const badAttributesForDataURI = ['src'];
const badAttributesForDataProtocol = ['src', 'data'];
function has(array, item) {
  return array.indexOf(item) !== -1;
}
function checkURI(tagName, attribute) {
  // SVG tagNames are case-preserved, so the SVG `<a>` element comes through as
  // lowercase `a` and never matches the uppercase `badTags` entries unless we
  // normalize first. The attribute name can likewise arrive camelCased (e.g.
  // `formAction`) when the template author writes it that way and it resolves to
  // a DOM property, so lower-case it before matching the lowercase lists.
  return (tagName === null || has(badTags, tagName.toUpperCase())) && has(badAttributes, attribute.toLowerCase());
}
function checkDataURI(tagName, attribute) {
  if (tagName === null) return false;
  return has(badTagsForDataURI, tagName.toUpperCase()) && has(badAttributesForDataURI, attribute.toLowerCase());
}
function checkDataProtocol(tagName, attribute) {
  if (tagName === null) return false;
  return has(badTagsForDataProtocol, tagName.toUpperCase()) && has(badAttributesForDataProtocol, attribute.toLowerCase());
}
function requiresSanitization(tagName, attribute) {
  return checkURI(tagName, attribute) || checkDataURI(tagName, attribute) || checkDataProtocol(tagName, attribute);
}
function findProtocolForURL() {
  const weirdURL = URL;
  if (typeof weirdURL === 'object' && weirdURL !== null &&
  // this is super annoying, TS thinks that URL **must** be a function so `URL.parse` check
  // thinks it is `never` without this `as unknown as any`

  typeof weirdURL.parse === 'function') {
    // In Ember-land the `fastboot` package sets the `URL` global to `require('url')`
    // ultimately, this should be changed (so that we can either rely on the natural `URL` global
    // that exists) but for now we have to detect the specific `FastBoot` case first
    //
    // a future version of `fastboot` will detect if this legacy URL setup is required (by
    // inspecting Ember version) and if new enough, it will avoid shadowing the `URL` global
    // constructor with `require('url')`.
    let nodeURL = weirdURL;
    return url => {
      let protocol = null;
      if (typeof url === 'string') {
        // browsers strip ASCII tab/newline/CR from urls before navigating, so
        // `java\nscript:` runs as `javascript:`. `url.parse` keeps them and reports
        // a null protocol, slipping past the badProtocols check. Strip them here to
        // match the WHATWG `URL` parser used on the non-fastboot path.
        protocol = nodeURL.parse(url.replace(/[\t\n\r]/gu, '')).protocol;
      }
      return protocol === null ? ':' : protocol;
    };
  } else if (typeof weirdURL === 'function') {
    return _url => {
      try {
        let url = new weirdURL(_url);
        return url.protocol;
      } catch {
        // any non-fully qualified url string will trigger an error (because there is no
        // baseURI that we can provide; in that case we **know** that the protocol is
        // "safe" because it isn't specifically one of the `badProtocols` listed above
        // (and those protocols can never be the default baseURI)
        return ':';
      }
    };
  } else {
    throw new Error(`@glimmer/runtime needs a valid "globalThis.URL"`);
  }
}
let _protocolForUrlImplementation;
function protocolForUrl(url) {
  if (!_protocolForUrlImplementation) {
    _protocolForUrlImplementation = findProtocolForURL();
  }
  return _protocolForUrlImplementation(url);
}
function sanitizeAttributeValue(element, attribute, value) {
  if (value === null || value === undefined) {
    return value;
  }
  if (isSafeString(value)) {
    return value.toHTML();
  }
  const tagName = element.tagName;
  let str = normalizeStringValue(value);
  if (checkURI(tagName, attribute)) {
    let protocol = protocolForUrl(str);
    if (has(badProtocols, protocol)) {
      return `unsafe:${str}`;
    }
  }
  if (checkDataProtocol(tagName, attribute)) {
    let protocol = protocolForUrl(str);
    if (protocol === 'data:' || has(badProtocols, protocol)) {
      return `unsafe:${str}`;
    }
  }
  if (checkDataURI(tagName, attribute)) {
    return `unsafe:${str}`;
  }
  return str;
}

function dynamicAttribute(element, attr, namespace, isTrusting = false) {
  const {
    tagName,
    namespaceURI
  } = element;
  const attribute = {
    element,
    name: attr,
    namespace
  };
  if (namespaceURI === NS_SVG) {
    return buildDynamicAttribute(tagName, attr, attribute);
  }
  const {
    type,
    normalized
  } = normalizeProperty(element, attr);
  if (type === 'attr') {
    return buildDynamicAttribute(tagName, normalized, attribute);
  } else {
    return buildDynamicProperty(tagName, normalized, attribute);
  }
}
function buildDynamicAttribute(tagName, name, attribute) {
  if (requiresSanitization(tagName, name)) {
    return new SafeDynamicAttribute(attribute);
  } else {
    return new SimpleDynamicAttribute(attribute);
  }
}
function buildDynamicProperty(tagName, name, attribute) {
  if (requiresSanitization(tagName, name)) {
    return new SafeDynamicProperty(name, attribute);
  }
  if (isUserInputValue(tagName, name)) {
    return new InputValueDynamicAttribute(name, attribute);
  }
  if (isOptionSelected(tagName, name)) {
    return new OptionSelectedDynamicAttribute(name, attribute);
  }
  return new DefaultDynamicProperty(name, attribute);
}
class DynamicAttribute {
  constructor(attribute) {
    this.attribute = attribute;
  }
}
class SimpleDynamicAttribute extends DynamicAttribute {
  set(dom, value, _env) {
    const normalizedValue = normalizeValue(value);
    if (normalizedValue !== null) {
      const {
        name,
        namespace
      } = this.attribute;
      dom.__setAttribute(name, normalizedValue, namespace);
    }
  }
  update(value, _env) {
    const normalizedValue = normalizeValue(value);
    const {
      element,
      name
    } = this.attribute;
    if (normalizedValue === null) {
      element.removeAttribute(name);
    } else {
      element.setAttribute(name, normalizedValue);
    }
  }
}
class DefaultDynamicProperty extends DynamicAttribute {
  constructor(normalizedName, attribute) {
    super(attribute);
    this.normalizedName = normalizedName;
  }
  value;
  set(dom, value, _env) {
    if (value !== null && value !== undefined) {
      this.value = value;
      dom.__setProperty(this.normalizedName, value);
    }
  }
  update(value, _env) {
    const {
      element
    } = this.attribute;
    if (this.value !== value) {
      element[this.normalizedName] = this.value = value;
      if (value === null || value === undefined) {
        this.removeAttribute();
      }
    }
  }
  removeAttribute() {
    // TODO this sucks but to preserve properties first and to meet current
    // semantics we must do this.
    const {
      element,
      namespace
    } = this.attribute;
    if (namespace) {
      element.removeAttributeNS(namespace, this.normalizedName);
    } else {
      element.removeAttribute(this.normalizedName);
    }
  }
}
class SafeDynamicProperty extends DefaultDynamicProperty {
  set(dom, value, env) {
    const {
      element,
      name
    } = this.attribute;
    const sanitized = sanitizeAttributeValue(element, name, value);
    super.set(dom, sanitized, env);
  }
  update(value, env) {
    const {
      element,
      name
    } = this.attribute;
    const sanitized = sanitizeAttributeValue(element, name, value);
    super.update(sanitized, env);
  }
}
class SafeDynamicAttribute extends SimpleDynamicAttribute {
  set(dom, value, env) {
    const {
      element,
      name
    } = this.attribute;
    const sanitized = sanitizeAttributeValue(element, name, value);
    super.set(dom, sanitized, env);
  }
  update(value, env) {
    const {
      element,
      name
    } = this.attribute;
    const sanitized = sanitizeAttributeValue(element, name, value);
    super.update(sanitized, env);
  }
}
class InputValueDynamicAttribute extends DefaultDynamicProperty {
  set(dom, value) {
    const normalized = normalizeStringValue(value);
    dom.__setProperty('value', normalized);

    // GH#19219: Browsers don't reflect `input.value = ''` as a value attribute when
    // type is later changed to "radio"/"checkbox". Explicitly set the attribute for <input>.
    // Not needed for <textarea> (no value attribute).
    if (value === '' && this.attribute.element.tagName === 'INPUT') {
      dom.__setAttribute('value', '', null);
    }
  }
  update(value) {
    const input = castToBrowser(this.attribute.element);
    const currentValue = input.value;
    const normalizedValue = normalizeStringValue(value);
    if (currentValue !== normalizedValue) {
      input.value = normalizedValue;
    }
  }
}
class OptionSelectedDynamicAttribute extends DefaultDynamicProperty {
  set(dom, value) {
    if (value !== null && value !== undefined && value !== false) {
      dom.__setProperty('selected', true);
    }
  }
  update(value) {
    const option = castToBrowser(this.attribute.element);
    if (value) {
      option.selected = true;
    } else {
      option.selected = false;
    }
  }
}
function isOptionSelected(tagName, attribute) {
  return tagName === 'OPTION' && attribute === 'selected';
}
function isUserInputValue(tagName, attribute) {
  return (tagName === 'INPUT' || tagName === 'TEXTAREA') && attribute === 'value';
}
function normalizeValue(value) {
  if (value === false || value === undefined || value === null || typeof value.toString === 'undefined') {
    return null;
  }
  if (value === true) {
    return '';
  }
  // onclick function etc in SSR
  if (typeof value === 'function') {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-base-to-string -- @fixme
  return String(value);
}

class First {
  constructor(node) {
    this.node = node;
  }
  firstNode() {
    return this.node;
  }
}
class Last {
  constructor(node) {
    this.node = node;
  }
  lastNode() {
    return this.node;
  }
}
class NewTreeBuilder {
  dom;
  updateOperations;
  constructing = null;
  operations = null;
  env;
  cursors = new StackImpl();
  modifierStack = new StackImpl();
  blockStack = new StackImpl();
  static forInitialRender(env, cursor) {
    return new this(env, cursor.element, cursor.nextSibling).initialize();
  }
  static resume(env, block) {
    let parentNode = block.parentElement();
    let nextSibling = block.reset(env);
    let stack = new this(env, parentNode, nextSibling).initialize();
    stack.pushBlock(block);
    return stack;
  }
  constructor(env, parentNode, nextSibling) {
    this.pushElement(parentNode, nextSibling);
    this.env = env;
    this.dom = env.getAppendOperations();
    this.updateOperations = env.getDOM();
  }
  initialize() {
    this.pushAppendingBlock();
    return this;
  }
  debugBlocks() {
    return this.blockStack.toArray();
  }
  get element() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
    return this.cursors.current.element;
  }
  get nextSibling() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
    return this.cursors.current.nextSibling;
  }
  get hasBlocks() {
    return this.blockStack.size > 0;
  }
  block() {
    return expect(this.blockStack.current);
  }
  popElement() {
    this.cursors.pop();
    expect(this.cursors.current);
  }
  pushAppendingBlock() {
    return this.pushBlock(new AppendingBlockImpl(this.element));
  }
  pushResettableBlock() {
    return this.pushBlock(new ResettableBlockImpl(this.element));
  }
  pushBlockList(list) {
    return this.pushBlock(new AppendingBlockList(this.element, list));
  }
  pushBlock(block, isRemote = false) {
    let current = this.blockStack.current;
    if (current !== null) {
      if (!isRemote) {
        current.didAppendBounds(block);
      }
    }
    this.__openBlock();
    this.blockStack.push(block);
    return block;
  }
  popBlock() {
    this.block().finalize(this);
    this.__closeBlock();
    return expect(this.blockStack.pop());
  }
  __openBlock() {}
  __closeBlock() {}

  // todo return seems unused
  openElement(tag) {
    let element = this.__openElement(tag);
    this.constructing = element;
    return element;
  }
  __openElement(tag) {
    return this.dom.createElement(tag, this.element);
  }
  flushElement(modifiers) {
    let parent = this.element;
    let element = expect(this.constructing);
    this.__flushElement(parent, element);
    this.constructing = null;
    this.operations = null;
    this.pushModifiers(modifiers);
    this.pushElement(element, null);
    this.didOpenElement(element);
  }
  __flushElement(parent, constructing) {
    this.dom.insertBefore(parent, constructing, this.nextSibling);
  }
  closeElement() {
    this.willCloseElement();
    this.popElement();
    return this.popModifiers();
  }
  pushRemoteElement(element, guid, insertBefore) {
    return this.__pushRemoteElement(element, guid, insertBefore);
  }
  __pushRemoteElement(element, _guid, insertBefore) {
    this.pushElement(element, insertBefore);
    if (insertBefore === undefined) {
      while (element.lastChild) {
        element.removeChild(element.lastChild);
      }
    }
    let block = new RemoteBlock(element);
    return this.pushBlock(block, true);
  }
  popRemoteElement() {
    const block = this.popBlock();
    this.popElement();
    return block;
  }
  pushElement(element, nextSibling = null) {
    this.cursors.push(new CursorImpl(element, nextSibling));
  }
  pushModifiers(modifiers) {
    this.modifierStack.push(modifiers);
  }
  popModifiers() {
    return this.modifierStack.pop();
  }
  didAppendBounds(bounds) {
    this.block().didAppendBounds(bounds);
    return bounds;
  }
  didAppendNode(node) {
    this.block().didAppendNode(node);
    return node;
  }
  didOpenElement(element) {
    this.block().openElement(element);
    return element;
  }
  willCloseElement() {
    this.block().closeElement();
  }
  appendText(string) {
    return this.didAppendNode(this.__appendText(string));
  }
  __appendText(text) {
    let {
      dom,
      element,
      nextSibling
    } = this;
    let node = dom.createTextNode(text);
    dom.insertBefore(element, node, nextSibling);
    return node;
  }
  __appendNode(node) {
    this.dom.insertBefore(this.element, node, this.nextSibling);
    return node;
  }
  __appendFragment(fragment) {
    let first = fragment.firstChild;
    if (first) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
      let ret = new ConcreteBounds(this.element, first, fragment.lastChild);
      this.dom.insertBefore(this.element, fragment, this.nextSibling);
      return ret;
    } else {
      const comment = this.__appendComment('');
      return new ConcreteBounds(this.element, comment, comment);
    }
  }
  __appendHTML(html) {
    return this.dom.insertHTMLBefore(this.element, this.nextSibling, html);
  }
  appendDynamicHTML(value) {
    let bounds = this.trustedContent(value);
    this.didAppendBounds(bounds);
  }
  appendDynamicText(value) {
    let node = this.untrustedContent(value);
    this.didAppendNode(node);
    return node;
  }
  appendDynamicFragment(value) {
    let bounds = this.__appendFragment(value);
    this.didAppendBounds(bounds);
  }
  appendDynamicNode(value) {
    let node = this.__appendNode(value);
    let bounds = new ConcreteBounds(this.element, node, node);
    this.didAppendBounds(bounds);
  }
  trustedContent(value) {
    return this.__appendHTML(value);
  }
  untrustedContent(value) {
    return this.__appendText(value);
  }
  appendComment(string) {
    return this.didAppendNode(this.__appendComment(string));
  }
  __appendComment(string) {
    let {
      dom,
      element,
      nextSibling
    } = this;
    let node = dom.createComment(string);
    dom.insertBefore(element, node, nextSibling);
    return node;
  }
  __setAttribute(name, value, namespace) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
    this.dom.setAttribute(this.constructing, name, value, namespace);
  }
  __setProperty(name, value) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
    this.constructing[name] = value;
  }
  setStaticAttribute(name, value, namespace) {
    this.__setAttribute(name, value, namespace);
  }
  setDynamicAttribute(name, value, trusting, namespace) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
    let element = this.constructing;
    let attribute = dynamicAttribute(element, name, namespace, trusting);
    attribute.set(this, value, this.env);
    return attribute;
  }
}
class AppendingBlockImpl {
  first = null;
  last = null;
  nesting = 0;
  constructor(parent) {
    this.parent = parent;
    setLocalDebugType('block:simple', this);
  }
  parentElement() {
    return this.parent;
  }
  firstNode() {
    let first = expect(this.first);
    return first.firstNode();
  }
  lastNode() {
    let last = expect(this.last);
    return last.lastNode();
  }
  openElement(element) {
    this.didAppendNode(element);
    this.nesting++;
  }
  closeElement() {
    this.nesting--;
  }
  didAppendNode(node) {
    if (this.nesting !== 0) return;
    if (!this.first) {
      this.first = new First(node);
    }
    this.last = new Last(node);
  }
  didAppendBounds(bounds) {
    if (this.nesting !== 0) return;
    if (!this.first) {
      this.first = bounds;
    }
    this.last = bounds;
  }
  finalize(stack) {
    if (this.first === null) {
      stack.appendComment('');
    }
  }
}
class RemoteBlock extends AppendingBlockImpl {
  constructor(parent) {
    super(parent);
    setLocalDebugType('block:remote', this);
    registerDestructor(this, () => {
      // In general, you only need to clear the root of a hierarchy, and should never
      // need to clear any child nodes. This is an important constraint that gives us
      // a strong guarantee that clearing a subtree is a single DOM operation.
      //
      // Because remote blocks are not normally physically nested inside of the tree
      // that they are logically nested inside, we manually clear remote blocks when
      // a logical parent is cleared.
      //
      // HOWEVER, it is currently possible for a remote block to be physically nested
      // inside of the block it is logically contained inside of. This happens when
      // the remote block is appended to the end of the application's entire element.
      //
      // The problem with that scenario is that Glimmer believes that it owns more of
      // the DOM than it actually does. The code is attempting to write past the end
      // of the Glimmer-managed root, but Glimmer isn't aware of that.
      //
      // The correct solution to that problem is for Glimmer to be aware of the end
      // of the bounds that it owns, and once we make that change, this check could
      // be removed.
      //
      // For now, a more targeted fix is to check whether the node was already removed
      // and avoid clearing the node if it was. In most cases this shouldn't happen,
      // so this might hide bugs where the code clears nested nodes unnecessarily,
      // so we should eventually try to do the correct fix.
      if (this.parentElement() === this.firstNode().parentNode) {
        clear(this);
      }
    });
  }
}
class ResettableBlockImpl extends AppendingBlockImpl {
  constructor(parent) {
    super(parent);
    setLocalDebugType('block:resettable', this);
  }
  reset() {
    destroy(this);
    let nextSibling = clear(this);
    this.first = null;
    this.last = null;
    this.nesting = 0;
    return nextSibling;
  }
}

// FIXME: All the noops in here indicate a modelling problem
class AppendingBlockList {
  constructor(parent, boundList) {
    this.parent = parent;
    this.boundList = boundList;
    this.parent = parent;
    this.boundList = boundList;
  }
  parentElement() {
    return this.parent;
  }
  firstNode() {
    let head = expect(this.boundList[0]);
    return head.firstNode();
  }
  lastNode() {
    let boundList = this.boundList;
    let tail = expect(boundList[boundList.length - 1]);
    return tail.lastNode();
  }
  openElement(_element) {
  }
  closeElement() {
  }
  didAppendNode(_node) {
  }
  didAppendBounds(_bounds) {}
  finalize(_stack) {
    assert(this.boundList.length > 0);
  }
}
function clientBuilder(env, cursor) {
  return NewTreeBuilder.forInitialRender(env, cursor);
}

// http://www.w3.org/TR/html/syntax.html#html-integration-point
const SVG_INTEGRATION_POINTS = {
  foreignObject: 1,
  desc: 1,
  title: 1
};

// http://www.w3.org/TR/html/syntax.html#adjust-svg-attributes
// TODO: Adjust SVG attributes

// http://www.w3.org/TR/html/syntax.html#parsing-main-inforeign
// TODO: Adjust SVG elements

// http://www.w3.org/TR/html/syntax.html#parsing-main-inforeign
const BLACKLIST_TABLE = Object.create(null);
class DOMOperations {
  // Set by this.setupUselessElement() in constructor

  constructor(document) {
    this.document = document;
    this.setupUselessElement();
  }

  // split into separate method so that NodeDOMTreeConstruction
  // can override it.
  setupUselessElement() {
    this.uselessElement = this.document.createElement('div');
  }
  createElement(tag, context) {
    let isElementInSVGNamespace, isHTMLIntegrationPoint, isElementInMathMlNamespace, ns;
    if (context) {
      isElementInSVGNamespace = context.namespaceURI === NS_SVG || tag === 'svg';
      isElementInMathMlNamespace = context.namespaceURI === NS_MATHML || tag === 'math';
      isHTMLIntegrationPoint = !!SVG_INTEGRATION_POINTS[context.tagName];
    } else {
      isElementInSVGNamespace = tag === 'svg';
      isElementInMathMlNamespace = tag === 'math';
      isHTMLIntegrationPoint = false;
    }
    if ((isElementInMathMlNamespace || isElementInSVGNamespace) && !isHTMLIntegrationPoint) {
      // FIXME: This does not properly handle <font> with color, face, or
      // size attributes, which is also disallowed by the spec. We should fix
      // this.
      if (BLACKLIST_TABLE[tag]) {
        throw new Error(`Cannot create a ${tag} inside an SVG context`);
      }
      if (isElementInMathMlNamespace) {
        ns = NS_MATHML;
      } else {
        ns = NS_SVG;
      }
      return this.document.createElementNS(ns, tag);
    } else {
      return this.document.createElement(tag);
    }
  }
  insertBefore(parent, node, reference) {
    parent.insertBefore(node, reference);
  }
  insertHTMLBefore(parent, nextSibling, html) {
    if (html === '') {
      const comment = this.createComment('');
      parent.insertBefore(comment, nextSibling);
      return new ConcreteBounds(parent, comment, comment);
    }
    const prev = nextSibling ? nextSibling.previousSibling : parent.lastChild;
    let last;
    if (nextSibling === null) {
      parent.insertAdjacentHTML(INSERT_BEFORE_END, html);
      last = expect(parent.lastChild);
    } else if (nextSibling instanceof HTMLElement) {
      nextSibling.insertAdjacentHTML('beforebegin', html);
      last = expect(nextSibling.previousSibling);
    } else {
      // Non-element nodes do not support insertAdjacentHTML, so add an
      // element and call it on that element. Then remove the element.
      const {
        uselessElement
      } = this;
      parent.insertBefore(uselessElement, nextSibling);
      uselessElement.insertAdjacentHTML(INSERT_BEFORE_BEGIN, html);
      last = expect(uselessElement.previousSibling);
      parent.removeChild(uselessElement);
    }
    const first = expect(prev ? prev.nextSibling : parent.firstChild);
    return new ConcreteBounds(parent, first, last);
  }
  createTextNode(text) {
    return this.document.createTextNode(text);
  }
  createComment(data) {
    return this.document.createComment(data);
  }
}

class TreeConstruction extends DOMOperations {
  createElementNS(namespace, tag) {
    return this.document.createElementNS(namespace, tag);
  }
  setAttribute(element, name, value, namespace = null) {
    if (namespace) {
      element.setAttributeNS(namespace, name, value);
    } else {
      element.setAttribute(name, value);
    }
  }
}
const DOMTreeConstruction = TreeConstruction;

export { BLACKLIST_TABLE as B, COMMENT_NODE as C, DOMTreeConstruction as D, ELEMENT_NODE as E, NewTreeBuilder as N, RemoteBlock as R, SimpleDynamicAttribute as S, TEXT_NODE as T, DynamicAttribute as a, ResettableBlockImpl as b, clientBuilder as c, dynamicAttribute as d, NS_SVG as e, DOMOperations as f };
