import { u as unwrap, e as expect, c as isIndexable, S as StackImpl } from './collections-GpG8lT2g.js';
import { a as unwrapHandle } from './template-BRrQR6KS.js';
import { U as UNDEFINED_REFERENCE, c as createComputeRef, v as valueForRef, f as childRefFor, T as TRUE_REFERENCE, F as FALSE_REFERENCE, i as isConstRef, u as updateRef, a as createConstRef } from './reference-CG0yPgLy.js';
import { a as assert } from './assert-Zqc4wiAV.js';
import { P as ProgramImpl } from './program-BAh__OXZ.js';
import { t as track, U as UPDATE_TAG, o as beginTrackFrame, s as endTrackFrame } from './cache-CofLhaS4.js';
import { D as DebugRenderTreeImpl, i as isArgumentError, h as isCurriedType, d as curry, A as APPEND_OPCODES, g as check, j as resolveCurriedValue, f as reifyPositional, k as AssertFilter, V as VMArgumentsImpl, l as externs, J as JumpIfNotModifiedOpcode, B as BeginTrackFrameOpcode, m as EndTrackFrameOpcode } from './arguments-Carzx7C4.js';
import { B as BLACKLIST_TABLE, f as DOMOperations, D as DOMTreeConstruction, N as NewTreeBuilder } from './api-DzOa0Acr.js';
import { a as assign } from './object-utils-AijlD-JH.js';
import { associateDestroyableChild, _hasDestroyableChildren, destroy, destroyChildren, registerDestructor } from '../@glimmer/destroyable/index.js';
import { createIteratorRef, createIteratorItemRef } from '../@glimmer/reference/index.js';
import { r as reverse } from './array-utils-CZQxrdD3.js';
import { a as $v0, d as $pc, e as $ra, f as $fp, g as $sp, i as isLowLevelRegister } from './registers-C_W2qYHJ.js';
import { a as VM_RETURN_TO_OP, b as VM_RETURN_OP, c as VM_JUMP_OP, d as VM_INVOKE_VIRTUAL_OP, V as VM_INVOKE_STATIC_OP, e as VM_POP_FRAME_OP, f as VM_PUSH_FRAME_OP } from './vm-ops-ImHv0Wtg.js';
import { a as CURRIED_COMPONENT, b as CURRIED_HELPER } from './curried-BZnYakIg.js';
import { ah as VM_CURRY_OP, ai as VM_DYNAMIC_HELPER_OP, aj as VM_HELPER_OP, ak as VM_GET_VARIABLE_OP, al as VM_SET_VARIABLE_OP, am as VM_SET_BLOCK_OP, an as VM_ROOT_SCOPE_OP, ao as VM_GET_PROPERTY_OP, ap as VM_GET_BLOCK_OP, aq as VM_SPREAD_BLOCK_OP, ar as VM_HAS_BLOCK_OP, as as VM_HAS_BLOCK_PARAMS_OP, at as VM_CONCAT_OP, au as VM_IF_INLINE_OP, av as VM_NOT_OP, aw as VM_GET_DYNAMIC_VAR_OP, ax as VM_LOG_OP, a as VM_CONTENT_TYPE_OP, ay as VM_DYNAMIC_CONTENT_TYPE_OP, c as VM_APPEND_HTML_OP, g as VM_APPEND_SAFE_HTML_OP, d as VM_APPEND_TEXT_OP, h as VM_APPEND_DOCUMENT_FRAGMENT_OP, i as VM_APPEND_NODE_OP, az as VM_DEBUGGER_OP, p as decodeHandle, aA as VM_ENTER_LIST_OP, aB as VM_EXIT_LIST_OP, aC as VM_ITERATE_OP } from './syscall-ops-CkPT1Kfx.js';
import { toBool } from '../@glimmer/global-context/index.js';
import { a as getInternalHelperManager, c as hasInternalComponentManager, d as hasInternalHelperManager } from './api-DlJKfm_f.js';
import { ContentType } from '../@glimmer/vm/index.js';
import { b as isEmpty, d as isString, s as shouldCoerce, i as isSafeString, e as isFragment, f as isNode, m as move, c as clear } from './normalize-C_IStty9.js';

class DynamicScopeImpl {
  bucket;
  constructor(bucket) {
    if (bucket) {
      this.bucket = assign({}, bucket);
    } else {
      this.bucket = {};
    }
  }
  get(key) {
    return unwrap(this.bucket[key]);
  }
  set(key, reference) {
    return this.bucket[key] = reference;
  }
  child() {
    return new DynamicScopeImpl(this.bucket);
  }
}
class ScopeImpl {
  static root(owner, {
    self,
    size = 0
  }) {
    let refs = new Array(size + 1).fill(UNDEFINED_REFERENCE);
    return new ScopeImpl(owner, refs, null).init({
      self
    });
  }
  static sized(owner, size = 0) {
    let refs = new Array(size + 1).fill(UNDEFINED_REFERENCE);
    return new ScopeImpl(owner, refs, null);
  }
  owner;
  slots;
  callerScope;
  constructor(owner,
  // the 0th slot is `self`
  slots,
  // a single program can mix owners via curried components, and the state lives on root scopes
  callerScope) {
    this.owner = owner;
    this.slots = slots;
    this.callerScope = callerScope;
  }
  init({
    self
  }) {
    this.slots[0] = self;
    return this;
  }

  /**
   * @debug
   */
  snapshot() {
    return this.slots.slice();
  }
  getSelf() {
    return this.get(0);
  }
  getSymbol(symbol) {
    return this.get(symbol);
  }
  getBlock(symbol) {
    let block = this.get(symbol);
    return block === UNDEFINED_REFERENCE ? null : block;
  }
  bind(symbol, value) {
    this.set(symbol, value);
  }
  bindSelf(self) {
    this.set(0, self);
  }
  bindSymbol(symbol, value) {
    this.set(symbol, value);
  }
  bindBlock(symbol, value) {
    this.set(symbol, value);
  }
  bindCallerScope(scope) {
    this.callerScope = scope;
  }
  getCallerScope() {
    return this.callerScope;
  }
  child() {
    return new ScopeImpl(this.owner, this.slots.slice(), this.callerScope);
  }
  get(index) {
    if (index >= this.slots.length) {
      throw new RangeError(`BUG: cannot get $${index} from scope; length=${this.slots.length}`);
    }
    return this.slots[index];
  }
  set(index, value) {
    if (index >= this.slots.length) {
      throw new RangeError(`BUG: cannot get $${index} from scope; length=${this.slots.length}`);
    }
    this.slots[index] = value;
  }
}

