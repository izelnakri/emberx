import { a as $v0, b as $t1, c as $t0, d as $pc, e as $ra, f as $fp, g as $sp, h as $s1, $ as $s0 } from './registers-C_W2qYHJ.js';
import { s as setLocalDebugType } from './debug-brand-B1TWjOCH.js';
import { e as expect, S as StackImpl, u as unwrap, c as isIndexable, d as dict } from './collections-GpG8lT2g.js';
import { c as createComputeRef, v as valueForRef, a as createConstRef, e as createPrimitiveRef, i as isConstRef, U as UNDEFINED_REFERENCE, N as NULL_REFERENCE, T as TRUE_REFERENCE, F as FALSE_REFERENCE, R as REFERENCE } from './reference-CG0yPgLy.js';
import { b as EMPTY_STRING_ARRAY, e as enumerate, c as emptyArray } from './array-utils-CZQxrdD3.js';
import { C as CONSTANT_TAG, I as INITIAL, v as validateTag, c as consumeTag, a as valueForTag, o as beginTrackFrame, s as endTrackFrame, k as CURRENT_TAG } from './cache-CofLhaS4.js';
import { C as CURRIED_MODIFIER, a as CURRIED_COMPONENT } from './curried-BZnYakIg.js';
import { j as VM_SYSCALL_SIZE, k as VM_CHILD_SCOPE_OP, l as VM_POP_SCOPE_OP, m as VM_PUSH_DYNAMIC_SCOPE_OP, n as VM_POP_DYNAMIC_SCOPE_OP, o as VM_CONSTANT_OP, p as decodeHandle, q as VM_CONSTANT_REFERENCE_OP, r as VM_PRIMITIVE_OP, s as isHandle, t as decodeImmediate, u as VM_PRIMITIVE_REFERENCE_OP, v as VM_DUP_OP, w as VM_POP_OP, x as VM_LOAD_OP, y as VM_FETCH_OP, z as VM_BIND_DYNAMIC_SCOPE_OP, A as VM_ENTER_OP, B as VM_EXIT_OP, C as VM_PUSH_SYMBOL_TABLE_OP, D as VM_PUSH_BLOCK_SCOPE_OP, E as VM_COMPILE_BLOCK_OP, F as VM_INVOKE_YIELD_OP, G as VM_JUMP_UNLESS_OP, H as VM_JUMP_EQ_OP, b as VM_ASSERT_SAME_OP, I as VM_TO_BOOLEAN_OP, J as VM_TEXT_OP, K as VM_COMMENT_OP, L as VM_OPEN_ELEMENT_OP, M as VM_OPEN_DYNAMIC_ELEMENT_OP, N as VM_PUSH_REMOTE_ELEMENT_OP, O as VM_POP_REMOTE_ELEMENT_OP, P as VM_FLUSH_ELEMENT_OP, Q as VM_CLOSE_ELEMENT_OP, R as VM_MODIFIER_OP, S as VM_DYNAMIC_MODIFIER_OP, T as VM_STATIC_ATTR_OP, U as VM_DYNAMIC_ATTR_OP, W as VM_PUSH_COMPONENT_DEFINITION_OP, X as VM_RESOLVE_DYNAMIC_COMPONENT_OP, e as VM_RESOLVE_CURRIED_COMPONENT_OP, f as VM_PUSH_DYNAMIC_COMPONENT_INSTANCE_OP, Y as VM_PUSH_ARGS_OP, Z as VM_PUSH_EMPTY_ARGS_OP, _ as VM_CAPTURE_ARGS_OP, $ as VM_PREPARE_ARGS_OP, a0 as VM_CREATE_COMPONENT_OP, a1 as VM_REGISTER_COMPONENT_DESTRUCTOR_OP, a2 as VM_BEGIN_COMPONENT_TRANSACTION_OP, a3 as VM_PUT_COMPONENT_OPERATIONS_OP, a4 as VM_COMPONENT_ATTR_OP, a5 as VM_STATIC_COMPONENT_ATTR_OP, a6 as VM_DID_CREATE_ELEMENT_OP, a7 as VM_GET_COMPONENT_SELF_OP, a8 as VM_GET_COMPONENT_TAG_NAME_OP, a9 as VM_GET_COMPONENT_LAYOUT_OP, V as VM_MAIN_OP, aa as VM_POPULATE_LAYOUT_OP, ab as VM_VIRTUAL_ROOT_SCOPE_OP, ac as VM_SET_NAMED_VARIABLES_OP, ad as VM_SET_BLOCKS_OP, ae as VM_INVOKE_COMPONENT_LAYOUT_OP, af as VM_DID_RENDER_LAYOUT_OP, ag as VM_COMMIT_COMPONENT_TRANSACTION_OP } from './syscall-ops-CkPT1Kfx.js';
import { a as assert } from './assert-Zqc4wiAV.js';
import { u as unwrapTemplate } from './template-BRrQR6KS.js';
import { registerDestructor, destroy, associateDestroyableChild } from '../@glimmer/destroyable/index.js';
import { m as managerHasCapability } from './capabilities-BuVYh-vx.js';
import { a as assign } from './object-utils-AijlD-JH.js';
import { I as InternalComponentCapabilities } from './flags-BZxHQ0yn.js';
import { n as normalizeStringValue, C as ConcreteBounds } from './normalize-C_IStty9.js';
import { b as getInternalModifierManager } from './api-DlJKfm_f.js';
import { toBool } from '../@glimmer/global-context/index.js';

function CheckInstanceof(Class) {
}
const CheckRegister = new class {
  validate(value) {
    switch (value) {
      case $s0:
      case $s1:
      case $sp:
      case $fp:
      case $ra:
      case $pc:
      case $t0:
      case $t1:
      case $v0:
        return true;
      default:
        return false;
    }
  }
  expected() {
    return `Register`;
  }
}();

/*@__NO_SIDE_EFFECTS__*/

function check(value, checker, message) {
  {
    return value;
  }
}

/** @internal */
function hasCustomDebugRenderTreeLifecycle(manager) {
  return 'getDebugCustomRenderTree' in manager;
}

function resolveComponent(resolver, constants, name, owner) {
  let definition = resolver?.lookupComponent?.(name, expect(owner)) ?? null;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
  return constants.resolvedComponent(definition, name);
}

const TYPE = Symbol('TYPE');
const INNER = Symbol('INNER');
const OWNER = Symbol('OWNER');
const ARGS = Symbol('ARGS');
const RESOLVED = Symbol('RESOLVED');
const CURRIED_VALUES = new WeakSet();
function isCurriedValue(value) {
  return CURRIED_VALUES.has(value);
}
function isCurriedType(value, type) {
  return isCurriedValue(value) && value[TYPE] === type;
}
class CurriedValue {
  [TYPE];
  [INNER];
  [OWNER];
  [ARGS];
  [RESOLVED];

  /** @internal */
  constructor(type, inner, owner, args, resolved = false) {
    CURRIED_VALUES.add(this);
    this[TYPE] = type;
    this[INNER] = inner;
    this[OWNER] = owner;
    this[ARGS] = args;
    this[RESOLVED] = resolved;
  }
}
function resolveCurriedValue(curriedValue) {
  let currentWrapper = curriedValue;
  let positional;
  let named;
  let definition, owner, resolved;
  while (true) {
    let {
      [ARGS]: curriedArgs,
      [INNER]: inner
    } = currentWrapper;
    if (curriedArgs !== null) {
      let {
        named: curriedNamed,
        positional: curriedPositional
      } = curriedArgs;
      if (curriedPositional.length > 0) {
        positional = positional === undefined ? curriedPositional : curriedPositional.concat(positional);
      }
      if (named === undefined) {
        named = [];
      }
      named.unshift(curriedNamed);
    }
    if (!isCurriedValue(inner)) {
      // Save off the owner that this helper was curried with. Later on,
      // we'll fetch the value of this register and set it as the owner on the
      // new root scope.
      definition = inner;
      owner = currentWrapper[OWNER];
      resolved = currentWrapper[RESOLVED];
      break;
    }
    currentWrapper = inner;
  }
  return {
    definition,
    owner,
    resolved,
    positional,
    named
  };
}
function curry(type, spec, owner, args, resolved = false) {
  return new CurriedValue(type, spec, owner, args, resolved);
}

let GUID = 0;
class Ref {
  id = GUID++;
  value;
  constructor(value) {
    this.value = value;
  }
  get() {
    return this.value;
  }
  release() {
    this.value = null;
  }
  toString() {
    let label = `Ref ${this.id}`;
    if (this.value === null) {
      return `${label} (released)`;
    } else {
      try {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        return `${label}: ${this.value}`;
      } catch {
        return label;
      }
    }
  }
}
class DebugRenderTreeImpl {
  stack = new StackImpl();
  refs = new WeakMap();
  roots = new Set();
  nodes = new WeakMap();
  begin() {
    this.reset();
  }
  create(state, node) {
    let internalNode = assign({}, node, {
      bounds: null,
      refs: new Set()
    });
    this.nodes.set(state, internalNode);
    this.appendChild(internalNode, state);
    this.enter(state);
  }
  update(state) {
    this.enter(state);
  }
  didRender(state, bounds) {
    this.nodeFor(state).bounds = bounds;
    this.exit();
  }
  willDestroy(state) {
    expect(this.refs.get(state)).release();
  }
  commit() {
    this.reset();
  }
  capture() {
    return this.captureRefs(this.roots);
  }
  reset() {
    if (this.stack.size !== 0) {
      // We probably encountered an error during the rendering loop. This will
      // likely trigger undefined behavior and memory leaks as the error left
      // things in an inconsistent state. It is recommended that the user
      // refresh the page.

      // TODO: We could warn here? But this happens all the time in our tests?

      // Clean up the root reference to prevent errors from happening if we
      // attempt to capture the render tree (Ember Inspector may do this)
      let root = expect(this.stack.toArray()[0]);
      let ref = this.refs.get(root);
      if (ref !== undefined) {
        this.roots.delete(ref);
      }
      while (!this.stack.isEmpty()) {
        this.stack.pop();
      }
    }
  }
  enter(state) {
    this.stack.push(state);
  }
  exit() {
    this.stack.pop();
  }
  nodeFor(state) {
    return expect(this.nodes.get(state));
  }
  appendChild(node, state) {
    let parent = this.stack.current;
    let ref = new Ref(state);
    this.refs.set(state, ref);
    if (parent) {
      let parentNode = this.nodeFor(parent);
      parentNode.refs.add(ref);
      node.parent = parentNode;
    } else {
      this.roots.add(ref);
    }
  }
  captureRefs(refs) {
    let captured = [];
    refs.forEach(ref => {
      let state = ref.get();
      if (state) {
        captured.push(this.captureNode(`render-node:${ref.id}`, state));
      } else {
        refs.delete(ref);
      }
    });
    return captured;
  }
  captureNode(id, state) {
    let node = this.nodeFor(state);
    let {
      type,
      name,
      args,
      instance,
      refs
    } = node;
    let bounds = this.captureBounds(node);
    let children = this.captureRefs(refs);
    return {
      id,
      type,
      name,
      args: reifyArgsDebug(args),
      instance,
      bounds,
      children
    };
  }
  captureBounds(node) {
    let bounds = expect(node.bounds);
    let parentElement = bounds.parentElement();
    let firstNode = bounds.firstNode();
    let lastNode = bounds.lastNode();
    return {
      parentElement,
      firstNode,
      lastNode
    };
  }
}
function getDebugName(definition, manager = definition.manager) {
  return definition.resolvedName ?? definition.debugName ?? manager.getDebugName(definition.state);
}

class AppendOpcodes {
  // This code is intentionally putting unsafe `null`s into the array that it
  // will intentionally overwrite before anyone can see them.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  evaluateOpcode = new Array(VM_SYSCALL_SIZE).fill(null);
  constructor() {
  }
  add(name, evaluate, kind = 'syscall') {
    this.evaluateOpcode[name] = {
      syscall: kind !== 'machine',
      evaluate
    };
  }
  evaluate(vm, opcode, type) {
    let operation = unwrap(this.evaluateOpcode[type]);
    if (operation.syscall) {
      assert(!opcode.isMachine, `BUG: Mismatch between operation.syscall (${operation.syscall}) and opcode.isMachine (${opcode.isMachine}) for ${opcode.type}`);
      operation.evaluate(vm, opcode);
    } else {
      assert(opcode.isMachine, `BUG: Mismatch between operation.syscall (${operation.syscall}) and opcode.isMachine (${opcode.isMachine}) for ${opcode.type}`);
      operation.evaluate(vm.lowlevel, opcode);
    }
  }
}
function externs(vm) {
  return undefined;
}
const APPEND_OPCODES = new AppendOpcodes();

function createClassListRef(list) {
  return createComputeRef(() => {
    let ret = [];
    for (const ref of list) {
      let value = normalizeStringValue(typeof ref === 'string' ? ref : valueForRef(ref));
      if (value) ret.push(value);
    }
    return ret.length === 0 ? null : ret.join(' ');
  });
}