['b', 'big', 'blockquote', 'body', 'br', 'center', 'code', 'dd', 'div', 'dl', 'dt', 'em', 'embed', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'hr', 'i', 'img', 'li', 'listing', 'main', 'meta', 'nobr', 'ol', 'p', 'pre', 'ruby', 's', 'small', 'span', 'strong', 'strike', 'sub', 'sup', 'table', 'tt', 'u', 'ul', 'var'].forEach(tag => BLACKLIST_TABLE[tag] = 1);
const WHITESPACE = /[\t\n\v\f\r \xa0\u{1680}\u{180e}\u{2000}-\u{200a}\u{2028}\u{2029}\u{202f}\u{205f}\u{3000}\u{feff}]/u;
function isWhitespace(string) {
  return WHITESPACE.test(string);
}
class DOMChangesImpl extends DOMOperations {
  namespace;
  constructor(document) {
    super(document);
    this.document = document;
    this.namespace = null;
  }
  setAttribute(element, name, value) {
    element.setAttribute(name, value);
  }
  removeAttribute(element, name) {
    element.removeAttribute(name);
  }
  insertAfter(element, node, reference) {
    this.insertBefore(element, node, reference.nextSibling);
  }
}
const DOMChanges = DOMChangesImpl;

const TRANSACTION = Symbol('TRANSACTION');
class TransactionImpl {
  scheduledInstallModifiers = [];
  scheduledUpdateModifiers = [];
  createdComponents = [];
  updatedComponents = [];
  didCreate(component) {
    this.createdComponents.push(component);
  }
  didUpdate(component) {
    this.updatedComponents.push(component);
  }
  scheduleInstallModifier(modifier) {
    this.scheduledInstallModifiers.push(modifier);
  }
  scheduleUpdateModifier(modifier) {
    this.scheduledUpdateModifiers.push(modifier);
  }
  commit() {
    let {
      createdComponents,
      updatedComponents
    } = this;
    for (const {
      manager,
      state
    } of createdComponents) {
      manager.didCreate(state);
    }
    for (const {
      manager,
      state
    } of updatedComponents) {
      manager.didUpdate(state);
    }
    let {
      scheduledInstallModifiers,
      scheduledUpdateModifiers
    } = this;
    for (const {
      manager,
      state,
      definition
    } of scheduledInstallModifiers) {
      let modifierTag = manager.getTag(state);
      if (modifierTag !== null) {
        let tag = track(() => manager.install(state));
        UPDATE_TAG(modifierTag, tag);
      } else {
        manager.install(state);
      }
    }
    for (const {
      manager,
      state,
      definition
    } of scheduledUpdateModifiers) {
      let modifierTag = manager.getTag(state);
      if (modifierTag !== null) {
        let tag = track(() => manager.update(state));
        UPDATE_TAG(modifierTag, tag);
      } else {
        manager.update(state);
      }
    }
  }
}
class EnvironmentImpl {
  [TRANSACTION] = null;
  updateOperations;

  // Delegate methods and values
  isInteractive;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isArgumentCaptureError;
  debugRenderTree;
  constructor(options, delegate) {
    this.delegate = delegate;
    this.isInteractive = delegate.isInteractive;
    this.debugRenderTree = this.delegate.enableDebugTooling ? new DebugRenderTreeImpl() : undefined;
    this.isArgumentCaptureError = this.delegate.enableDebugTooling ? isArgumentError : undefined;
    if (options.appendOperations) {
      this.appendOperations = options.appendOperations;
      this.updateOperations = options.updateOperations;
    } else if (options.document) {
      this.appendOperations = new DOMTreeConstruction(options.document);
      this.updateOperations = new DOMChangesImpl(options.document);
    } else ;
  }
  getAppendOperations() {
    return this.appendOperations;
  }
  getDOM() {
    return expect(this.updateOperations);
  }
  begin() {
    assert(!this[TRANSACTION]);
    this.debugRenderTree?.begin();
    this[TRANSACTION] = new TransactionImpl();
  }
  get transaction() {
    return expect(this[TRANSACTION]);
  }
  didCreate(component) {
    this.transaction.didCreate(component);
  }
  didUpdate(component) {
    this.transaction.didUpdate(component);
  }
  scheduleInstallModifier(modifier) {
    if (this.isInteractive) {
      this.transaction.scheduleInstallModifier(modifier);
    }
  }
  scheduleUpdateModifier(modifier) {
    if (this.isInteractive) {
      this.transaction.scheduleUpdateModifier(modifier);
    }
  }
  commit() {
    let transaction = this.transaction;
    this[TRANSACTION] = null;
    transaction.commit();
    this.debugRenderTree?.commit();
    this.delegate.onTransactionCommit();
  }
}
function runtimeOptions(options, delegate, artifacts, resolver) {
  return {
    env: new EnvironmentImpl(options, delegate),
    program: new ProgramImpl(artifacts.constants, artifacts.heap),
    resolver
  };
}
function inTransaction(env, block) {
  if (!env[TRANSACTION]) {
    env.begin();
    try {
      block();
    } finally {
      env.commit();
    }
  } else {
    block();
  }
}

function createCurryRef(type, inner, owner, args, resolver, isStrict) {
  let lastValue, curriedDefinition;
  return createComputeRef(() => {
    let value = valueForRef(inner);
    if (value === lastValue) {
      return curriedDefinition;
    }
    if (isCurriedType(value, type)) {
      curriedDefinition = args ? curry(type, value, owner, args) : args;
    } else if (type === CURRIED_COMPONENT && typeof value === 'string' && value) {
      curriedDefinition = curry(type, value, owner, args);
    } else if (isIndexable(value)) {
      curriedDefinition = curry(type, value, owner, args);
    } else {
      curriedDefinition = null;
    }
    lastValue = value;
    return curriedDefinition;
  });
}

function createConcatRef(partsRefs) {
  return createComputeRef(() => {
    const parts = [];
    for (const ref of partsRefs) {
      const value = valueForRef(ref);
      if (value !== null && value !== undefined) {
        parts.push(castToString(value));
      }
    }
    if (parts.length > 0) {
      return parts.join('');
    }
    return null;
  });
}
function castToString(value) {
  if (typeof value === 'string') {
    return value;
  } else if (typeof value.toString !== 'function') {
    return '';
  }

  // eslint-disable-next-line @typescript-eslint/no-base-to-string -- @fixme
  return String(value);
}