APPEND_OPCODES.add(VM_CHILD_SCOPE_OP, vm => vm.pushChildScope());
APPEND_OPCODES.add(VM_POP_SCOPE_OP, vm => vm.popScope());
APPEND_OPCODES.add(VM_PUSH_DYNAMIC_SCOPE_OP, vm => vm.pushDynamicScope());
APPEND_OPCODES.add(VM_POP_DYNAMIC_SCOPE_OP, vm => vm.popDynamicScope());
APPEND_OPCODES.add(VM_CONSTANT_OP, (vm, {
  op1: other
}) => {
  vm.stack.push(vm.constants.getValue(decodeHandle(other)));
});
APPEND_OPCODES.add(VM_CONSTANT_REFERENCE_OP, (vm, {
  op1: other
}) => {
  vm.stack.push(createConstRef(vm.constants.getValue(decodeHandle(other))));
});
APPEND_OPCODES.add(VM_PRIMITIVE_OP, (vm, {
  op1: primitive
}) => {
  let stack = vm.stack;
  if (isHandle(primitive)) {
    // it is a handle which does not already exist on the stack
    let value = vm.constants.getValue(decodeHandle(primitive));
    stack.push(value);
  } else {
    // is already an encoded immediate or primitive handle
    stack.push(decodeImmediate(primitive));
  }
});
APPEND_OPCODES.add(VM_PRIMITIVE_REFERENCE_OP, vm => {
  let stack = vm.stack;
  let value = check(stack.pop());
  let ref;
  if (value === undefined) {
    ref = UNDEFINED_REFERENCE;
  } else if (value === null) {
    ref = NULL_REFERENCE;
  } else if (value === true) {
    ref = TRUE_REFERENCE;
  } else if (value === false) {
    ref = FALSE_REFERENCE;
  } else {
    ref = createPrimitiveRef(value);
  }
  stack.push(ref);
});
APPEND_OPCODES.add(VM_DUP_OP, (vm, {
  op1: register,
  op2: offset
}) => {
  let position = check(vm.fetchValue(check(register, CheckRegister))) - offset;
  vm.stack.dup(position);
});
APPEND_OPCODES.add(VM_POP_OP, (vm, {
  op1: count
}) => {
  vm.stack.pop(count);
});
APPEND_OPCODES.add(VM_LOAD_OP, (vm, {
  op1: register
}) => {
  vm.load(check(register));
});
APPEND_OPCODES.add(VM_FETCH_OP, (vm, {
  op1: register
}) => {
  vm.fetch(check(register));
});
APPEND_OPCODES.add(VM_BIND_DYNAMIC_SCOPE_OP, (vm, {
  op1: _names
}) => {
  let names = vm.constants.getArray(_names);
  vm.bindDynamicScope(names);
});
APPEND_OPCODES.add(VM_ENTER_OP, (vm, {
  op1: args
}) => {
  vm.enter(args);
});
APPEND_OPCODES.add(VM_EXIT_OP, vm => {
  vm.exit();
});
APPEND_OPCODES.add(VM_PUSH_SYMBOL_TABLE_OP, (vm, {
  op1: _table
}) => {
  let stack = vm.stack;
  stack.push(vm.constants.getValue(_table));
});
APPEND_OPCODES.add(VM_PUSH_BLOCK_SCOPE_OP, vm => {
  let stack = vm.stack;
  stack.push(vm.scope());
});
APPEND_OPCODES.add(VM_COMPILE_BLOCK_OP, vm => {
  let stack = vm.stack;
  let block = stack.pop();
  if (block) {
    stack.push(vm.compile(block));
  } else {
    stack.push(null);
  }
});
APPEND_OPCODES.add(VM_INVOKE_YIELD_OP, vm => {
  let {
    stack
  } = vm;
  let handle = check(stack.pop());
  let scope = check(stack.pop());
  let table = check(stack.pop());
  let args = check(stack.pop());
  if (table === null || handle === null) {
    // To balance the pop{Frame,Scope}
    vm.lowlevel.pushFrame();
    vm.pushScope(scope ?? vm.scope());
    return;
  }
  let invokingScope = expect(scope);

  // If necessary, create a child scope
  {
    let locals = table.parameters;
    let localsCount = locals.length;
    if (localsCount > 0) {
      invokingScope = invokingScope.child();
      for (let i = 0; i < localsCount; i++) {
        invokingScope.bindSymbol(unwrap(locals[i]), args.at(i));
      }
    }
  }
  vm.lowlevel.pushFrame();
  vm.pushScope(invokingScope);
  vm.call(handle);
});
APPEND_OPCODES.add(VM_JUMP_UNLESS_OP, (vm, {
  op1: target
}) => {
  let reference = check(vm.stack.pop());
  let value = Boolean(valueForRef(reference));
  if (isConstRef(reference)) {
    if (!value) {
      vm.lowlevel.goto(target);
    }
  } else {
    if (!value) {
      vm.lowlevel.goto(target);
    }
    vm.updateWith(new Assert(reference));
  }
});
APPEND_OPCODES.add(VM_JUMP_EQ_OP, (vm, {
  op1: target,
  op2: comparison
}) => {
  let other = check(vm.stack.peek());
  if (other === comparison) {
    vm.lowlevel.goto(target);
  }
});
APPEND_OPCODES.add(VM_ASSERT_SAME_OP, vm => {
  let reference = check(vm.stack.peek());
  if (!isConstRef(reference)) {
    vm.updateWith(new Assert(reference));
  }
});
APPEND_OPCODES.add(VM_TO_BOOLEAN_OP, vm => {
  let {
    stack
  } = vm;
  let valueRef = check(stack.pop());
  stack.push(createComputeRef(() => toBool(valueForRef(valueRef))));
});
class Assert {
  last;
  constructor(ref) {
    this.ref = ref;
    this.last = valueForRef(ref);
  }
  evaluate(vm) {
    let {
      last,
      ref
    } = this;
    let current = valueForRef(ref);
    if (last !== current) {
      vm.throw();
    }
  }
}
class AssertFilter {
  last;
  constructor(ref, filter) {
    this.ref = ref;
    this.filter = filter;
    this.last = filter(valueForRef(ref));
  }
  evaluate(vm) {
    let {
      last,
      ref,
      filter
    } = this;
    let current = filter(valueForRef(ref));
    if (last !== current) {
      vm.throw();
    }
  }
}
class JumpIfNotModifiedOpcode {
  tag = CONSTANT_TAG;
  lastRevision = INITIAL;
  target;
  finalize(tag, target) {
    this.target = target;
    this.didModify(tag);
  }
  evaluate(vm) {
    let {
      tag,
      target,
      lastRevision
    } = this;
    if (!vm.alwaysRevalidate && validateTag(tag, lastRevision)) {
      consumeTag(tag);
      vm.goto(expect(target));
    }
  }
  didModify(tag) {
    this.tag = tag;
    this.lastRevision = valueForTag(this.tag);
    consumeTag(tag);
  }
}
class BeginTrackFrameOpcode {
  constructor(debugLabel) {
    this.debugLabel = debugLabel;
  }
  evaluate() {
    beginTrackFrame(this.debugLabel);
  }
}
class EndTrackFrameOpcode {
  constructor(target) {
    this.target = target;
  }
  evaluate() {
    let tag = endTrackFrame();
    this.target.didModify(tag);
  }
}