APPEND_OPCODES.add(VM_CURRY_OP, (vm, {
  op1: type,
  op2: _isStrict
}) => {
  let stack = vm.stack;
  let definition = check(stack.pop());
  let capturedArgs = check(stack.pop());
  let owner = vm.getOwner();
  vm.context.resolver;
  vm.loadValue($v0, createCurryRef(type, definition, owner, capturedArgs));
});
APPEND_OPCODES.add(VM_DYNAMIC_HELPER_OP, vm => {
  let stack = vm.stack;
  let ref = check(stack.pop());
  let args = check(stack.pop()).capture();
  let helperRef;
  let initialOwner = vm.getOwner();
  let helperInstanceRef = createComputeRef(() => {
    if (helperRef !== undefined) {
      destroy(helperRef);
    }
    let definition = valueForRef(ref);
    if (isCurriedType(definition, CURRIED_HELPER)) {
      let {
        definition: resolvedDef,
        owner,
        positional,
        named
      } = resolveCurriedValue(definition);
      let helper = resolveHelper(resolvedDef);
      if (named !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        args.named = assign({}, ...named, args.named);
      }
      if (positional !== undefined) {
        args.positional = positional.concat(args.positional);
      }
      helperRef = helper(args, owner);
      associateDestroyableChild(helperInstanceRef, helperRef);
    } else if (isIndexable(definition)) {
      let helper = resolveHelper(definition);
      helperRef = helper(args, initialOwner);
      if (_hasDestroyableChildren(helperRef)) {
        associateDestroyableChild(helperInstanceRef, helperRef);
      }
    } else {
      helperRef = UNDEFINED_REFERENCE;
    }
  });
  let helperValueRef = createComputeRef(() => {
    valueForRef(helperInstanceRef);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
    return valueForRef(helperRef);
  });
  vm.associateDestroyable(helperInstanceRef);
  vm.loadValue($v0, helperValueRef);
});
function resolveHelper(definition, ref) {
  let managerOrHelper = getInternalHelperManager(definition, true);
  let helper;
  if (managerOrHelper === null) {
    helper = null;
  } else {
    helper = typeof managerOrHelper === 'function' ? managerOrHelper : managerOrHelper.getHelper(definition);
  }
  return helper;
}
APPEND_OPCODES.add(VM_HELPER_OP, (vm, {
  op1: handle
}) => {
  let stack = vm.stack;
  let helper = check(vm.constants.getValue(handle));
  let args = check(stack.pop());
  let value = helper(args.capture(), vm.getOwner(), vm.dynamicScope());
  if (_hasDestroyableChildren(value)) {
    vm.associateDestroyable(value);
  }
  vm.loadValue($v0, value);
});
APPEND_OPCODES.add(VM_GET_VARIABLE_OP, (vm, {
  op1: symbol
}) => {
  let expr = vm.referenceForSymbol(symbol);
  vm.stack.push(expr);
});
APPEND_OPCODES.add(VM_SET_VARIABLE_OP, (vm, {
  op1: symbol
}) => {
  let expr = check(vm.stack.pop());
  vm.scope().bindSymbol(symbol, expr);
});
APPEND_OPCODES.add(VM_SET_BLOCK_OP, (vm, {
  op1: symbol
}) => {
  let handle = check(vm.stack.pop());
  let scope = check(vm.stack.pop());
  let table = check(vm.stack.pop());
  vm.scope().bindBlock(symbol, [handle, scope, table]);
});
APPEND_OPCODES.add(VM_ROOT_SCOPE_OP, (vm, {
  op1: size
}) => {
  vm.pushRootScope(size, vm.getOwner());
});
APPEND_OPCODES.add(VM_GET_PROPERTY_OP, (vm, {
  op1: _key
}) => {
  let key = vm.constants.getValue(_key);
  let expr = check(vm.stack.pop());
  vm.stack.push(childRefFor(expr, key));
});
APPEND_OPCODES.add(VM_GET_BLOCK_OP, (vm, {
  op1: _block
}) => {
  let {
    stack
  } = vm;
  let block = vm.scope().getBlock(_block);
  stack.push(block);
});
APPEND_OPCODES.add(VM_SPREAD_BLOCK_OP, vm => {
  let {
    stack
  } = vm;
  let block = check(stack.pop());
  if (block && !isUndefinedReference(block)) {
    let [handleOrCompilable, scope, table] = block;
    stack.push(table);
    stack.push(scope);
    stack.push(handleOrCompilable);
  } else {
    stack.push(null);
    stack.push(null);
    stack.push(null);
  }
});
function isUndefinedReference(input) {
  return input === UNDEFINED_REFERENCE;
}
APPEND_OPCODES.add(VM_HAS_BLOCK_OP, vm => {
  let {
    stack
  } = vm;
  let block = check(stack.pop());
  if (block && !isUndefinedReference(block)) {
    stack.push(TRUE_REFERENCE);
  } else {
    stack.push(FALSE_REFERENCE);
  }
});
APPEND_OPCODES.add(VM_HAS_BLOCK_PARAMS_OP, vm => {
  // FIXME(mmun): should only need to push the symbol table
  vm.stack.pop();
  vm.stack.pop();
  let table = check(vm.stack.pop());
  let hasBlockParams = table && table.parameters.length;
  vm.stack.push(hasBlockParams ? TRUE_REFERENCE : FALSE_REFERENCE);
});
APPEND_OPCODES.add(VM_CONCAT_OP, (vm, {
  op1: count
}) => {
  let out = new Array(count);
  for (let i = count; i > 0; i--) {
    let offset = i - 1;
    out[offset] = check(vm.stack.pop());
  }
  vm.stack.push(createConcatRef(out));
});
APPEND_OPCODES.add(VM_IF_INLINE_OP, vm => {
  let condition = check(vm.stack.pop());
  let truthy = check(vm.stack.pop());
  let falsy = check(vm.stack.pop());
  vm.stack.push(createComputeRef(() => {
    if (toBool(valueForRef(condition))) {
      return valueForRef(truthy);
    } else {
      return valueForRef(falsy);
    }
  }));
});
APPEND_OPCODES.add(VM_NOT_OP, vm => {
  let ref = check(vm.stack.pop());
  vm.stack.push(createComputeRef(() => {
    return !toBool(valueForRef(ref));
  }));
});
APPEND_OPCODES.add(VM_GET_DYNAMIC_VAR_OP, vm => {
  let scope = vm.dynamicScope();
  let stack = vm.stack;
  let nameRef = check(stack.pop());
  stack.push(createComputeRef(() => {
    let name = String(valueForRef(nameRef));
    return valueForRef(scope.get(name));
  }));
});
APPEND_OPCODES.add(VM_LOG_OP, vm => {
  let {
    positional
  } = check(vm.stack.pop()).capture();
  vm.loadValue($v0, createComputeRef(() => {
    // eslint-disable-next-line no-console
    console.log(...reifyPositional(positional));
  }));
});

class DynamicTextContent {
  constructor(node, reference, lastValue) {
    this.node = node;
    this.reference = reference;
    this.lastValue = lastValue;
  }
  evaluate() {
    let value = valueForRef(this.reference);
    let {
      lastValue
    } = this;
    if (value === lastValue) return;
    let normalized;
    if (isEmpty(value)) {
      normalized = '';
    } else if (isString(value)) {
      normalized = value;
    } else {
      normalized = String(value);
    }
    if (normalized !== lastValue) {
      let textNode = this.node;
      textNode.nodeValue = this.lastValue = normalized;
    }
  }
}

function toContentType(value) {
  if (shouldCoerce(value)) {
    return ContentType.String;
  } else if (isCurriedType(value, CURRIED_COMPONENT) || hasInternalComponentManager(value)) {
    return ContentType.Component;
  } else if (isCurriedType(value, CURRIED_HELPER) || hasInternalHelperManager(value)) {
    return ContentType.Helper;
  } else if (isSafeString(value)) {
    return ContentType.SafeString;
  } else if (isFragment(value)) {
    return ContentType.Fragment;
  } else if (isNode(value)) {
    return ContentType.Node;
  } else {
    return ContentType.String;
  }
}
function toDynamicContentType(value) {
  if (!isIndexable(value)) {
    return ContentType.String;
  }
  if (isCurriedType(value, CURRIED_COMPONENT) || hasInternalComponentManager(value)) {
    return ContentType.Component;
  } else {
    return ContentType.Helper;
  }
}
APPEND_OPCODES.add(VM_CONTENT_TYPE_OP, vm => {
  let reference = check(vm.stack.peek());
  vm.stack.push(toContentType(valueForRef(reference)));
  if (!isConstRef(reference)) {
    vm.updateWith(new AssertFilter(reference, toContentType));
  }
});
APPEND_OPCODES.add(VM_DYNAMIC_CONTENT_TYPE_OP, vm => {
  let reference = check(vm.stack.peek());
  vm.stack.push(toDynamicContentType(valueForRef(reference)));
  if (!isConstRef(reference)) {
    vm.updateWith(new AssertFilter(reference, toDynamicContentType));
  }
});
APPEND_OPCODES.add(VM_APPEND_HTML_OP, vm => {
  let reference = check(vm.stack.pop());
  let rawValue = valueForRef(reference);
  let value = isEmpty(rawValue) ? '' : String(rawValue);
  vm.tree().appendDynamicHTML(value);
});
APPEND_OPCODES.add(VM_APPEND_SAFE_HTML_OP, vm => {
  let reference = check(vm.stack.pop());
  let rawValue = check(valueForRef(reference)).toHTML();
  let value = isEmpty(rawValue) ? '' : check(rawValue);
  vm.tree().appendDynamicHTML(value);
});
APPEND_OPCODES.add(VM_APPEND_TEXT_OP, vm => {
  let reference = check(vm.stack.pop());
  let rawValue = valueForRef(reference);
  let value = isEmpty(rawValue) ? '' : String(rawValue);
  let node = vm.tree().appendDynamicText(value);
  if (!isConstRef(reference)) {
    vm.updateWith(new DynamicTextContent(node, reference, value));
  }
});
APPEND_OPCODES.add(VM_APPEND_DOCUMENT_FRAGMENT_OP, vm => {
  let reference = check(vm.stack.pop());
  let value = check(valueForRef(reference));
  vm.tree().appendDynamicFragment(value);
});
APPEND_OPCODES.add(VM_APPEND_NODE_OP, vm => {
  let reference = check(vm.stack.pop());
  let value = check(valueForRef(reference));
  vm.tree().appendDynamicNode(value);
});

// Allow the contents of `debugCallback` without extra annotations
/* eslint-disable @typescript-eslint/no-unused-expressions */

function debugCallback(context, get) {
  if (context !== null && context !== undefined) {
    // eslint-disable-next-line no-console
    console.info("Use `context`, and `get(<path>)` to debug this template. For named arguments, use `get('@argName')`.");

    // for example...
    context === get('this');
  } else {
    // eslint-disable-next-line no-console
    console.info("Use `get(<path>)` to debug this template. For named arguments, use `get('@argName')`.");
  }

  // eslint-disable-next-line no-debugger
  debugger;
}
let callback = debugCallback;

// For testing purposes
function setDebuggerCallback(cb) {
  callback = cb;
}
function resetDebuggerCallback() {
  callback = debugCallback;
}
class ScopeInspector {
  #symbols;
  constructor(scope, symbols) {
    this.scope = scope;
    this.#symbols = symbols;
  }
  get(path) {
    let {
      scope
    } = this;
    let symbols = this.#symbols;
    let parts = path.split('.');
    let [head, ...tail] = path.split('.');
    let ref;
    if (head === 'this') {
      ref = scope.getSelf();
    } else if (symbols.locals[head]) {
      ref = unwrap(scope.getSymbol(symbols.locals[head]));
    } else {
      ref = this.scope.getSelf();
      tail = parts;
    }
    return tail.reduce((r, part) => childRefFor(r, part), ref);
  }
}
APPEND_OPCODES.add(VM_DEBUGGER_OP, (vm, {
  op1: _debugInfo
}) => {
  let debuggerInfo = vm.constants.getValue(decodeHandle(_debugInfo));
  let inspector = new ScopeInspector(vm.scope(), debuggerInfo);
  callback(valueForRef(vm.getSelf()), path => valueForRef(inspector.get(path)));
});

APPEND_OPCODES.add(VM_ENTER_LIST_OP, (vm, {
  op1: relativeStart,
  op2: elseTarget
}) => {
  let stack = vm.stack;
  let listRef = check(stack.pop());
  let keyRef = check(stack.pop());
  let keyValue = valueForRef(keyRef);
  // eslint-disable-next-line @typescript-eslint/no-base-to-string -- @fixme
  let key = keyValue === null ? '@identity' : String(keyValue);
  let iteratorRef = createIteratorRef(listRef, key);
  let iterator = valueForRef(iteratorRef);
  vm.updateWith(new AssertFilter(iteratorRef, iterator => iterator.isEmpty()));
  if (iterator.isEmpty()) {
    // TODO: Fix this offset, should be accurate
    vm.lowlevel.goto(elseTarget + 1);
  } else {
    vm.enterList(iteratorRef, relativeStart);
    vm.stack.push(iterator);
  }
});
APPEND_OPCODES.add(VM_EXIT_LIST_OP, vm => {
  vm.exitList();
});
APPEND_OPCODES.add(VM_ITERATE_OP, (vm, {
  op1: breaks
}) => {
  let stack = vm.stack;
  let iterator = check(stack.peek());
  let item = iterator.next();
  if (item !== null) {
    vm.registerItem(vm.enterItem(item));
  } else {
    vm.lowlevel.goto(breaks);
  }
});

function initializeRegistersWithSP(sp) {
  return [0, -1, sp, 0];
}
class LowLevelVM {
  currentOpSize = 0;
  registers;
  context;
  constructor(stack, context, externs, registers) {
    this.stack = stack;
    this.externs = externs;
    this.context = context;
    this.registers = registers;
  }
  fetchRegister(register) {
    return this.registers[register];
  }
  loadRegister(register, value) {
    this.registers[register] = value;
  }
  setPc(pc) {
    this.registers[$pc] = pc;
  }

  // Start a new frame and save $ra and $fp on the stack
  pushFrame() {
    this.stack.push(this.registers[$ra]);
    this.stack.push(this.registers[$fp]);
    this.registers[$fp] = this.registers[$sp] - 1;
  }

  // Restore $ra, $sp and $fp
  popFrame() {
    this.registers[$sp] = this.registers[$fp] - 1;
    this.registers[$ra] = this.stack.get(0);
    this.registers[$fp] = this.stack.get(1);
  }
  pushSmallFrame() {
    this.stack.push(this.registers[$ra]);
  }
  popSmallFrame() {
    this.registers[$ra] = this.stack.pop();
  }

  // Jump to an address in `program`
  goto(offset) {
    this.setPc(this.target(offset));
  }
  target(offset) {
    return this.registers[$pc] + offset - this.currentOpSize;
  }

  // Save $pc into $ra, then jump to a new address in `program` (jal in MIPS)
  call(handle) {
    this.registers[$ra] = this.registers[$pc];
    this.setPc(this.context.program.heap.getaddr(handle));
  }

  // Put a specific `program` address in $ra
  returnTo(offset) {
    this.registers[$ra] = this.target(offset);
  }