APPEND_OPCODES.add(VM_TEXT_OP, (vm, {
  op1: text
}) => {
  vm.tree().appendText(vm.constants.getValue(text));
});
APPEND_OPCODES.add(VM_COMMENT_OP, (vm, {
  op1: text
}) => {
  vm.tree().appendComment(vm.constants.getValue(text));
});
APPEND_OPCODES.add(VM_OPEN_ELEMENT_OP, (vm, {
  op1: tag
}) => {
  vm.tree().openElement(vm.constants.getValue(tag));
});
APPEND_OPCODES.add(VM_OPEN_DYNAMIC_ELEMENT_OP, vm => {
  let tagName = check(valueForRef(check(vm.stack.pop(), CheckReference)));
  vm.tree().openElement(tagName);
});
APPEND_OPCODES.add(VM_PUSH_REMOTE_ELEMENT_OP, vm => {
  let elementRef = check(vm.stack.pop());
  let insertBeforeRef = check(vm.stack.pop());
  let guidRef = check(vm.stack.pop());
  let element = check(valueForRef(elementRef));
  let insertBefore = check(valueForRef(insertBeforeRef));
  let guid = valueForRef(guidRef);
  if (!isConstRef(elementRef)) {
    vm.updateWith(new Assert(elementRef));
  }
  if (insertBefore !== undefined && !isConstRef(insertBeforeRef)) {
    vm.updateWith(new Assert(insertBeforeRef));
  }
  let block = vm.tree().pushRemoteElement(element, guid, insertBefore);
  vm.associateDestroyable(block);
  if (vm.env.debugRenderTree !== undefined) {
    // Note that there is nothing to update – when the args for an
    // {{#in-element}} changes it gets torn down and a new one is
    // re-created/rendered in its place (see the `Assert`s above)
    let args = createCapturedArgs(insertBefore === undefined ? {} : {
      insertBefore: insertBeforeRef
    }, [elementRef]);
    vm.env.debugRenderTree.create(block, {
      type: 'keyword',
      name: 'in-element',
      args,
      instance: null
    });
    registerDestructor(block, () => {
      vm.env.debugRenderTree?.willDestroy(block);
    });
  }
});
APPEND_OPCODES.add(VM_POP_REMOTE_ELEMENT_OP, vm => {
  let bounds = vm.tree().popRemoteElement();
  if (vm.env.debugRenderTree !== undefined) {
    // The RemoteBlock is also its bounds
    vm.env.debugRenderTree.didRender(bounds, bounds);
  }
});
APPEND_OPCODES.add(VM_FLUSH_ELEMENT_OP, vm => {
  let operations = check(vm.fetchValue($t0));
  let modifiers = null;
  if (operations) {
    modifiers = operations.flush(vm);
    vm.loadValue($t0, null);
  }
  vm.tree().flushElement(modifiers);
});
APPEND_OPCODES.add(VM_CLOSE_ELEMENT_OP, vm => {
  let modifiers = vm.tree().closeElement();
  if (modifiers !== null) {
    modifiers.forEach(modifier => {
      vm.env.scheduleInstallModifier(modifier);
      const d = modifier.manager.getDestroyable(modifier.state);
      if (d !== null) {
        vm.associateDestroyable(d);
      }
    });
  }
});
APPEND_OPCODES.add(VM_MODIFIER_OP, (vm, {
  op1: handle
}) => {
  let args = check(vm.stack.pop());
  if (!vm.env.isInteractive) {
    return;
  }
  let owner = vm.getOwner();
  let definition = vm.constants.getValue(handle);
  let {
    manager
  } = definition;
  let {
    constructing
  } = vm.tree();
  let capturedArgs = args.capture();
  let state = manager.create(owner, expect(constructing), definition.state, capturedArgs);
  let instance = {
    manager,
    state,
    definition
  };
  let operations = expect(check(vm.fetchValue($t0)));
  operations.addModifier(vm, instance, capturedArgs);
  let tag = manager.getTag(state);
  if (tag !== null) {
    consumeTag(tag);
    return vm.updateWith(new UpdateModifierOpcode(tag, instance));
  }
});
APPEND_OPCODES.add(VM_DYNAMIC_MODIFIER_OP, vm => {
  let {
    stack
  } = vm;
  let ref = check(stack.pop());
  let args = check(stack.pop());
  if (!vm.env.isInteractive) {
    return;
  }
  let capturedArgs = args.capture();
  let {
    positional: outerPositional,
    named: outerNamed
  } = capturedArgs;
  let {
    constructing
  } = vm.tree();
  let initialOwner = vm.getOwner();
  let instanceRef = createComputeRef(() => {
    let value = valueForRef(ref);
    let owner;
    if (!isIndexable(value)) {
      return;
    }
    let hostDefinition;
    if (isCurriedType(value, CURRIED_MODIFIER)) {
      let {
        definition: resolvedDefinition,
        owner: curriedOwner,
        positional,
        named
      } = resolveCurriedValue(value);
      hostDefinition = resolvedDefinition;
      owner = curriedOwner;
      if (positional !== undefined) {
        capturedArgs.positional = positional.concat(outerPositional);
      }
      if (named !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        capturedArgs.named = Object.assign({}, ...named, outerNamed);
      }
    } else {
      hostDefinition = value;
      owner = initialOwner;
    }
    let manager = getInternalModifierManager(hostDefinition);
    if (manager === null) {
      {
        throw new Error('BUG: modifier manager expected');
      }
    }
    let definition = {
      resolvedName: null,
      manager,
      state: hostDefinition
    };
    let state = manager.create(owner, expect(constructing), definition.state, capturedArgs);
    return {
      manager,
      state,
      definition
    };
  });
  let instance = valueForRef(instanceRef);
  let tag = null;
  if (instance !== undefined) {
    let operations = expect(check(vm.fetchValue($t0)));
    operations.addModifier(vm, instance, capturedArgs);
    tag = instance.manager.getTag(instance.state);
    if (tag !== null) {
      consumeTag(tag);
    }
  }
  if (!isConstRef(ref) || tag) {
    let updateOpcode = new UpdateDynamicModifierOpcode(tag, instance, instanceRef);

    // The block must own this opcode, or instances created on update are never destroyed.
    vm.associateDestroyable(updateOpcode);
    return vm.updateWith(updateOpcode);
  }
});
class UpdateModifierOpcode {
  lastUpdated;
  constructor(tag, modifier) {
    this.tag = tag;
    this.modifier = modifier;
    this.lastUpdated = valueForTag(tag);
  }
  evaluate(vm) {
    let {
      modifier,
      tag,
      lastUpdated
    } = this;
    consumeTag(tag);
    if (!validateTag(tag, lastUpdated)) {
      vm.env.scheduleUpdateModifier(modifier);
      this.lastUpdated = valueForTag(tag);
    }
  }
}
class UpdateDynamicModifierOpcode {
  lastUpdated;
  constructor(tag, instance, instanceRef) {
    this.tag = tag;
    this.instance = instance;
    this.instanceRef = instanceRef;
    this.lastUpdated = valueForTag(tag ?? CURRENT_TAG);
  }
  evaluate(vm) {
    let {
      tag,
      lastUpdated,
      instance,
      instanceRef
    } = this;
    let newInstance = valueForRef(instanceRef);
    if (newInstance !== instance) {
      if (instance !== undefined) {
        let destroyable = instance.manager.getDestroyable(instance.state);
        if (destroyable !== null) {
          destroy(destroyable);
        }
      }
      if (newInstance !== undefined) {
        let {
          manager,
          state
        } = newInstance;
        let destroyable = manager.getDestroyable(state);
        if (destroyable !== null) {
          associateDestroyableChild(this, destroyable);
        }
        tag = manager.getTag(state);
        if (tag !== null) {
          this.lastUpdated = valueForTag(tag);
        }
        this.tag = tag;
        vm.env.scheduleInstallModifier(newInstance);
      }
      this.instance = newInstance;
    } else if (tag !== null && !validateTag(tag, lastUpdated)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
      vm.env.scheduleUpdateModifier(instance);
      this.lastUpdated = valueForTag(tag);
    }
    if (tag !== null) {
      consumeTag(tag);
    }
  }
}
APPEND_OPCODES.add(VM_STATIC_ATTR_OP, (vm, {
  op1: _name,
  op2: _value,
  op3: _namespace
}) => {
  let name = vm.constants.getValue(_name);
  let value = vm.constants.getValue(_value);
  let namespace = _namespace ? vm.constants.getValue(_namespace) : null;
  vm.tree().setStaticAttribute(name, value, namespace);
});
APPEND_OPCODES.add(VM_DYNAMIC_ATTR_OP, (vm, {
  op1: _name,
  op2: _trusting,
  op3: _namespace
}) => {
  let name = vm.constants.getValue(_name);
  let trusting = vm.constants.getValue(_trusting);
  let reference = check(vm.stack.pop());
  let value = valueForRef(reference);
  let namespace = _namespace ? vm.constants.getValue(_namespace) : null;
  let attribute = vm.tree().setDynamicAttribute(name, value, trusting, namespace);
  if (!isConstRef(reference)) {
    vm.updateWith(new UpdateDynamicAttributeOpcode(reference, attribute, vm.env));
  }
});
class UpdateDynamicAttributeOpcode {
  updateRef;
  constructor(reference, attribute, env) {
    let initialized = false;
    this.updateRef = createComputeRef(() => {
      let value = valueForRef(reference);
      if (initialized) {
        attribute.update(value, env);
      } else {
        initialized = true;
      }
    });
    valueForRef(this.updateRef);
  }
  evaluate() {
    valueForRef(this.updateRef);
  }
}

/**
 * The VM creates a new ComponentInstance data structure for every component
 * invocation it encounters.
 *
 * Similar to how a ComponentDefinition contains state about all components of a
 * particular type, a ComponentInstance contains state specific to a particular
 * instance of a component type. It also contains a pointer back to its
 * component type's ComponentDefinition.
 */