  // Return to the `program` address stored in $ra
  return() {
    this.setPc(this.registers[$ra]);
  }
  nextStatement() {
    let {
      registers,
      context
    } = this;
    let pc = registers[$pc];
    if (pc === -1) {
      return null;
    }

    // We have to save off the current operations size so that
    // when we do a jump we can calculate the correct offset
    // to where we are going. We can't simply ask for the size
    // in a jump because we have have already incremented the
    // program counter to the next instruction prior to executing.
    let opcode = context.program.opcode(pc);
    let operationSize = this.currentOpSize = opcode.size;
    this.registers[$pc] += operationSize;
    return opcode;
  }
  evaluateOuter(opcode, vm) {
    {
      this.evaluateInner(opcode, vm);
    }
  }
  evaluateInner(opcode, vm) {
    if (opcode.isMachine) {
      this.evaluateMachine(opcode, vm);
    } else {
      this.evaluateSyscall(opcode, vm);
    }
  }
  evaluateMachine(opcode, vm) {
    switch (opcode.type) {
      case VM_PUSH_FRAME_OP:
        return void this.pushFrame();
      case VM_POP_FRAME_OP:
        return void this.popFrame();
      case VM_INVOKE_STATIC_OP:
        return void this.call(opcode.op1);
      case VM_INVOKE_VIRTUAL_OP:
        return void vm.call(this.stack.pop());
      case VM_JUMP_OP:
        return void this.goto(opcode.op1);
      case VM_RETURN_OP:
        return void vm.return();
      case VM_RETURN_TO_OP:
        return void this.returnTo(opcode.op1);
    }
  }
  evaluateSyscall(opcode, vm) {
    APPEND_OPCODES.evaluate(vm, opcode, opcode.type);
  }
}

class UpdatingVM {
  env;
  dom;
  alwaysRevalidate;
  frameStack = new StackImpl();
  constructor(env, {
    alwaysRevalidate = false
  }) {
    this.env = env;
    this.dom = env.getDOM();
    this.alwaysRevalidate = alwaysRevalidate;
  }
  execute(opcodes, handler) {
    {
      this._execute(opcodes, handler);
    }
  }
  _execute(opcodes, handler) {
    let {
      frameStack
    } = this;
    this.try(opcodes, handler);
    while (!frameStack.isEmpty()) {
      let opcode = this.frame.nextStatement();
      if (opcode === undefined) {
        frameStack.pop();
        continue;
      }
      opcode.evaluate(this);
    }
  }
  get frame() {
    return expect(this.frameStack.current);
  }
  goto(index) {
    this.frame.goto(index);
  }
  try(ops, handler) {
    this.frameStack.push(new UpdatingVMFrame(ops, handler));
  }
  throw() {
    this.frame.handleException();
    this.frameStack.pop();
  }
}
class BlockOpcode {
  children;
  bounds;
  constructor(state, context, bounds, children) {
    this.state = state;
    this.context = context;
    this.children = children;
    this.bounds = bounds;
  }
  parentElement() {
    return this.bounds.parentElement();
  }
  firstNode() {
    return this.bounds.firstNode();
  }
  lastNode() {
    return this.bounds.lastNode();
  }
  evaluate(vm) {
    vm.try(this.children, null);
  }
}
class TryOpcode extends BlockOpcode {
  type = 'try';
  // Shadows property on base class

  evaluate(vm) {
    vm.try(this.children, this);
  }
  handleException() {
    let {
      state,
      bounds,
      context: {
        env
      }
    } = this;
    destroyChildren(this);
    let tree = NewTreeBuilder.resume(env, bounds);
    let vm = state.evaluate(tree);
    let children = this.children = [];
    let result = vm.execute(vm => {
      vm.updateWith(this);
      vm.pushUpdating(children);
    });
    associateDestroyableChild(this, result.drop);
  }
}
class ListItemOpcode extends TryOpcode {
  retained = false;
  index = -1;
  constructor(state, context, bounds, key, memo, value) {
    super(state, context, bounds, []);
    this.key = key;
    this.memo = memo;
    this.value = value;
  }
  shouldRemove() {
    return !this.retained;
  }
  reset() {
    this.retained = false;
  }
}
class ListBlockOpcode extends BlockOpcode {
  type = 'list-block';
  opcodeMap = new Map();
  marker = null;
  lastIterator;
  constructor(state, context, bounds, children, iterableRef) {
    super(state, context, bounds, children);
    this.iterableRef = iterableRef;
    this.lastIterator = valueForRef(iterableRef);
  }
  initializeChild(opcode) {
    opcode.index = this.children.length - 1;
    this.opcodeMap.set(opcode.key, opcode);
  }
  evaluate(vm) {
    let iterator = valueForRef(this.iterableRef);
    if (this.lastIterator !== iterator) {
      let {
        bounds
      } = this;
      let {
        dom
      } = vm;
      let marker = this.marker = dom.createComment('');
      dom.insertAfter(bounds.parentElement(), marker, expect(bounds.lastNode()));
      this.sync(iterator);
      this.parentElement().removeChild(marker);
      this.marker = null;
      this.lastIterator = iterator;
    }

    // Run now-updated updating opcodes
    super.evaluate(vm);
  }
  sync(iterator) {
    let {
      opcodeMap: itemMap,
      children
    } = this;
    let currentOpcodeIndex = 0;
    let seenIndex = 0;
    this.children = this.bounds.boundList = [];
    while (true) {
      let item = iterator.next();
      if (item === null) break;
      let opcode = children[currentOpcodeIndex];
      let {
        key
      } = item;

      // Items that have already been found and moved will already be retained,
      // we can continue until we find the next unretained item
      while (opcode !== undefined && opcode.retained) {
        opcode = children[++currentOpcodeIndex];
      }
      if (opcode !== undefined && opcode.key === key) {
        this.retainItem(opcode, item);
        currentOpcodeIndex++;
      } else if (itemMap.has(key)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
        let itemOpcode = itemMap.get(key);

        // The item opcode was seen already, so we should move it.
        if (itemOpcode.index < seenIndex) {
          this.moveItem(itemOpcode, item, opcode);
        } else {
          // Update the seen index, we are going to be moving this item around
          // so any other items that come before it will likely need to move as
          // well.
          seenIndex = itemOpcode.index;
          let seenUnretained = false;

          // iterate through all of the opcodes between the current position and
          // the position of the item's opcode, and determine if they are all
          // retained.
          for (let i = currentOpcodeIndex + 1; i < seenIndex; i++) {
            if (!unwrap(children[i]).retained) {
              seenUnretained = true;
              break;
            }
          }

          // If we have seen only retained opcodes between this and the matching
          // opcode, it means that all the opcodes in between have been moved
          // already, and we can safely retain this item's opcode.
          if (!seenUnretained) {
            this.retainItem(itemOpcode, item);
            currentOpcodeIndex = seenIndex + 1;
          } else {
            this.moveItem(itemOpcode, item, opcode);
            currentOpcodeIndex++;
          }
        }
      } else {
        this.insertItem(item, opcode);
      }
    }
    for (const opcode of children) {
      if (!opcode.retained) {
        this.deleteItem(opcode);
      } else {
        opcode.reset();
      }
    }
  }
  retainItem(opcode, item) {
    let {
      children
    } = this;
    updateRef(opcode.memo, item.memo);
    updateRef(opcode.value, item.value);
    opcode.retained = true;
    opcode.index = children.length;
    children.push(opcode);
  }
  insertItem(item, before) {
    let {
      opcodeMap,
      bounds,
      state,
      children,
      context: {
        env
      }
    } = this;
    let {
      key
    } = item;
    let nextSibling = before === undefined ? this.marker : before.firstNode();
    let elementStack = NewTreeBuilder.forInitialRender(env, {
      element: bounds.parentElement(),
      nextSibling
    });
    let vm = state.evaluate(elementStack);
    vm.execute(vm => {
      let opcode = vm.enterItem(item);
      opcode.index = children.length;
      children.push(opcode);
      opcodeMap.set(key, opcode);
      associateDestroyableChild(this, opcode);
    });
  }
  moveItem(opcode, item, before) {
    let {
      children
    } = this;
    updateRef(opcode.memo, item.memo);
    updateRef(opcode.value, item.value);
    opcode.retained = true;
    let currentSibling, nextSibling;
    if (before === undefined) {
      move(opcode, this.marker);
    } else {
      currentSibling = opcode.lastNode().nextSibling;
      nextSibling = before.firstNode();

      // Items are moved throughout the algorithm, so there are cases where the
      // the items already happen to be siblings (e.g. an item in between was
      // moved before this move happened). Check to see if they are siblings
      // first before doing the move.
      if (currentSibling !== nextSibling) {
        move(opcode, nextSibling);
      }
    }
    opcode.index = children.length;
    children.push(opcode);
  }
  deleteItem(opcode) {
    destroy(opcode);
    clear(opcode);
    this.opcodeMap.delete(opcode.key);
  }
}
class UpdatingVMFrame {
  current = 0;
  constructor(ops, exceptionHandler) {
    this.ops = ops;
    this.exceptionHandler = exceptionHandler;
  }
  goto(index) {
    this.current = index;
  }
  nextStatement() {
    return this.ops[this.current++];
  }
  handleException() {
    if (this.exceptionHandler) {
      this.exceptionHandler.handleException();
    }
  }
}

class RenderResultImpl {
  constructor(env, updating, bounds, drop) {
    this.env = env;
    this.updating = updating;
    this.bounds = bounds;
    this.drop = drop;
    associateDestroyableChild(this, drop);
    registerDestructor(this, () => clear(this.bounds));
  }
  rerender({
    alwaysRevalidate = false
  } = {
    alwaysRevalidate: false
  }) {
    let {
      env,
      updating
    } = this;
    let vm = new UpdatingVM(env, {
      alwaysRevalidate
    });
    vm.execute(updating, this);
  }
  parentElement() {
    return this.bounds.parentElement();
  }
  firstNode() {
    return this.bounds.firstNode();
  }
  lastNode() {
    return this.bounds.lastNode();
  }
  handleException() {
  }
}

class EvaluationStackImpl {
  static restore(snapshot, pc) {
    const stack = new this(snapshot.slice(), initializeRegistersWithSP(snapshot.length - 1));
    stack.registers[$pc] = pc;
    stack.registers[$sp] = snapshot.length - 1;
    stack.registers[$fp] = -1;
    return stack;
  }
  registers;

  // fp -> sp
  constructor(stack = [], registers) {
    this.stack = stack;
    this.registers = registers;
  }
  push(value) {
    this.stack[++this.registers[$sp]] = value;
  }
  dup(position = this.registers[$sp]) {
    this.stack[++this.registers[$sp]] = this.stack[position];
  }
  copy(from, to) {
    this.stack[to] = this.stack[from];
  }
  pop(n = 1) {
    let top = this.stack[this.registers[$sp]];
    this.registers[$sp] -= n;
    return top;
  }
  peek(offset = 0) {
    return this.stack[this.registers[$sp] - offset];
  }
  get(offset, base = this.registers[$fp]) {
    return this.stack[base + offset];
  }
  set(value, offset, base = this.registers[$fp]) {
    this.stack[base + offset] = value;
  }
  slice(start, end) {
    return this.stack.slice(start, end);
  }
  capture(items) {
    let end = this.registers[$sp] + 1;
    let start = end - items;
    return this.stack.slice(start, end);
  }
  reset() {
    this.stack.length = 0;
  }
  static {
  }
}

class Stacks {
  drop = {};
  scope = new StackImpl();
  dynamicScope = new StackImpl();
  updating = new StackImpl();
  cache = new StackImpl();
  list = new StackImpl();
  destroyable = new StackImpl();
  constructor(scope, dynamicScope) {
    this.scope.push(scope);
    this.dynamicScope.push(dynamicScope);
    this.destroyable.push(this.drop);
  }
}
class VM {
  #stacks;
  args;
  lowlevel;
  debug;
  trace;
  get stack() {
    return this.lowlevel.stack;
  }

  /* Registers */

  get pc() {
    return this.lowlevel.fetchRegister($pc);
  }
  #registers = [null, null, null, null, null, null, null, null, null];

  /**
   * Fetch a value from a syscall register onto the stack.
   *
   * ## Opcodes
   *
   * - Append: `Fetch`
   *
   * ## State changes
   *
   * [!] push Eval Stack <- $register
   */
  fetch(register) {
    let value = this.fetchValue(register);
    this.stack.push(value);
  }

  /**
   * Load a value from the stack into a syscall register.
   *
   * ## Opcodes
   *
   * - Append: `Load`
   *
   * ## State changes
   *
   * [!] pop Eval Stack -> `value`
   * [$] $register <- `value`
   */
  load(register) {
    let value = this.stack.pop();
    this.loadValue(register, value);
  }

  /**
   * Load a value into a syscall register.
   *
   * ## State changes
   *
   * [$] $register <- `value`
   *
   * @utility
   */
  loadValue(register, value) {
    this.#registers[register] = value;
  }

  /**
   * Fetch a value from a register (machine or syscall).
   *
   * ## State changes
   *
   * [ ] get $register
   *
   * @utility
   */

  fetchValue(register) {
    if (isLowLevelRegister(register)) {
      return this.lowlevel.fetchRegister(register);
    }
    return this.#registers[register];
  }

  // Save $pc into $ra, then jump to a new address in `program` (jal in MIPS)
  call(handle) {
    if (handle !== null) {
      this.lowlevel.call(handle);
    }
  }

  // Return to the `program` address stored in $ra
  return() {
    this.lowlevel.return();
  }
  #tree;
  context;
  constructor({
    scope,
    dynamicScope,
    stack,
    pc
  }, context, tree) {
    let evalStack = EvaluationStackImpl.restore(stack, pc);
    this.#tree = tree;
    this.context = context;
    this.#stacks = new Stacks(scope, dynamicScope);
    this.args = new VMArgumentsImpl();
    this.lowlevel = new LowLevelVM(evalStack, context, externs(), evalStack.registers);
    this.pushUpdating();
  }
  static initial(context, options) {
    let scope = ScopeImpl.root(options.owner, options.scope ?? {
      self: UNDEFINED_REFERENCE,
      size: 0
    });
    const state = closureState(context.program.heap.getaddr(options.handle), scope, options.dynamicScope);
    return new VM(state, context, options.tree);
  }
  compile(block) {
    let handle = unwrapHandle(block.compile(this.context));
    return handle;
  }
  get constants() {
    return this.context.program.constants;
  }
  get program() {
    return this.context.program;
  }
  get env() {
    return this.context.env;
  }
  captureClosure(args, pc = this.lowlevel.fetchRegister($pc)) {
    return {
      pc,
      scope: this.scope(),
      dynamicScope: this.dynamicScope(),
      stack: this.stack.capture(args)
    };
  }
  capture(args, pc = this.lowlevel.fetchRegister($pc)) {
    return new Closure(this.captureClosure(args, pc), this.context);
  }