APPEND_OPCODES.add(VM_PUSH_COMPONENT_DEFINITION_OP, (vm, {
  op1: handle
}) => {
  let definition = vm.constants.getValue(handle);
  let {
    manager,
    capabilities
  } = definition;
  let instance = {
    definition,
    manager,
    capabilities,
    state: null,
    handle: null,
    table: null,
    lookup: null
  };
  vm.stack.push(instance);
});
APPEND_OPCODES.add(VM_RESOLVE_DYNAMIC_COMPONENT_OP, (vm, {
  op1: _isStrict
}) => {
  let stack = vm.stack;
  let ref = check(stack.pop());
  let component = check(valueForRef(ref));
  let constants = vm.constants;
  let owner = vm.getOwner();
  constants.getValue(_isStrict);
  vm.loadValue($t1, null); // Clear the temp register
  let definition;
  if (typeof component === 'string') {
    let resolvedDefinition = resolveComponent(vm.context.resolver, constants, component, owner);
    definition = expect(resolvedDefinition);
  } else if (isCurriedValue(component)) {
    definition = component;
  } else {
    definition = constants.component(component, owner);
  }
  stack.push(definition);
});
APPEND_OPCODES.add(VM_RESOLVE_CURRIED_COMPONENT_OP, vm => {
  let stack = vm.stack;
  let ref = check(stack.pop());
  let value = valueForRef(ref);
  let constants = vm.constants;
  let definition;
  if (isCurriedValue(value)) {
    definition = value;
  } else {
    definition = constants.component(value, vm.getOwner(), true);
  }
  stack.push(definition);
});
APPEND_OPCODES.add(VM_PUSH_DYNAMIC_COMPONENT_INSTANCE_OP, vm => {
  let {
    stack
  } = vm;
  let definition = stack.pop();
  let capabilities, manager;
  if (isCurriedValue(definition)) {
    manager = capabilities = null;
  } else {
    manager = definition.manager;
    capabilities = definition.capabilities;
  }
  stack.push({
    definition,
    capabilities,
    manager,
    state: null,
    handle: null,
    table: null
  });
});
APPEND_OPCODES.add(VM_PUSH_ARGS_OP, (vm, {
  op1: _names,
  op2: _blockNames,
  op3: flags
}) => {
  let stack = vm.stack;
  let names = vm.constants.getArray(_names);
  let positionalCount = flags >> 4;
  let atNames = flags & 0b1000;
  let blockNames = flags & 0b0111 ? vm.constants.getArray(_blockNames) : EMPTY_STRING_ARRAY;
  vm.args.setup(stack, names, blockNames, positionalCount, !!atNames);
  stack.push(vm.args);
});
APPEND_OPCODES.add(VM_PUSH_EMPTY_ARGS_OP, vm => {
  let {
    stack
  } = vm;
  stack.push(vm.args.empty(stack));
});
APPEND_OPCODES.add(VM_CAPTURE_ARGS_OP, vm => {
  let stack = vm.stack;
  let args = check(stack.pop());
  let capturedArgs = args.capture();
  stack.push(capturedArgs);
});
APPEND_OPCODES.add(VM_PREPARE_ARGS_OP, (vm, {
  op1: register
}) => {
  let stack = vm.stack;
  let instance = vm.fetchValue(check(register));
  let args = check(stack.pop());
  let {
    definition
  } = instance;
  if (isCurriedType(definition, CURRIED_COMPONENT)) {
    assert(!definition.manager);
    let constants = vm.constants;
    let {
      definition: resolvedDefinition,
      owner,
      resolved,
      positional,
      named
    } = resolveCurriedValue(definition);
    if (resolved) {
      definition = resolvedDefinition;
    } else if (typeof resolvedDefinition === 'string') {
      let resolvedValue = vm.context.resolver?.lookupComponent?.(resolvedDefinition, owner) ?? null;
      definition = constants.resolvedComponent(expect(resolvedValue), resolvedDefinition);
    } else {
      definition = constants.component(resolvedDefinition, owner);
    }
    if (named !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      args.named.merge(assign({}, ...named));
    }
    if (positional !== undefined) {
      args.realloc(positional.length);
      args.positional.prepend(positional);
    }
    let {
      manager
    } = definition;
    instance.definition = definition;
    instance.manager = manager;
    instance.capabilities = definition.capabilities;

    // Save off the owner that this component was curried with. Later on,
    // we'll fetch the value of this register and set it as the owner on the
    // new root scope.
    vm.loadValue($t1, owner);
  }
  let {
    manager,
    state
  } = definition;
  let capabilities = instance.capabilities;
  if (!managerHasCapability(manager, capabilities, InternalComponentCapabilities.prepareArgs)) {
    stack.push(args);
    return;
  }
  let blocks = args.blocks.values;
  let blockNames = args.blocks.names;
  let preparedArgs = manager.prepareArgs(state, args);
  if (preparedArgs) {
    args.clear();
    for (let i = 0; i < blocks.length; i++) {
      stack.push(blocks[i]);
    }
    let {
      positional,
      named
    } = preparedArgs;
    let positionalCount = positional.length;
    for (let i = 0; i < positionalCount; i++) {
      stack.push(positional[i]);
    }
    let names = Object.keys(named);
    for (let i = 0; i < names.length; i++) {
      stack.push(named[unwrap(names[i])]);
    }
    args.setup(stack, names, blockNames, positionalCount, false);
  }
  stack.push(args);
});
APPEND_OPCODES.add(VM_CREATE_COMPONENT_OP, (vm, {
  op1: flags
}) => {
  let instance = check(vm.fetchValue($s0));
  let {
    definition,
    manager,
    capabilities
  } = instance;
  if (!managerHasCapability(manager, capabilities, InternalComponentCapabilities.createInstance)) {
    // TODO: Closure and Main components are always invoked dynamically, so this
    // opcode may run even if this capability is not enabled. In the future we
    // should handle this in a better way.
    return;
  }
  let dynamicScope = null;
  if (managerHasCapability(manager, capabilities, InternalComponentCapabilities.dynamicScope)) {
    dynamicScope = vm.dynamicScope();
  }
  let hasDefaultBlock = flags & 1;
  let args = null;
  if (managerHasCapability(manager, capabilities, InternalComponentCapabilities.createArgs)) {
    args = check(vm.stack.peek());
  }
  let self = null;
  if (managerHasCapability(manager, capabilities, InternalComponentCapabilities.createCaller)) {
    self = vm.getSelf();
  }
  let state = manager.create(vm.getOwner(), definition.state, args, vm.env, dynamicScope, self, !!hasDefaultBlock);

  // We want to reuse the `state` POJO here, because we know that the opcodes
  // only transition at exactly one place.
  instance.state = state;
  if (managerHasCapability(manager, capabilities, InternalComponentCapabilities.updateHook)) {
    vm.updateWith(new UpdateComponentOpcode(state, manager, dynamicScope));
  }
});
APPEND_OPCODES.add(VM_REGISTER_COMPONENT_DESTRUCTOR_OP, (vm, {
  op1: register
}) => {
  let {
    manager,
    state,
    capabilities
  } = check(vm.fetchValue(check(register, CheckRegister)));
  let d = manager.getDestroyable(state);
  if (d) vm.associateDestroyable(d);
});
APPEND_OPCODES.add(VM_BEGIN_COMPONENT_TRANSACTION_OP, (vm, {
  op1: register
}) => {
  let name;
  vm.beginCacheGroup(name);
  vm.tree().pushAppendingBlock();
});
APPEND_OPCODES.add(VM_PUT_COMPONENT_OPERATIONS_OP, vm => {
  vm.loadValue($t0, new ComponentElementOperations());
});
APPEND_OPCODES.add(VM_COMPONENT_ATTR_OP, (vm, {
  op1: _name,
  op2: _trusting,
  op3: _namespace
}) => {
  let name = vm.constants.getValue(_name);
  let trusting = vm.constants.getValue(_trusting);
  let reference = check(vm.stack.pop());
  let namespace = _namespace ? vm.constants.getValue(_namespace) : null;
  check(vm.fetchValue($t0), CheckInstanceof(ComponentElementOperations)).setAttribute(name, reference, trusting, namespace);
});
APPEND_OPCODES.add(VM_STATIC_COMPONENT_ATTR_OP, (vm, {
  op1: _name,
  op2: _value,
  op3: _namespace
}) => {
  let name = vm.constants.getValue(_name);
  let value = vm.constants.getValue(_value);
  let namespace = _namespace ? vm.constants.getValue(_namespace) : null;
  check(vm.fetchValue($t0), CheckInstanceof(ComponentElementOperations)).setStaticAttribute(name, value, namespace);
});
class ComponentElementOperations {
  attributes = dict();
  classes = [];
  modifiers = [];
  setAttribute(name, value, trusting, namespace) {
    let deferred = {
      value,
      namespace,
      trusting
    };
    if (name === 'class') {
      this.classes.push(value);
    }
    this.attributes[name] = deferred;
  }
  setStaticAttribute(name, value, namespace) {
    let deferred = {
      value,
      namespace
    };
    if (name === 'class') {
      this.classes.push(value);
    }
    this.attributes[name] = deferred;
  }
  addModifier(vm, modifier, capturedArgs) {
    this.modifiers.push(modifier);
    if (vm.env.debugRenderTree !== undefined) {
      const {
        manager,
        definition,
        state
      } = modifier;

      // TODO: we need a stable object for the debugRenderTree as the key, add support for
      // the case where the state is a primitive, or if in practice we always have/require
      // an object, then change the internal types to reflect that
      if (state === null || typeof state !== 'object' && typeof state !== 'function') {
        return;
      }
      let {
        element,
        constructing
      } = vm.tree();
      let name = definition.resolvedName ?? manager.getDebugName(definition.state);
      let instance = manager.getDebugInstance(state);
      let bounds = new ConcreteBounds(element, constructing, constructing);
      vm.env.debugRenderTree.create(state, {
        type: 'modifier',
        name,
        args: capturedArgs,
        instance
      });
      vm.env.debugRenderTree.didRender(state, bounds);

      // For tearing down the debugRenderTree
      vm.associateDestroyable(state);
      vm.updateWith(new DebugRenderTreeUpdateOpcode(state));
      vm.updateWith(new DebugRenderTreeDidRenderOpcode(state, bounds));
      registerDestructor(state, () => {
        vm.env.debugRenderTree?.willDestroy(state);
      });
    }
  }
  flush(vm) {
    let type;
    let attributes = this.attributes;
    for (let name in this.attributes) {
      if (name === 'type') {
        type = attributes[name];
        continue;
      }
      let attr = unwrap(this.attributes[name]);
      if (name === 'class') {
        setDeferredAttr(vm, 'class', mergeClasses(this.classes), attr.namespace, attr.trusting);
      } else {
        setDeferredAttr(vm, name, attr.value, attr.namespace, attr.trusting);
      }
    }
    if (type !== undefined) {
      setDeferredAttr(vm, 'type', type.value, type.namespace, type.trusting);
    }
    return this.modifiers;
  }
}
function mergeClasses(classes) {
  if (classes.length === 0) {
    return '';
  }
  if (classes.length === 1) {
    return unwrap(classes[0]);
  }
  if (allStringClasses(classes)) {
    return classes.join(' ');
  }
  return createClassListRef(classes);
}
function allStringClasses(classes) {
  return classes.every(c => typeof c === 'string');
}
function setDeferredAttr(vm, name, value, namespace, trusting = false) {
  if (typeof value === 'string') {
    vm.tree().setStaticAttribute(name, value, namespace);
  } else {
    let attribute = vm.tree().setDynamicAttribute(name, valueForRef(value), trusting, namespace);
    if (!isConstRef(value)) {
      vm.updateWith(new UpdateDynamicAttributeOpcode(value, attribute, vm.env));
    }
  }
}
APPEND_OPCODES.add(VM_DID_CREATE_ELEMENT_OP, (vm, {
  op1: register
}) => {
  let {
    definition,
    state
  } = check(vm.fetchValue(check(register, CheckRegister)));
  let {
    manager
  } = definition;
  let operations = check(vm.fetchValue($t0));
  manager.didCreateElement(state, expect(vm.tree().constructing), operations);
});
APPEND_OPCODES.add(VM_GET_COMPONENT_SELF_OP, (vm, {
  op1: register,
  op2: _names
}) => {
  let instance = check(vm.fetchValue(check(register, CheckRegister)));
  let {
    definition,
    state
  } = instance;
  let {
    manager
  } = definition;
  let selfRef = manager.getSelf(state);
  if (vm.env.debugRenderTree !== undefined) {
    let instance = check(vm.fetchValue(check(register, CheckRegister)));
    let {
      definition,
      manager
    } = instance;
    let args;
    if (vm.stack.peek() === vm.args) {
      args = vm.args.capture();
    } else {
      let names = vm.constants.getArray(_names);
      vm.args.setup(vm.stack, names, [], 0, true);
      args = vm.args.capture();
    }
    let compilable = definition.compilable;
    if (compilable === null) {
      assert(managerHasCapability(manager, instance.capabilities, InternalComponentCapabilities.dynamicLayout));
      let resolver = vm.context.resolver;
      compilable = resolver === null ? null : manager.getDynamicLayout(state, resolver);
    }

    // For tearing down the debugRenderTree
    vm.associateDestroyable(instance);
    if (hasCustomDebugRenderTreeLifecycle(manager)) {
      let nodes = manager.getDebugCustomRenderTree(instance.definition.state, instance.state, args);
      nodes.forEach(node => {
        let {
          bucket
        } = node;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
        vm.env.debugRenderTree.create(bucket, node);
        registerDestructor(instance, () => {
          vm.env.debugRenderTree?.willDestroy(bucket);
        });
        vm.updateWith(new DebugRenderTreeUpdateOpcode(bucket));
      });
    } else {
      let name = getDebugName(definition, manager);
      vm.env.debugRenderTree.create(instance, {
        type: 'component',
        name,
        args,
        instance: valueForRef(selfRef)
      });
      registerDestructor(instance, () => {
        vm.env.debugRenderTree?.willDestroy(instance);
      });
      vm.updateWith(new DebugRenderTreeUpdateOpcode(instance));
    }
  }
  vm.stack.push(selfRef);
});
APPEND_OPCODES.add(VM_GET_COMPONENT_TAG_NAME_OP, (vm, {
  op1: register
}) => {
  let {
    definition,
    state
  } = check(vm.fetchValue(check(register, CheckRegister)));
  let {
    manager
  } = definition;
  let tagName = manager.getTagName(state);

  // User provided value from JS, so we don't bother to encode
  vm.stack.push(tagName);
});

// Dynamic Invocation Only
APPEND_OPCODES.add(VM_GET_COMPONENT_LAYOUT_OP, (vm, {
  op1: register
}) => {
  let instance = check(vm.fetchValue(check(register, CheckRegister)));
  let {
    manager,
    definition
  } = instance;
  let {
    stack
  } = vm;
  let {
    compilable
  } = definition;
  if (compilable === null) {
    let {
      capabilities
    } = instance;
    assert(managerHasCapability(manager, capabilities, InternalComponentCapabilities.dynamicLayout));
    let resolver = vm.context.resolver;
    compilable = resolver === null ? null : manager.getDynamicLayout(instance.state, resolver);
    if (compilable === null) {
      if (managerHasCapability(manager, capabilities, InternalComponentCapabilities.wrapped)) {
        compilable = unwrapTemplate(vm.constants.defaultTemplate).asWrappedLayout();
      } else {
        compilable = unwrapTemplate(vm.constants.defaultTemplate).asLayout();
      }
    }
  }
  let handle = compilable.compile(vm.context);
  stack.push(compilable.symbolTable);
  stack.push(handle);
});
APPEND_OPCODES.add(VM_MAIN_OP, (vm, {
  op1: register
}) => {
  let definition = check(vm.stack.pop());
  let invocation = check(vm.stack.pop());
  let {
    manager,
    capabilities
  } = definition;
  let state = {
    definition,
    manager,
    capabilities,
    state: null,
    handle: invocation.handle,
    table: invocation.symbolTable,
    lookup: null
  };
  vm.loadValue(check(register), state);
});
APPEND_OPCODES.add(VM_POPULATE_LAYOUT_OP, (vm, {
  op1: register
}) => {
  let {
    stack
  } = vm;

  // In import.meta.env.DEV handles could be ErrHandle objects
  let handle = check(stack.pop());
  let table = check(stack.pop());
  let state = check(vm.fetchValue(check(register, CheckRegister)));
  state.handle = handle;
  state.table = table;
});
APPEND_OPCODES.add(VM_VIRTUAL_ROOT_SCOPE_OP, (vm, {
  op1: register
}) => {
  let {
    table,
    manager,
    capabilities,
    state
  } = check(vm.fetchValue(check(register, CheckRegister)));
  let owner;
  if (managerHasCapability(manager, capabilities, InternalComponentCapabilities.hasSubOwner)) {
    owner = manager.getOwner(state);
    vm.loadValue($t1, null); // Clear the temp register
  } else {
    // Check the temp register to see if an owner was resolved from currying
    owner = vm.fetchValue($t1);
    if (owner === null) {
      // If an owner wasn't found, default to using the current owner. This
      // will happen for normal dynamic component invocation,
      // e.g. <SomeClassicEmberComponent/>
      owner = vm.getOwner();
    } else {
      // Else the owner was found, so clear the temp register. This will happen
      // if we are loading a curried component, e.g. <@someCurriedComponent/>
      vm.loadValue($t1, null);
    }
  }
  vm.pushRootScope(table.symbols.length + 1, owner);
});
APPEND_OPCODES.add(VM_SET_NAMED_VARIABLES_OP, (vm, {
  op1: register
}) => {
  let state = check(vm.fetchValue(check(register, CheckRegister)));
  let scope = vm.scope();
  let args = check(vm.stack.peek());
  let callerNames = args.named.atNames;
  for (let i = callerNames.length - 1; i >= 0; i--) {
    let atName = unwrap(callerNames[i]);
    let symbol = state.table.symbols.indexOf(atName);
    let value = args.named.get(atName, true);
    if (symbol !== -1) scope.bindSymbol(symbol + 1, value);
    if (state.lookup) state.lookup[atName] = value;
  }
});
function bindBlock(symbolName, blockName, state, blocks, vm) {
  let symbol = state.table.symbols.indexOf(symbolName);
  let block = blocks.get(blockName);
  if (symbol !== -1) vm.scope().bindBlock(symbol + 1, block);
  if (state.lookup) state.lookup[symbolName] = block;
}
APPEND_OPCODES.add(VM_SET_BLOCKS_OP, (vm, {
  op1: register
}) => {
  let state = check(vm.fetchValue(check(register, CheckRegister)));
  let {
    blocks
  } = check(vm.stack.peek());
  for (const [i] of enumerate(blocks.names)) {
    bindBlock(unwrap(blocks.symbolNames[i]), unwrap(blocks.names[i]), state, blocks, vm);
  }
});