  /**
   * ## Opcodes
   *
   * - Append: `BeginComponentTransaction`
   *
   * ## State Changes
   *
   * [ ] create `guard` (`JumpIfNotModifiedOpcode`)
   * [ ] create `tracker` (`BeginTrackFrameOpcode`)
   * [!] push Updating Stack <- `guard`
   * [!] push Updating Stack <- `tracker`
   * [!] push Cache Stack <- `guard`
   * [!] push Tracking Stack
   */
  beginCacheGroup(name) {
    let opcodes = this.updating();
    let guard = new JumpIfNotModifiedOpcode();
    opcodes.push(guard);
    opcodes.push(new BeginTrackFrameOpcode(name));
    this.#stacks.cache.push(guard);
    beginTrackFrame();
  }

  /**
   * ## Opcodes
   *
   * - Append: `CommitComponentTransaction`
   *
   * ## State Changes
   *
   * Create a new `EndTrackFrameOpcode` (`end`)
   *
   * [!] pop CacheStack -> `guard`
   * [!] pop Tracking Stack -> `tag`
   * [ ] create `end` (`EndTrackFrameOpcode`) with `guard`
   * [-] consume `tag`
   */
  commitCacheGroup() {
    let opcodes = this.updating();
    let guard = expect(this.#stacks.cache.pop());
    let tag = endTrackFrame();
    opcodes.push(new EndTrackFrameOpcode(guard));
    guard.finalize(tag, opcodes.length);
  }

  /**
   * ## Opcodes
   *
   * - Append: `Enter`
   *
   * ## State changes
   *
   * [!] push Element Stack as `block`
   * [ ] create `try` (`TryOpcode`) with `block`, capturing `args` from the Eval Stack
   *
   * Did Enter (`try`):
   * [-] associate destroyable `try`
   * [!] push Destroyable Stack <- `try`
   * [!] push Updating List <- `try`
   * [!] push Updating Stack <- `try.children`
   */
  enter(args) {
    let updating = [];
    let state = this.capture(args);
    let block = this.tree().pushResettableBlock();
    let tryOpcode = new TryOpcode(state, this.context, block, updating);
    this.didEnter(tryOpcode);
  }

  /**
   * ## Opcodes
   *
   * - Append: `Iterate`
   * - Update: `ListBlock`
   *
   * ## State changes
   *
   * Create a new ref for the iterator item (`value`).
   * Create a new ref for the iterator key (`key`).
   *
   * [ ] create `valueRef` (`Reference`) from `value`
   * [ ] create `keyRef` (`Reference`) from `key`
   * [!] push Eval Stack <- `valueRef`
   * [!] push Eval Stack <- `keyRef`
   * [!] push Element Stack <- `UpdatableBlock` as `block`
   * [ ] capture `closure` with *2* items from the Eval Stack
   * [ ] create `iteration` (`ListItemOpcode`) with `closure`, `block`, `key`, `keyRef` and `valueRef`
   *
   * Did Enter (`iteration`):
   * [-] associate destroyable `iteration`
   * [!] push Destroyable Stack <- `iteration`
   * [!] push Updating List <- `iteration`
   * [!] push Updating Stack <- `iteration.children`
   */
  enterItem({
    key,
    value,
    memo
  }) {
    let {
      stack
    } = this;
    let valueRef = createIteratorItemRef(value);
    let memoRef = createIteratorItemRef(memo);
    stack.push(valueRef);
    stack.push(memoRef);
    let state = this.capture(2);
    let block = this.tree().pushResettableBlock();
    let opcode = new ListItemOpcode(state, this.context, block, key, memoRef, valueRef);
    this.didEnter(opcode);
    return opcode;
  }
  registerItem(opcode) {
    this.listBlock().initializeChild(opcode);
  }

  /**
   * ## Opcodes
   *
   * - Append: `EnterList`
   *
   * ## State changes
   *
   * [ ] capture `closure` with *0* items from the Eval Stack, and `$pc` from `offset`
   * [ ] create `updating` (empty `Array`)
   * [!] push Element Stack <- `list` (`BlockList`) with `updating`
   * [ ] create `list` (`ListBlockOpcode`) with `closure`, `list`, `updating` and `iterableRef`
   * [!] push List Stack <- `list`
   *
   * Did Enter (`list`):
   * [-] associate destroyable `list`
   * [!] push Destroyable Stack <- `list`
   * [!] push Updating List <- `list`
   * [!] push Updating Stack <- `list.children`
   */
  enterList(iterableRef, offset) {
    let updating = [];
    let addr = this.lowlevel.target(offset);
    let state = this.capture(0, addr);
    let list = this.tree().pushBlockList(updating);
    let opcode = new ListBlockOpcode(state, this.context, list, updating, iterableRef);
    this.#stacks.list.push(opcode);
    this.didEnter(opcode);
  }

  /**
   * ## Opcodes
   *
   * - Append: `Enter`
   * - Append: `Iterate`
   * - Append: `EnterList`
   * - Update: `ListBlock`
   *
   * ## State changes
   *
   * [-] associate destroyable `opcode`
   * [!] push Destroyable Stack <- `opcode`
   * [!] push Updating List <- `opcode`
   * [!] push Updating Stack <- `opcode.children`
   *
   */
  didEnter(opcode) {
    this.associateDestroyable(opcode);
    this.#stacks.destroyable.push(opcode);
    this.updateWith(opcode);
    this.pushUpdating(opcode.children);
  }

  /**
   * ## Opcodes
   *
   * - Append: `Exit`
   * - Append: `ExitList`
   *
   * ## State changes
   *
   * [!] pop Destroyable Stack
   * [!] pop Element Stack
   * [!] pop Updating Stack
   */
  exit() {
    this.#stacks.destroyable.pop();
    this.#tree.popBlock();
    this.popUpdating();
  }

  /**
   * ## Opcodes
   *
   * - Append: `ExitList`
   *
   * ## State changes
   *
   * Pop List:
   * [!] pop Destroyable Stack
   * [!] pop Element Stack
   * [!] pop Updating Stack
   *
   * [!] pop List Stack
   */
  exitList() {
    this.exit();
    this.#stacks.list.pop();
  }

  /**
   * ## Opcodes
   *
   * - Append: `RootScope`
   * - Append: `VirtualRootScope`
   *
   * ## State changes
   *
   * [!] push Scope Stack
   */
  pushRootScope(size, owner) {
    let scope = ScopeImpl.sized(owner, size);
    this.#stacks.scope.push(scope);
    return scope;
  }

  /**
   * ## Opcodes
   *
   * - Append: `ChildScope`
   *
   * ## State changes
   *
   * [!] push Scope Stack <- `child` of current Scope
   */
  pushChildScope() {
    this.#stacks.scope.push(this.scope().child());
  }

  /**
   * ## Opcodes
   *
   * - Append: `Yield`
   *
   * ## State changes
   *
   * [!] push Scope Stack <- `scope`
   */
  pushScope(scope) {
    this.#stacks.scope.push(scope);
  }

  /**
   * ## Opcodes
   *
   * - Append: `PopScope`
   *
   * ## State changes
   *
   * [!] pop Scope Stack
   */
  popScope() {
    this.#stacks.scope.pop();
  }

  /**
   * ## Opcodes
   *
   * - Append: `PushDynamicScope`
   *
   * ## State changes:
   *
   * [!] push Dynamic Scope Stack <- child of current Dynamic Scope
   */
  pushDynamicScope() {
    let child = this.dynamicScope().child();
    this.#stacks.dynamicScope.push(child);
    return child;
  }

  /**
   * ## Opcodes
   *
   * - Append: `BindDynamicScope`
   *
   * ## State changes:
   *
   * [!] pop Dynamic Scope Stack `names.length` times
   */
  bindDynamicScope(names) {
    let scope = this.dynamicScope();
    for (const name of reverse(names)) {
      scope.set(name, this.stack.pop());
    }
  }

  /**
   * ## State changes
   *
   * - [!] push Updating Stack
   *
   * @utility
   */
  pushUpdating(list = []) {
    this.#stacks.updating.push(list);
  }

  /**
   * ## State changes
   *
   * [!] pop Updating Stack
   *
   * @utility
   */
  popUpdating() {
    return expect(this.#stacks.updating.pop());
  }

  /**
   * ## State changes
   *
   * [!] push Updating List
   *
   * @utility
   */
  updateWith(opcode) {
    this.updating().push(opcode);
  }
  listBlock() {
    return expect(this.#stacks.list.current);
  }

  /**
   * ## State changes
   *
   * [-] associate destroyable `child`
   *
   * @utility
   */
  associateDestroyable(child) {
    let parent = expect(this.#stacks.destroyable.current);
    associateDestroyableChild(parent, child);
  }
  updating() {
    return expect(this.#stacks.updating.current);
  }

  /**
   * Get Tree Builder
   */
  tree() {
    return this.#tree;
  }

  /**
   * Get current Scope
   */
  scope() {
    return expect(this.#stacks.scope.current);
  }

  /**
   * Get current Dynamic Scope
   */
  dynamicScope() {
    return expect(this.#stacks.dynamicScope.current);
  }
  popDynamicScope() {
    this.#stacks.dynamicScope.pop();
  }

  /// SCOPE HELPERS

  getOwner() {
    return this.scope().owner;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSelf() {
    return this.scope().getSelf();
  }
  referenceForSymbol(symbol) {
    return this.scope().getSymbol(symbol);
  }

  /// EXECUTION

  execute(initialize) {
    {
      return this._execute(initialize);
    }
  }
  _execute(initialize) {
    if (initialize) initialize(this);
    let result;
    do result = this.next(); while (!result.done);
    return result.value;
  }
  next() {
    let {
      env
    } = this;
    let opcode = this.lowlevel.nextStatement();
    let result;
    if (opcode !== null) {
      this.lowlevel.evaluateOuter(opcode, this);
      result = {
        done: false,
        value: null
      };
    } else {
      // Unload the stack
      this.stack.reset();
      result = {
        done: true,
        value: new RenderResultImpl(env, this.popUpdating(), this.#tree.popBlock(), this.#stacks.drop)
      };
    }
    return result;
  }
}
function closureState(pc, scope, dynamicScope) {
  return {
    pc,
    scope,
    dynamicScope,
    stack: []
  };
}
/**
 * A closure captures the state of the VM for a particular block of code that is necessary to
 * re-invoke the block in the future.
 *
 * In practice, this allows us to clear the previous render and "replay" the block's execution,
 * rendering content in the same position as the first render.
 */
class Closure {
  state;
  context;
  constructor(state, context) {
    this.state = state;
    this.context = context;
  }
  evaluate(tree) {
    return new VM(this.state, this.context, tree);
  }
}

class TemplateIteratorImpl {
  constructor(vm) {
    this.vm = vm;
  }
  next() {
    return this.vm.next();
  }
  sync() {
    {
      return this.vm.execute();
    }
  }
}
function renderSync(env, iterator) {
  let result;
  inTransaction(env, () => result = iterator.sync());

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
  return result;
}
function renderMain(context, owner, self, tree, layout, dynamicScope = new DynamicScopeImpl()) {
  let handle = unwrapHandle(layout.compile(context));
  let numSymbols = layout.symbolTable.symbols.length;
  let vm = VM.initial(context, {
    scope: {
      self,
      size: numSymbols
    },
    dynamicScope,
    tree,
    handle,
    owner
  });
  return new TemplateIteratorImpl(vm);
}
function renderInvocation(vm, context, owner, definition, args) {
  // Get a list of tuples of argument names and references, like
  // [['title', reference], ['name', reference]]
  const argList = Object.keys(args).map(key => [key, args[key]]);
  const blockNames = ['main', 'else', 'attrs'];
  // Prefix argument names with `@` symbol
  const argNames = argList.map(([name]) => `@${name}`);
  let reified = vm.constants.component(definition, owner, undefined, '{ROOT}');
  vm.lowlevel.pushFrame();

  // Push blocks on to the stack, three stack values per block
  for (let i = 0; i < 3 * blockNames.length; i++) {
    vm.stack.push(null);
  }
  vm.stack.push(null);

  // For each argument, push its backing reference on to the stack
  argList.forEach(([, reference]) => {
    vm.stack.push(reference);
  });

  // Configure VM based on blocks and args just pushed on to the stack.
  vm.args.setup(vm.stack, argNames, blockNames, 0, true);
  const compilable = expect(reified.compilable);
  const layoutHandle = unwrapHandle(compilable.compile(context));
  const invocation = {
    handle: layoutHandle,
    symbolTable: compilable.symbolTable
  };

  // Needed for the Op.Main opcode: arguments, component invocation object, and
  // component definition.
  vm.stack.push(vm.args);
  vm.stack.push(invocation);
  vm.stack.push(reified);
  return new TemplateIteratorImpl(vm);
}
function renderComponent(context, tree, owner, definition, args = {}, dynamicScope = new DynamicScopeImpl()) {
  let vm = VM.initial(context, {
    tree,
    handle: context.stdlib.main,
    dynamicScope,
    owner
  });
  return renderInvocation(vm, context, owner, definition, recordToReference(args));
}
function recordToReference(record) {
  const root = createConstRef(record);
  return Object.keys(record).reduce((acc, key) => {
    acc[key] = childRefFor(root, key);
    return acc;
  }, {});
}

export { DOMChanges as D, EnvironmentImpl as E, LowLevelVM as L, ScopeImpl as S, UpdatingVM as U, DynamicScopeImpl as a, DOMChangesImpl as b, isWhitespace as c, renderMain as d, renderSync as e, resetDebuggerCallback as f, runtimeOptions as g, inTransaction as i, renderComponent as r, setDebuggerCallback as s };