// Dynamic Invocation Only
APPEND_OPCODES.add(VM_INVOKE_COMPONENT_LAYOUT_OP, (vm, {
  op1: register
}) => {
  let state = check(vm.fetchValue(check(register, CheckRegister)));
  vm.call(state.handle);
});
APPEND_OPCODES.add(VM_DID_RENDER_LAYOUT_OP, (vm, {
  op1: register
}) => {
  let instance = check(vm.fetchValue(check(register, CheckRegister)));
  let {
    manager,
    state,
    capabilities
  } = instance;
  let bounds = vm.tree().popBlock();
  if (vm.env.debugRenderTree !== undefined) {
    if (hasCustomDebugRenderTreeLifecycle(manager)) {
      let nodes = manager.getDebugCustomRenderTree(instance.definition.state, state, EMPTY_ARGS);
      nodes.reverse().forEach(node => {
        let {
          bucket
        } = node;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
        vm.env.debugRenderTree.didRender(bucket, bounds);
        vm.updateWith(new DebugRenderTreeDidRenderOpcode(bucket, bounds));
      });
    } else {
      vm.env.debugRenderTree.didRender(instance, bounds);
      vm.updateWith(new DebugRenderTreeDidRenderOpcode(instance, bounds));
    }
  }
  if (managerHasCapability(manager, capabilities, InternalComponentCapabilities.createInstance)) {
    let mgr = check(manager);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- @fixme
    mgr.didRenderLayout(state, bounds);
    vm.env.didCreate(instance);
    vm.updateWith(new DidUpdateLayoutOpcode(instance, bounds));
  }
});
APPEND_OPCODES.add(VM_COMMIT_COMPONENT_TRANSACTION_OP, vm => {
  vm.commitCacheGroup();
});
class UpdateComponentOpcode {
  constructor(component, manager, dynamicScope) {
    this.component = component;
    this.manager = manager;
    this.dynamicScope = dynamicScope;
  }
  evaluate(_vm) {
    let {
      component,
      manager,
      dynamicScope
    } = this;
    manager.update(component, dynamicScope);
  }
}
class DidUpdateLayoutOpcode {
  constructor(component, bounds) {
    this.component = component;
    this.bounds = bounds;
  }
  evaluate(vm) {
    let {
      component,
      bounds
    } = this;
    let {
      manager,
      state
    } = component;
    manager.didUpdateLayout(state, bounds);
    vm.env.didUpdate(component);
  }
}
class DebugRenderTreeUpdateOpcode {
  constructor(bucket) {
    this.bucket = bucket;
  }
  evaluate(vm) {
    vm.env.debugRenderTree?.update(this.bucket);
  }
}
class DebugRenderTreeDidRenderOpcode {
  constructor(bucket, bounds) {
    this.bucket = bucket;
    this.bounds = bounds;
  }
  evaluate(vm) {
    vm.env.debugRenderTree?.didRender(this.bucket, this.bounds);
  }
}

class ReferenceChecker {
  validate(value) {
    return typeof value === 'object' && value !== null && REFERENCE in value;
  }
  expected() {
    return `Reference`;
  }
}
const CheckReference = new ReferenceChecker();

/*
  The calling convention is:

  * 0-N block arguments at the bottom
  * 0-N positional arguments next (left-to-right)
  * 0-N named arguments next
*/

class VMArgumentsImpl {
  stack = null;
  positional = new PositionalArgumentsImpl();
  named = new NamedArgumentsImpl();
  blocks = new BlockArgumentsImpl();
  constructor() {
    setLocalDebugType('args', this);
  }
  empty(stack) {
    let base = stack.registers[$sp] + 1;
    this.named.empty(stack, base);
    this.positional.empty(stack, base);
    this.blocks.empty(stack, base);
    return this;
  }
  setup(stack, names, blockNames, positionalCount, atNames) {
    this.stack = stack;

    /*
           | ... | blocks      | positional  | named |
           | ... | b0    b1    | p0 p1 p2 p3 | n0 n1 |
     index | ... | 4/5/6 7/8/9 | 10 11 12 13 | 14 15 |
                   ^             ^             ^  ^
                 bbase         pbase       nbase  sp
    */

    let named = this.named;
    let namedCount = names.length;
    let namedBase = stack.registers[$sp] - namedCount + 1;
    named.setup(stack, namedBase, namedCount, names, atNames);
    let positional = this.positional;
    let positionalBase = namedBase - positionalCount;
    positional.setup(stack, positionalBase, positionalCount);
    let blocks = this.blocks;
    let blocksCount = blockNames.length;
    let blocksBase = positionalBase - blocksCount * 3;
    blocks.setup(stack, blocksBase, blocksCount, blockNames);
  }
  get base() {
    return this.blocks.base;
  }
  get length() {
    return this.positional.length + this.named.length + this.blocks.length * 3;
  }
  at(pos) {
    return this.positional.at(pos);
  }
  realloc(offset) {
    let {
      stack
    } = this;
    if (offset > 0 && stack !== null) {
      let {
        positional,
        named
      } = this;
      let newBase = positional.base + offset;
      let length = positional.length + named.length;
      for (let i = length - 1; i >= 0; i--) {
        stack.copy(i + positional.base, i + newBase);
      }
      positional.base += offset;
      named.base += offset;
      stack.registers[$sp] += offset;
    }
  }
  capture() {
    let positional = this.positional.length === 0 ? EMPTY_POSITIONAL : this.positional.capture();
    let named = this.named.length === 0 ? EMPTY_NAMED : this.named.capture();
    return {
      named,
      positional
    };
  }
  clear() {
    let {
      stack,
      length
    } = this;
    if (length > 0 && stack !== null) stack.pop(length);
  }
}
const EMPTY_REFERENCES = emptyArray();
class PositionalArgumentsImpl {
  base = 0;
  length = 0;
  stack = null;
  _references = null;
  constructor() {
    setLocalDebugType('args:positional', this);
  }
  empty(stack, base) {
    this.stack = stack;
    this.base = base;
    this.length = 0;
    this._references = EMPTY_REFERENCES;
  }
  setup(stack, base, length) {
    this.stack = stack;
    this.base = base;
    this.length = length;
    if (length === 0) {
      this._references = EMPTY_REFERENCES;
    } else {
      this._references = null;
    }
  }
  at(position) {
    let {
      base,
      length,
      stack
    } = this;
    if (position < 0 || position >= length) {
      return UNDEFINED_REFERENCE;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
    return check(stack.get(position, base));
  }
  capture() {
    return this.references;
  }
  prepend(other) {
    let additions = other.length;
    if (additions > 0) {
      let {
        base,
        length,
        stack
      } = this;
      this.base = base = base - additions;
      this.length = length + additions;
      for (let i = 0; i < additions; i++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
        stack.set(other[i], i, base);
      }
      this._references = null;
    }
  }
  get references() {
    let references = this._references;
    if (!references) {
      let {
        stack,
        base,
        length
      } = this;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
      references = this._references = stack.slice(base, base + length);
    }
    return references;
  }
}
class NamedArgumentsImpl {
  base = 0;
  length = 0;
  _references = null;
  _names = EMPTY_STRING_ARRAY;
  _atNames = EMPTY_STRING_ARRAY;
  constructor() {
    setLocalDebugType('args:named', this);
  }
  empty(stack, base) {
    this.stack = stack;
    this.base = base;
    this.length = 0;
    this._references = EMPTY_REFERENCES;
    this._names = EMPTY_STRING_ARRAY;
    this._atNames = EMPTY_STRING_ARRAY;
  }
  setup(stack, base, length, names, atNames) {
    this.stack = stack;
    this.base = base;
    this.length = length;
    if (length === 0) {
      this._references = EMPTY_REFERENCES;
      this._names = EMPTY_STRING_ARRAY;
      this._atNames = EMPTY_STRING_ARRAY;
    } else {
      this._references = null;
      if (atNames) {
        this._names = null;
        this._atNames = names;
      } else {
        this._names = names;
        this._atNames = null;
      }
    }
  }
  get names() {
    let names = this._names;
    if (!names) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
      names = this._names = this._atNames.map(this.toSyntheticName);
    }
    return names;
  }
  get atNames() {
    let atNames = this._atNames;
    if (!atNames) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
      atNames = this._atNames = this._names.map(this.toAtName);
    }
    return atNames;
  }
  has(name) {
    return this.names.indexOf(name) !== -1;
  }
  get(name, atNames = false) {
    let {
      base,
      stack
    } = this;
    let names = atNames ? this.atNames : this.names;
    let idx = names.indexOf(name);
    if (idx === -1) {
      return UNDEFINED_REFERENCE;
    }
    let ref = stack.get(idx, base);
    {
      return ref;
    }
  }
  capture() {
    let {
      names,
      references
    } = this;
    let map = dict();
    for (const [i, name] of enumerate(names)) {
      {
        map[name] = unwrap(references[i]);
      }
    }
    return map;
  }
  merge(other) {
    let keys = Object.keys(other);
    if (keys.length > 0) {
      let {
        names,
        length,
        stack
      } = this;
      let newNames = names.slice();
      for (const name of keys) {
        let idx = newNames.indexOf(name);
        if (idx === -1) {
          length = newNames.push(name);
          stack.push(other[name]);
        }
      }
      this.length = length;
      this._references = null;
      this._names = newNames;
      this._atNames = null;
    }
  }
  get references() {
    let references = this._references;
    if (!references) {
      let {
        base,
        length,
        stack
      } = this;
      references = this._references = stack.slice(base, base + length);
    }
    return references;
  }
  toSyntheticName(name) {
    return name.slice(1);
  }
  toAtName(name) {
    return `@${name}`;
  }
}
function toSymbolName(name) {
  return `&${name}`;
}
const EMPTY_BLOCK_VALUES = emptyArray();
class BlockArgumentsImpl {
  internalValues = null;
  _symbolNames = null;
  internalTag = null;
  names = EMPTY_STRING_ARRAY;
  length = 0;
  base = 0;
  constructor() {
    setLocalDebugType('args:blocks', this);
  }
  empty(stack, base) {
    this.stack = stack;
    this.names = EMPTY_STRING_ARRAY;
    this.base = base;
    this.length = 0;
    this._symbolNames = null;
    this.internalTag = CONSTANT_TAG;
    this.internalValues = EMPTY_BLOCK_VALUES;
  }
  setup(stack, base, length, names) {
    this.stack = stack;
    this.names = names;
    this.base = base;
    this.length = length;
    this._symbolNames = null;
    if (length === 0) {
      this.internalTag = CONSTANT_TAG;
      this.internalValues = EMPTY_BLOCK_VALUES;
    } else {
      this.internalTag = null;
      this.internalValues = null;
    }
  }
  get values() {
    let values = this.internalValues;
    if (!values) {
      let {
        base,
        length,
        stack
      } = this;
      values = this.internalValues = stack.slice(base, base + length * 3);
    }
    return values;
  }
  has(name) {
    return this.names.indexOf(name) !== -1;
  }
  get(name) {
    let idx = this.names.indexOf(name);
    if (idx === -1) {
      return null;
    }
    let {
      base,
      stack
    } = this;
    let table = check(stack.get(idx * 3, base));
    let scope = check(stack.get(idx * 3 + 1, base));
    let handle = check(stack.get(idx * 3 + 2, base));
    return handle === null ? null : [handle, scope, table];
  }
  capture() {
    return new CapturedBlockArgumentsImpl(this.names, this.values);
  }
  get symbolNames() {
    let symbolNames = this._symbolNames;
    if (symbolNames === null) {
      symbolNames = this._symbolNames = this.names.map(toSymbolName);
    }
    return symbolNames;
  }
}
class CapturedBlockArgumentsImpl {
  length;
  constructor(names, values) {
    this.names = names;
    this.values = values;
    this.length = names.length;
  }
  has(name) {
    return this.names.indexOf(name) !== -1;
  }
  get(name) {
    let idx = this.names.indexOf(name);
    if (idx === -1) return null;
    return [this.values[idx * 3 + 2], this.values[idx * 3 + 1], this.values[idx * 3]];
  }
}
function createCapturedArgs(named, positional) {
  return {
    named,
    positional
  };
}
function reifyNamed(named) {
  let reified = dict();
  for (const [key, value] of Object.entries(named)) {
    reified[key] = valueForRef(value);
  }
  return reified;
}
function reifyPositional(positional) {
  return positional.map(valueForRef);
}
function reifyArgs(args) {
  return {
    named: reifyNamed(args.named),
    positional: reifyPositional(args.positional)
  };
}
const ARGUMENT_ERROR = Symbol('ARGUMENT_ERROR');
function isArgumentError(arg) {
  return arg !== null && typeof arg === 'object' && arg[ARGUMENT_ERROR];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ArgumentErrorImpl(error) {
  return {
    [ARGUMENT_ERROR]: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    error
  };
}
function reifyNamedDebug(named) {
  let reified = dict();
  for (const [key, value] of Object.entries(named)) {
    try {
      reified[key] = valueForRef(value);
    } catch (e) {
      reified[key] = ArgumentErrorImpl(e);
    }
  }
  return reified;
}
function reifyPositionalDebug(positional) {
  return positional.map(p => {
    try {
      return valueForRef(p);
    } catch (e) {
      return ArgumentErrorImpl(e);
    }
  });
}
function reifyArgsDebug(args) {
  let named = reifyNamedDebug(args.named);
  let positional = reifyPositionalDebug(args.positional);
  return {
    named,
    positional
  };
}
const EMPTY_NAMED = Object.freeze(Object.create(null));
const EMPTY_POSITIONAL = EMPTY_REFERENCES;
const EMPTY_ARGS = createCapturedArgs(EMPTY_NAMED, EMPTY_POSITIONAL);

export { APPEND_OPCODES as A, BeginTrackFrameOpcode as B, CurriedValue as C, DebugRenderTreeImpl as D, EMPTY_ARGS as E, JumpIfNotModifiedOpcode as J, VMArgumentsImpl as V, EMPTY_NAMED as a, EMPTY_POSITIONAL as b, createCapturedArgs as c, curry as d, reifyNamed as e, reifyPositional as f, check as g, isCurriedType as h, isArgumentError as i, resolveCurriedValue as j, AssertFilter as k, externs as l, EndTrackFrameOpcode as m, reifyArgs as r };
