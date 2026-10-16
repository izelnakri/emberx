import { a as assign } from './object-utils-AijlD-JH.js';
import { b as EMPTY_STRING_ARRAY, E as EMPTY_ARRAY, e as enumerate, r as reverse } from './array-utils-CZQxrdD3.js';
import { r as VM_PRIMITIVE_OP, aD as encodeHandle, at as VM_CONCAT_OP, ak as VM_GET_VARIABLE_OP, q as VM_CONSTANT_REFERENCE_OP, ao as VM_GET_PROPERTY_OP, ar as VM_HAS_BLOCK_OP, aq as VM_SPREAD_BLOCK_OP, E as VM_COMPILE_BLOCK_OP, as as VM_HAS_BLOCK_PARAMS_OP, au as VM_IF_INLINE_OP, av as VM_NOT_OP, aw as VM_GET_DYNAMIC_VAR_OP, ax as VM_LOG_OP, y as VM_FETCH_OP, u as VM_PRIMITIVE_REFERENCE_OP, aj as VM_HELPER_OP, v as VM_DUP_OP, ai as VM_DYNAMIC_HELPER_OP, w as VM_POP_OP, _ as VM_CAPTURE_ARGS_OP, ah as VM_CURRY_OP, aE as isSmallInt, aF as encodeImmediate, m as VM_PUSH_DYNAMIC_SCOPE_OP, z as VM_BIND_DYNAMIC_SCOPE_OP, n as VM_POP_DYNAMIC_SCOPE_OP, ap as VM_GET_BLOCK_OP, F as VM_INVOKE_YIELD_OP, l as VM_POP_SCOPE_OP, k as VM_CHILD_SCOPE_OP, al as VM_SET_VARIABLE_OP, o as VM_CONSTANT_OP, D as VM_PUSH_BLOCK_SCOPE_OP, C as VM_PUSH_SYMBOL_TABLE_OP, Z as VM_PUSH_EMPTY_ARGS_OP, Y as VM_PUSH_ARGS_OP, A as VM_ENTER_OP, H as VM_JUMP_EQ_OP, B as VM_EXIT_OP, G as VM_JUMP_UNLESS_OP, W as VM_PUSH_COMPONENT_DEFINITION_OP, x as VM_LOAD_OP, a2 as VM_BEGIN_COMPONENT_TRANSACTION_OP, a0 as VM_CREATE_COMPONENT_OP, a1 as VM_REGISTER_COMPONENT_DESTRUCTOR_OP, a7 as VM_GET_COMPONENT_SELF_OP, an as VM_ROOT_SCOPE_OP, am as VM_SET_BLOCK_OP, af as VM_DID_RENDER_LAYOUT_OP, ag as VM_COMMIT_COMPONENT_TRANSACTION_OP, $ as VM_PREPARE_ARGS_OP, ab as VM_VIRTUAL_ROOT_SCOPE_OP, ac as VM_SET_NAMED_VARIABLES_OP, ad as VM_SET_BLOCKS_OP, ae as VM_INVOKE_COMPONENT_LAYOUT_OP, a3 as VM_PUT_COMPONENT_OPERATIONS_OP, M as VM_OPEN_DYNAMIC_ELEMENT_OP, a6 as VM_DID_CREATE_ELEMENT_OP, P as VM_FLUSH_ELEMENT_OP, Q as VM_CLOSE_ELEMENT_OP, e as VM_RESOLVE_CURRIED_COMPONENT_OP, X as VM_RESOLVE_DYNAMIC_COMPONENT_OP, f as VM_PUSH_DYNAMIC_COMPONENT_INSTANCE_OP, a9 as VM_GET_COMPONENT_LAYOUT_OP, aa as VM_POPULATE_LAYOUT_OP, a8 as VM_GET_COMPONENT_TAG_NAME_OP, K as VM_COMMENT_OP, R as VM_MODIFIER_OP, S as VM_DYNAMIC_MODIFIER_OP, T as VM_STATIC_ATTR_OP, a5 as VM_STATIC_COMPONENT_ATTR_OP, U as VM_DYNAMIC_ATTR_OP, a4 as VM_COMPONENT_ATTR_OP, L as VM_OPEN_ELEMENT_OP, az as VM_DEBUGGER_OP, J as VM_TEXT_OP, b as VM_ASSERT_SAME_OP, ay as VM_DYNAMIC_CONTENT_TYPE_OP, N as VM_PUSH_REMOTE_ELEMENT_OP, O as VM_POP_REMOTE_ELEMENT_OP, I as VM_TO_BOOLEAN_OP, aA as VM_ENTER_LIST_OP, aC as VM_ITERATE_OP, aB as VM_EXIT_LIST_OP } from './syscall-ops-CkPT1Kfx.js';
import { b as VM_RETURN_OP, i as isMachineOp, f as VM_PUSH_FRAME_OP, e as VM_POP_FRAME_OP, d as VM_INVOKE_VIRTUAL_OP, c as VM_JUMP_OP, a as VM_RETURN_TO_OP, V as VM_INVOKE_STATIC_OP } from './vm-ops-ImHv0Wtg.js';
import { e as expect, u as unwrap, S as StackImpl, a as isPresentArray, d as dict } from './collections-GpG8lT2g.js';
import { a as assert } from './assert-Zqc4wiAV.js';
import { InstructionEncoderImpl } from '../@glimmer/encoder/index.js';
import { A as ARG_SHIFT, M as MACHINE_MASK, I as InternalComponentCapabilities } from './flags-BZxHQ0yn.js';
import { o as opcodes } from './opcodes-DDajoGhq.js';
import { a as $v0, f as $fp, $ as $s0, g as $sp, h as $s1 } from './registers-C_W2qYHJ.js';
import { ContentType } from '../@glimmer/vm/index.js';
import { h as hasCapability } from './capabilities-BuVYh-vx.js';

function isGetLikeTuple(opcode) {
  return Array.isArray(opcode) && opcode.length === 2;
}
function makeResolutionTypeVerifier(typeToVerify) {
  return opcode => {
    if (!isGetLikeTuple(opcode)) return false;
    let type = opcode[0];
    return type === opcodes.GetStrictKeyword || type === opcodes.GetLexicalSymbol || type === typeToVerify;
  };
}
const isGetFreeComponent = makeResolutionTypeVerifier(opcodes.GetFreeAsComponentHead);
const isGetFreeModifier = makeResolutionTypeVerifier(opcodes.GetFreeAsModifierHead);
const isGetFreeHelper = makeResolutionTypeVerifier(opcodes.GetFreeAsHelperHead);
const isGetFreeComponentOrHelper = makeResolutionTypeVerifier(opcodes.GetFreeAsComponentOrHelperHead);
function assertResolverInvariants(meta) {
  return meta;
}

/**
 * <Foo/>
 * <Foo></Foo>
 * <Foo @arg={{true}} />
 */
function resolveComponent(resolver, constants, meta, [, expr, then]) {
  assert(isGetFreeComponent(expr));
  let type = expr[0];
  if (type === opcodes.GetLexicalSymbol) {
    let {
      scopeValues,
      owner,
      symbols: {
        lexical
      }
    } = meta;
    let definition = expect(scopeValues)[expr[1]];
    then(constants.component(definition, expect(owner), false, lexical?.at(expr[1])));
  } else {
    let {
      symbols: {
        upvars
      },
      owner
    } = assertResolverInvariants(meta);
    let name = unwrap(upvars[expr[1]]);
    let definition = resolver?.lookupComponent?.(name, owner) ?? null;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
    then(constants.resolvedComponent(definition, name));
  }
}

/**
 * (helper)
 * (helper arg)
 */
function resolveHelper(resolver, constants, meta, [, expr, then]) {
  assert(isGetFreeHelper(expr));
  let type = expr[0];
  if (type === opcodes.GetLexicalSymbol) {
    let {
      scopeValues
    } = meta;
    let definition = expect(scopeValues)[expr[1]];
    then(constants.helper(definition));
  } else if (type === opcodes.GetStrictKeyword) {
    then(lookupBuiltInHelper(expr, resolver, meta, constants));
  } else {
    let {
      symbols: {
        upvars
      },
      owner
    } = assertResolverInvariants(meta);
    let name = unwrap(upvars[expr[1]]);
    let helper = resolver?.lookupHelper?.(name, owner) ?? null;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
    then(constants.helper(helper, name));
  }
}

/**
 * <div {{modifier}}/>
 * <div {{modifier arg}}/>
 * <Foo {{modifier}}/>
 */
function resolveModifier(resolver, constants, meta, [, expr, then]) {
  assert(isGetFreeModifier(expr));
  let type = expr[0];
  if (type === opcodes.GetLexicalSymbol) {
    let {
      scopeValues,
      symbols: {
        lexical
      }
    } = meta;
    let definition = expect(scopeValues)[expr[1]];
    then(constants.modifier(definition, lexical?.at(expr[1]) ?? undefined));
  } else if (type === opcodes.GetStrictKeyword) {
    let {
      symbols: {
        upvars
      }
    } = assertResolverInvariants(meta);
    let name = unwrap(upvars[expr[1]]);
    let modifier = resolver?.lookupBuiltInModifier?.(name) ?? null;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
    then(constants.modifier(modifier, name));
  } else {
    let {
      symbols: {
        upvars
      },
      owner
    } = assertResolverInvariants(meta);
    let name = unwrap(upvars[expr[1]]);
    let modifier = resolver?.lookupModifier?.(name, owner) ?? null;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
    then(constants.modifier(modifier));
  }
}

/**
 * {{component-or-helper arg}}
 */
function resolveComponentOrHelper(resolver, constants, meta, [, expr, {
  ifComponent,
  ifHelper
}]) {
  assert(isGetFreeComponentOrHelper(expr));
  let type = expr[0];
  if (type === opcodes.GetLexicalSymbol) {
    let {
      scopeValues,
      owner,
      symbols: {
        lexical
      }
    } = meta;
    let definition = expect(scopeValues)[expr[1]];
    let component = constants.component(definition, expect(owner), true, lexical?.at(expr[1]));
    if (component !== null) {
      ifComponent(component);
      return;
    }
    let helper = constants.helper(definition, null, true);
    ifHelper(expect(helper));
  } else if (type === opcodes.GetStrictKeyword) {
    ifHelper(lookupBuiltInHelper(expr, resolver, meta, constants));
  } else {
    let {
      symbols: {
        upvars
      },
      owner
    } = assertResolverInvariants(meta);
    let name = unwrap(upvars[expr[1]]);
    let definition = resolver?.lookupComponent?.(name, owner) ?? null;
    if (definition !== null) {
      ifComponent(constants.resolvedComponent(definition, name));
    } else {
      let helper = resolver?.lookupHelper?.(name, owner) ?? null;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
      ifHelper(constants.helper(helper, name));
    }
  }
}

/**
 * {{maybeHelperOrComponent}}
 */
function resolveOptionalComponentOrHelper(resolver, constants, meta, [, expr, {
  ifComponent,
  ifHelper,
  ifValue
}]) {
  assert(isGetFreeComponentOrHelper(expr));
  let type = expr[0];
  if (type === opcodes.GetLexicalSymbol) {
    let {
      scopeValues,
      owner,
      symbols: {
        lexical
      }
    } = meta;
    let definition = expect(scopeValues)[expr[1]];
    if (typeof definition !== 'function' && (typeof definition !== 'object' || definition === null)) {
      // The value is not an object, so it can't be a component or helper.
      ifValue(constants.value(definition));
      return;
    }
    let component = constants.component(definition, expect(owner), true, lexical?.at(expr[1]));
    if (component !== null) {
      ifComponent(component);
      return;
    }
    let helper = constants.helper(definition, null, true);
    if (helper !== null) {
      ifHelper(helper);
      return;
    }
    ifValue(constants.value(definition));
  } else if (type === opcodes.GetStrictKeyword) {
    ifHelper(lookupBuiltInHelper(expr, resolver, meta, constants));
  } else {
    let {
      symbols: {
        upvars
      },
      owner
    } = assertResolverInvariants(meta);
    let name = unwrap(upvars[expr[1]]);
    let definition = resolver?.lookupComponent?.(name, owner) ?? null;
    if (definition !== null) {
      ifComponent(constants.resolvedComponent(definition, name));
      return;
    }
    let helper = resolver?.lookupHelper?.(name, owner) ?? null;
    if (helper !== null) {
      ifHelper(constants.helper(helper, name));
    }
  }
}
function lookupBuiltInHelper(expr, resolver, meta, constants, type) {
  let {
    symbols: {
      upvars
    }
  } = assertResolverInvariants(meta);
  let name = unwrap(upvars[expr[1]]);
  let helper = resolver?.lookupBuiltInHelper?.(name) ?? null;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
  return constants.helper(helper, name);
}

const HighLevelResolutionOpcodes = {
  Modifier: 1003,
  Component: 1004,
  Helper: 1005,
  ComponentOrHelper: 1007,
  OptionalComponentOrHelper: 1008,
  Local: 1010,
  TemplateLocal: 1011
};
const HighLevelBuilderOpcodes = {
  Label: 1000,
  StartLabels: 1001,
  StopLabels: 1002,
  Start: 1000};

const HighLevelOperands = {
  Label: 1,
  IsStrictMode: 2,
  DebugSymbols: 3,
  Block: 4,
  StdLib: 5,
  NonSmallInt: 6,
  SymbolTable: 7,
  Layout: 8
};
function labelOperand(value) {
  return {
    type: HighLevelOperands.Label,
    value
  };
}
function debugSymbolsOperand(locals, upvars, lexical) {
  return {
    type: HighLevelOperands.DebugSymbols,
    value: {
      locals,
      upvars,
      lexical
    }
  };
}
function isStrictMode() {
  return {
    type: HighLevelOperands.IsStrictMode,
    value: undefined
  };
}
function blockOperand(value) {
  return {
    type: HighLevelOperands.Block,
    value
  };
}
function stdlibOperand(value) {
  return {
    type: HighLevelOperands.StdLib,
    value
  };
}
function nonSmallIntOperand(value) {
  return {
    type: HighLevelOperands.NonSmallInt,
    value
  };
}
function symbolTableOperand(value) {
  return {
    type: HighLevelOperands.SymbolTable,
    value
  };
}
function layoutOperand(value) {
  return {
    type: HighLevelOperands.Layout,
    value
  };
}

class Labels {
  labels = dict();
  targets = [];
  label(name, index) {
    this.labels[name] = index;
  }
  target(at, target) {
    this.targets.push({
      at,
      target
    });
  }
  patch(heap) {
    let {
      targets,
      labels
    } = this;
    for (const {
      at,
      target
    } of targets) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
      let address = labels[target] - at;
      assert(heap.getbyaddr(at) === -1);
      heap.setbyaddr(at, address);
    }
  }
}
function encodeOp(encoder, context, meta, op) {
  let {
    program: {
      constants
    },
    resolver
  } = context;
  if (isBuilderOpcode(op[0])) {
    let [type, ...operands] = op;
    encoder.push(constants, type, ...operands);
  } else {
    switch (op[0]) {
      case HighLevelBuilderOpcodes.Label:
        return encoder.label(op[1]);
      case HighLevelBuilderOpcodes.StartLabels:
        return encoder.startLabels();
      case HighLevelBuilderOpcodes.StopLabels:
        return encoder.stopLabels();
      case HighLevelResolutionOpcodes.Component:
        return resolveComponent(resolver, constants, meta, op);
      case HighLevelResolutionOpcodes.Modifier:
        return resolveModifier(resolver, constants, meta, op);
      case HighLevelResolutionOpcodes.Helper:
        return resolveHelper(resolver, constants, meta, op);
      case HighLevelResolutionOpcodes.ComponentOrHelper:
        return resolveComponentOrHelper(resolver, constants, meta, op);
      case HighLevelResolutionOpcodes.OptionalComponentOrHelper:
        return resolveOptionalComponentOrHelper(resolver, constants, meta, op);
      case HighLevelResolutionOpcodes.Local:
        {
          let [, freeVar, andThen] = op;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
          let name = expect(meta.symbols.upvars)[freeVar];
          andThen(name, meta.moduleName);
          break;
        }
      case HighLevelResolutionOpcodes.TemplateLocal:
        {
          let [, valueIndex, then] = op;
          let value = expect(meta.scopeValues)[valueIndex];
          then(constants.value(value));
          break;
        }
      default:
        throw new Error(`Unexpected high level opcode ${op[0]}`);
    }
  }
}
class EncoderImpl {
  labelsStack = new StackImpl();
  encoder = new InstructionEncoderImpl([]);
  errors = [];
  handle;
  constructor(heap, meta, stdlib) {
    this.heap = heap;
    this.meta = meta;
    this.stdlib = stdlib;
    this.handle = heap.malloc();
  }
  error(error) {
    this.encoder.encode(VM_PRIMITIVE_OP, 0);
    this.errors.push(error);
  }
  commit(size) {
    let handle = this.handle;
    this.heap.pushMachine(VM_RETURN_OP);
    this.heap.finishMalloc(handle, size);
    if (isPresentArray(this.errors)) {
      return {
        errors: this.errors,
        handle
      };
    } else {
      return handle;
    }
  }
  push(constants, type, ...args) {
    let {
      heap
    } = this;
    let machine = isMachineOp(type) ? MACHINE_MASK : 0;
    let first = type | machine | args.length << ARG_SHIFT;
    heap.pushRaw(first);
    for (let i = 0; i < args.length; i++) {
      let op = args[i];
      heap.pushRaw(this.operand(constants, op));
    }
  }
  operand(constants, operand) {
    if (typeof operand === 'number') {
      return operand;
    }
    if (typeof operand === 'object' && operand !== null) {
      if (Array.isArray(operand)) {
        return encodeHandle(constants.array(operand));
      } else {
        switch (operand.type) {
          case HighLevelOperands.Label:
            this.currentLabels.target(this.heap.offset, operand.value);
            return -1;
          case HighLevelOperands.IsStrictMode:
            return encodeHandle(constants.value(this.meta.isStrictMode));
          case HighLevelOperands.DebugSymbols:
            return encodeHandle(constants.value(operand.value));
          case HighLevelOperands.Block:
            return encodeHandle(constants.value(compilableBlock(operand.value, this.meta)));
          case HighLevelOperands.StdLib:
            return expect(this.stdlib)[operand.value];
          case HighLevelOperands.NonSmallInt:
          case HighLevelOperands.SymbolTable:
          case HighLevelOperands.Layout:
            return constants.value(operand.value);
        }
      }
    }
    return encodeHandle(constants.value(operand));
  }
  get currentLabels() {
    return expect(this.labelsStack.current);
  }
  label(name) {
    this.currentLabels.label(name, this.heap.offset + 1);
  }
  startLabels() {
    this.labelsStack.push(new Labels());
  }
  stopLabels() {
    let label = expect(this.labelsStack.pop());
    label.patch(this.heap);
  }
}
function isBuilderOpcode(op) {
  return op < HighLevelBuilderOpcodes.Start;
}

function templateCompilationContext(evaluation, meta) {
  let encoder = new EncoderImpl(evaluation.program.heap, meta, evaluation.stdlib);
  return {
    evaluation,
    encoder,
    meta
  };
}

class Compilers {
  names = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  funcs = [];
  add(name, func) {
    this.names[name] = this.funcs.push(func) - 1;
  }
  compile(op, sexp) {
    let name = sexp[0];
    let index = unwrap(this.names[name]);
    let func = this.funcs[index];
    assert(func, `expected an implementation for ${sexp[0]}`);
    func(op, sexp);
  }
}

const EXPRESSIONS = new Compilers();
EXPRESSIONS.add(opcodes.Concat, (op, [, parts]) => {
  for (let part of parts) {
    expr(op, part);
  }
  op(VM_CONCAT_OP, parts.length);
});
EXPRESSIONS.add(opcodes.Call, (op, [, expression, positional, named]) => {
  if (isGetFreeHelper(expression)) {
    op(HighLevelResolutionOpcodes.Helper, expression, handle => {
      Call(op, handle, positional, named);
    });
  } else {
    expr(op, expression);
    CallDynamic(op, positional, named);
  }
});
EXPRESSIONS.add(opcodes.Curry, (op, [, expr, type, positional, named]) => {
  Curry(op, type, expr, positional, named);
});
EXPRESSIONS.add(opcodes.GetSymbol, (op, [, sym, path]) => {
  op(VM_GET_VARIABLE_OP, sym);
  withPath(op, path);
});
EXPRESSIONS.add(opcodes.GetLexicalSymbol, (op, [, sym, path]) => {
  op(HighLevelResolutionOpcodes.TemplateLocal, sym, handle => {
    op(VM_CONSTANT_REFERENCE_OP, handle);
    withPath(op, path);
  });
});
EXPRESSIONS.add(opcodes.GetStrictKeyword, (op, expr) => {
  op(HighLevelResolutionOpcodes.Local, expr[1], _name => {
    op(HighLevelResolutionOpcodes.Helper, expr, handle => {
      Call(op, handle, null, null);
    });
  });
});
EXPRESSIONS.add(opcodes.GetFreeAsHelperHead, (op, expr) => {
  op(HighLevelResolutionOpcodes.Local, expr[1], _name => {
    op(HighLevelResolutionOpcodes.Helper, expr, handle => {
      Call(op, handle, null, null);
    });
  });
});
function withPath(op, path) {
  if (path === undefined || path.length === 0) return;
  for (let i = 0; i < path.length; i++) {
    op(VM_GET_PROPERTY_OP, path[i]);
  }
}
EXPRESSIONS.add(opcodes.Undefined, op => PushPrimitiveReference(op, undefined));
EXPRESSIONS.add(opcodes.HasBlock, (op, [, block]) => {
  expr(op, block);
  op(VM_HAS_BLOCK_OP);
});
EXPRESSIONS.add(opcodes.HasBlockParams, (op, [, block]) => {
  expr(op, block);
  op(VM_SPREAD_BLOCK_OP);
  op(VM_COMPILE_BLOCK_OP);
  op(VM_HAS_BLOCK_PARAMS_OP);
});
EXPRESSIONS.add(opcodes.IfInline, (op, [, condition, truthy, falsy]) => {
  // Push in reverse order
  expr(op, falsy);
  expr(op, truthy);
  expr(op, condition);
  op(VM_IF_INLINE_OP);
});
EXPRESSIONS.add(opcodes.Not, (op, [, value]) => {
  expr(op, value);
  op(VM_NOT_OP);
});
EXPRESSIONS.add(opcodes.GetDynamicVar, (op, [, expression]) => {
  expr(op, expression);
  op(VM_GET_DYNAMIC_VAR_OP);
});
EXPRESSIONS.add(opcodes.Log, (op, [, positional]) => {
  op(VM_PUSH_FRAME_OP);
  SimpleArgs(op, positional, null, false);
  op(VM_LOG_OP);
  op(VM_POP_FRAME_OP);
  op(VM_FETCH_OP, $v0);
});

function expr(op, expression) {
  if (Array.isArray(expression)) {
    EXPRESSIONS.compile(op, expression);
  } else {
    PushPrimitive(op, expression);
    op(VM_PRIMITIVE_REFERENCE_OP);
  }
}

/**
 * Push a reference onto the stack corresponding to a statically known primitive
 * @param value A JavaScript primitive (undefined, null, boolean, number or string)
 */
function PushPrimitiveReference(op, value) {
  PushPrimitive(op, value);
  op(VM_PRIMITIVE_REFERENCE_OP);
}

/**
 * Push an encoded representation of a JavaScript primitive on the stack
 *
 * @param value A JavaScript primitive (undefined, null, boolean, number or string)
 */
function PushPrimitive(op, primitive) {
  let p = primitive;
  if (typeof p === 'number') {
    p = isSmallInt(p) ? encodeImmediate(p) : nonSmallIntOperand(p);
  }
  op(VM_PRIMITIVE_OP, p);
}

/**
 * Invoke a foreign function (a "helper") based on a statically known handle
 *
 * @param op The op creation function
 * @param handle A handle
 * @param positional An optional list of expressions to compile
 * @param named An optional list of named arguments (name + expression) to compile
 */
function Call(op, handle, positional, named) {
  op(VM_PUSH_FRAME_OP);
  SimpleArgs(op, positional, named, false);
  op(VM_HELPER_OP, handle);
  op(VM_POP_FRAME_OP);
  op(VM_FETCH_OP, $v0);
}

/**
 * Invoke a foreign function (a "helper") based on a dynamically loaded definition
 *
 * @param op The op creation function
 * @param positional An optional list of expressions to compile
 * @param named An optional list of named arguments (name + expression) to compile
 */
function CallDynamic(op, positional, named, append) {
  op(VM_PUSH_FRAME_OP);
  SimpleArgs(op, positional, named, false);
  op(VM_DUP_OP, $fp, 1);
  op(VM_DYNAMIC_HELPER_OP);
  if (append) {
    op(VM_FETCH_OP, $v0);
    append();
    op(VM_POP_FRAME_OP);
    op(VM_POP_OP, 1);
  } else {
    op(VM_POP_FRAME_OP);
    op(VM_POP_OP, 1);
    op(VM_FETCH_OP, $v0);
  }
}

/**
 * Evaluate statements in the context of new dynamic scope entries. Move entries from the
 * stack into named entries in the dynamic scope, then evaluate the statements, then pop
 * the dynamic scope
 *
 * @param names a list of dynamic scope names
 * @param block a function that returns a list of statements to evaluate
 */
function DynamicScope(op, names, block) {
  op(VM_PUSH_DYNAMIC_SCOPE_OP);
  op(VM_BIND_DYNAMIC_SCOPE_OP, names);
  block();
  op(VM_POP_DYNAMIC_SCOPE_OP);
}
function Curry(op, type, definition, positional, named) {
  op(VM_PUSH_FRAME_OP);
  SimpleArgs(op, positional, named, false);
  op(VM_CAPTURE_ARGS_OP);
  expr(op, definition);
  op(VM_CURRY_OP, type, isStrictMode());
  op(VM_POP_FRAME_OP);
  op(VM_FETCH_OP, $v0);
}

/**
 * Yield to a block located at a particular symbol location.
 *
 * @param to the symbol containing the block to yield to
 * @param params optional block parameters to yield to the block
 */
function YieldBlock(op, to, positional) {
  SimpleArgs(op, positional, null, true);
  op(VM_GET_BLOCK_OP, to);
  op(VM_SPREAD_BLOCK_OP);
  op(VM_COMPILE_BLOCK_OP);
  op(VM_INVOKE_YIELD_OP);
  op(VM_POP_SCOPE_OP);
  op(VM_POP_FRAME_OP);
}

/**
 * Push an (optional) yieldable block onto the stack. The yieldable block must be known
 * statically at compile time.
 *
 * @param block An optional Compilable block
 */
function PushYieldableBlock(op, block) {
  PushSymbolTable(op, block && block[1]);
  op(VM_PUSH_BLOCK_SCOPE_OP);
  PushCompilable(op, block);
}

/**
 * Invoke a block that is known statically at compile time.
 *
 * @param block a Compilable block
 */
function InvokeStaticBlock(op, block) {
  op(VM_PUSH_FRAME_OP);
  PushCompilable(op, block);
  op(VM_COMPILE_BLOCK_OP);
  op(VM_INVOKE_VIRTUAL_OP);
  op(VM_POP_FRAME_OP);
}

/**
 * Invoke a static block, preserving some number of stack entries for use in
 * updating.
 *
 * @param block A compilable block
 * @param callerCount A number of stack entries to preserve
 */
function InvokeStaticBlockWithStack(op, block, callerCount) {
  let parameters = block[1];
  let calleeCount = parameters.length;
  let count = Math.min(callerCount, calleeCount);
  if (count === 0) {
    InvokeStaticBlock(op, block);
    return;
  }
  op(VM_PUSH_FRAME_OP);
  if (count) {
    op(VM_CHILD_SCOPE_OP);
    for (let i = 0; i < count; i++) {
      op(VM_DUP_OP, $fp, callerCount - i);
      op(VM_SET_VARIABLE_OP, parameters[i]);
    }
  }
  PushCompilable(op, block);
  op(VM_COMPILE_BLOCK_OP);
  op(VM_INVOKE_VIRTUAL_OP);
  if (count) {
    op(VM_POP_SCOPE_OP);
  }
  op(VM_POP_FRAME_OP);
}
function PushSymbolTable(op, parameters) {
  if (parameters !== null) {
    op(VM_PUSH_SYMBOL_TABLE_OP, symbolTableOperand({
      parameters
    }));
  } else {
    PushPrimitive(op, null);
  }
}
function PushCompilable(op, _block) {
  if (_block === null) {
    PushPrimitive(op, null);
  } else {
    op(VM_CONSTANT_OP, blockOperand(_block));
  }
}

/**
 * Compile arguments, pushing an Arguments object onto the stack.
 *
 * @param args.params
 * @param args.hash
 * @param args.blocks
 * @param args.atNames
 */
function CompileArgs(op, positional, named, blocks, atNames) {
  let blockNames = blocks.names;
  for (const name of blockNames) {
    PushYieldableBlock(op, blocks.get(name));
  }
  let count = CompilePositional(op, positional);
  let flags = count << 4;
  if (atNames) flags |= 0b1000;
  if (blocks.hasAny) {
    flags |= 0b111;
  }
  let names = EMPTY_ARRAY;
  if (named) {
    names = named[0];
    let val = named[1];
    for (let i = 0; i < val.length; i++) {
      expr(op, val[i]);
    }
  }
  op(VM_PUSH_ARGS_OP, names, blockNames, flags);
}
function SimpleArgs(op, positional, named, atNames) {
  if (positional === null && named === null) {
    op(VM_PUSH_EMPTY_ARGS_OP);
    return;
  }
  let count = CompilePositional(op, positional);
  let flags = count << 4;
  if (atNames) flags |= 0b1000;
  let names = EMPTY_STRING_ARRAY;
  if (named) {
    names = named[0];
    let val = named[1];
    for (let i = 0; i < val.length; i++) {
      expr(op, val[i]);
    }
  }
  op(VM_PUSH_ARGS_OP, names, EMPTY_STRING_ARRAY, flags);
}

/**
 * Compile an optional list of positional arguments, which pushes each argument
 * onto the stack and returns the number of parameters compiled
 *
 * @param positional an optional list of positional arguments
 */
function CompilePositional(op, positional) {
  if (positional === null) return 0;
  for (let i = 0; i < positional.length; i++) {
    expr(op, positional[i]);
  }
  return positional.length;
}
function meta(layout) {
  let [, locals, upvars] = layout.block;
  let scopeRecord = layout.scope?.() ?? null;
  return {
    symbols: {
      locals,
      upvars,
      lexical: scopeRecord ? Object.keys(scopeRecord) : undefined
    },
    scopeValues: scopeRecord ? Object.values(scopeRecord) : null,
    isStrictMode: layout.isStrictMode,
    moduleName: layout.moduleName,
    owner: layout.owner,
    size: locals.length
  };
}

class NamedBlocksImpl {
  names;
  constructor(blocks) {
    this.blocks = blocks;
    this.names = blocks ? Object.keys(blocks) : [];
  }
  get(name) {
    if (!this.blocks) return null;
    return this.blocks[name] || null;
  }
  has(name) {
    let {
      blocks
    } = this;
    return blocks !== null && name in blocks;
  }
  with(name, block) {
    let {
      blocks
    } = this;
    if (blocks) {
      return new NamedBlocksImpl(assign({}, blocks, {
        [name]: block
      }));
    } else {
      return new NamedBlocksImpl({
        [name]: block
      });
    }
  }
  get hasAny() {
    return this.blocks !== null;
  }
}
const EMPTY_BLOCKS = new NamedBlocksImpl(null);
function namedBlocks(blocks) {
  if (blocks === null) {
    return EMPTY_BLOCKS;
  }
  let out = dict();
  let [keys, values] = blocks;
  for (const [i, key] of enumerate(keys)) {
    out[key] = unwrap(values[i]);
  }
  return new NamedBlocksImpl(out);
}

function SwitchCases(op, bootstrap, matcher) {
  // Setup the switch DSL
  let clauses = [];
  let count = 0;
  function when(match, callback) {
    clauses.push({
      match,
      callback,
      label: `CLAUSE${count++}`
    });
  }

  // Call the callback
  matcher(when);

  // Emit the opcodes for the switch
  op(VM_ENTER_OP, 1);
  bootstrap();
  op(HighLevelBuilderOpcodes.StartLabels);

  // First, emit the jump opcodes. We don't need a jump for the last
  // opcode, since it bleeds directly into its clause.
  for (let clause of clauses.slice(0, -1)) {
    op(VM_JUMP_EQ_OP, labelOperand(clause.label), clause.match);
  }

  // Enumerate the clauses in reverse order. Earlier matches will
  // require fewer checks.
  for (let i = clauses.length - 1; i >= 0; i--) {
    let clause = unwrap(clauses[i]);
    op(HighLevelBuilderOpcodes.Label, clause.label);
    op(VM_POP_OP, 1);
    clause.callback();

    // The first match is special: it is placed directly before the END
    // label, so no additional jump is needed at the end of it.
    if (i !== 0) {
      op(VM_JUMP_OP, labelOperand('END'));
    }
  }
  op(HighLevelBuilderOpcodes.Label, 'END');
  op(HighLevelBuilderOpcodes.StopLabels);
  op(VM_EXIT_OP);
}

/**
 * A convenience for pushing some arguments on the stack and
 * running some code if the code needs to be re-executed during
 * updating execution if some of the arguments have changed.
 *
 * # Initial Execution
 *
 * The `args` function should push zero or more arguments onto
 * the stack and return the number of arguments pushed.
 *
 * The `body` function provides the instructions to execute both
 * during initial execution and during updating execution.
 *
 * Internally, this function starts by pushing a new frame, so
 * that the body can return and sets the return point ($ra) to
 * the ENDINITIAL label.
 *
 * It then executes the `args` function, which adds instructions
 * responsible for pushing the arguments for the block to the
 * stack. These arguments will be restored to the stack before
 * updating execution.
 *
 * Next, it adds the Enter opcode, which marks the current position
 * in the DOM, and remembers the current $pc (the next instruction)
 * as the first instruction to execute during updating execution.
 *
 * Next, it runs `body`, which adds the opcodes that should
 * execute both during initial execution and during updating execution.
 * If the `body` wishes to finish early, it should Jump to the
 * `FINALLY` label.
 *
 * Next, it adds the FINALLY label, followed by:
 *
 * - the Exit opcode, which finalizes the marked DOM started by the
 *   Enter opcode.
 * - the Return opcode, which returns to the current return point
 *   ($ra).
 *
 * Finally, it adds the ENDINITIAL label followed by the PopFrame
 * instruction, which restores $fp, $sp and $ra.
 *
 * # Updating Execution
 *
 * Updating execution for this `replayable` occurs if the `body` added an
 * assertion, via one of the `JumpUnless`, `JumpEq` or `AssertSame` opcodes.
 *
 * If, during updating executon, the assertion fails, the initial VM is
 * restored, and the stored arguments are pushed onto the stack. The DOM
 * between the starting and ending markers is cleared, and the VM's cursor
 * is set to the area just cleared.
 *
 * The return point ($ra) is set to -1, the exit instruction.
 *
 * Finally, the $pc is set to to the instruction saved off by the
 * Enter opcode during initial execution, and execution proceeds as
 * usual.
 *
 * The only difference is that when a `Return` instruction is
 * encountered, the program jumps to -1 rather than the END label,
 * and the PopFrame opcode is not needed.
 */
function Replayable(op, args, body) {
  // Start a new label frame, to give END and RETURN
  // a unique meaning.

  op(HighLevelBuilderOpcodes.StartLabels);
  op(VM_PUSH_FRAME_OP);

  // If the body invokes a block, its return will return to
  // END. Otherwise, the return in RETURN will return to END.
  op(VM_RETURN_TO_OP, labelOperand('ENDINITIAL'));

  // Push the arguments onto the stack. The args() function
  // tells us how many stack elements to retain for re-execution
  // when updating.
  let count = args();

  // Start a new updating closure, remembering `count` elements
  // from the stack. Everything after this point, and before END,
  // will execute both initially and to update the block.
  //
  // The enter and exit opcodes also track the area of the DOM
  // associated with this block. If an assertion inside the block
  // fails (for example, the test value changes from true to false
  // in an #if), the DOM is cleared and the program is re-executed,
  // restoring `count` elements to the stack and executing the
  // instructions between the enter and exit.
  op(VM_ENTER_OP, count);

  // Evaluate the body of the block. The body of the block may
  // return, which will jump execution to END during initial
  // execution, and exit the updating routine.
  body();

  // All execution paths in the body should run the FINALLY once
  // they are done. It is executed both during initial execution
  // and during updating execution.
  op(HighLevelBuilderOpcodes.Label, 'FINALLY');

  // Finalize the DOM.
  op(VM_EXIT_OP);

  // In initial execution, this is a noop: it returns to the
  // immediately following opcode. In updating execution, this
  // exits the updating routine.
  op(VM_RETURN_OP);

  // Cleanup code for the block. Runs on initial execution
  // but not on updating.
  op(HighLevelBuilderOpcodes.Label, 'ENDINITIAL');
  op(VM_POP_FRAME_OP);
  op(HighLevelBuilderOpcodes.StopLabels);
}

/**
 * A specialized version of the `replayable` convenience that allows the
 * caller to provide different code based upon whether the item at
 * the top of the stack is true or false.
 *
 * As in `replayable`, the `ifTrue` and `ifFalse` code can invoke `return`.
 *
 * During the initial execution, a `return` will continue execution
 * in the cleanup code, which finalizes the current DOM block and pops
 * the current frame.
 *
 * During the updating execution, a `return` will exit the updating
 * routine, as it can reuse the DOM block and is always only a single
 * frame deep.
 */
function ReplayableIf(op, args, ifTrue, ifFalse) {
  return Replayable(op, args, () => {
    // If the conditional is false, jump to the ELSE label.
    op(VM_JUMP_UNLESS_OP, labelOperand('ELSE'));
    // Otherwise, execute the code associated with the true branch.
    ifTrue();
    // We're done, so return. In the initial execution, this runs
    // the cleanup code. In the updating VM, it exits the updating
    // routine.
    op(VM_JUMP_OP, labelOperand('FINALLY'));
    op(HighLevelBuilderOpcodes.Label, 'ELSE');

    // If the conditional is false, and code associatied ith the
    // false branch was provided, execute it. If there was no code
    // associated with the false branch, jumping to the else statement
    // has no other behavior.
    if (ifFalse !== undefined) {
      ifFalse();
    }
  });
}

const ATTRS_BLOCK = '&attrs';

// {{component}}

// <Component>

// chokepoint

function InvokeComponent(op, component, _elementBlock, positional, named, _blocks) {
  let {
    compilable,
    capabilities,
    handle
  } = component;
  let elementBlock = _elementBlock ? [_elementBlock, []] : null;
  let blocks = namedBlocks(_blocks);
  if (compilable) {
    op(VM_PUSH_COMPONENT_DEFINITION_OP, handle);
    InvokeStaticComponent(op, {
      capabilities: capabilities,
      layout: compilable,
      elementBlock,
      positional,
      named,
      blocks
    });
  } else {
    op(VM_PUSH_COMPONENT_DEFINITION_OP, handle);
    InvokeNonStaticComponent(op, {
      capabilities: capabilities,
      elementBlock,
      positional,
      named,
      atNames: true,
      blocks
    });
  }
}
function InvokeDynamicComponent(op, definition, _elementBlock, positional, named, _blocks, atNames, curried) {
  let elementBlock = _elementBlock ? [_elementBlock, []] : null;
  let blocks = namedBlocks(_blocks);
  Replayable(op, () => {
    expr(op, definition);
    op(VM_DUP_OP, $sp, 0);
    return 2;
  }, () => {
    op(VM_JUMP_UNLESS_OP, labelOperand('ELSE'));
    if (curried) {
      op(VM_RESOLVE_CURRIED_COMPONENT_OP);
    } else {
      op(VM_RESOLVE_DYNAMIC_COMPONENT_OP, isStrictMode());
    }
    op(VM_PUSH_DYNAMIC_COMPONENT_INSTANCE_OP);
    InvokeNonStaticComponent(op, {
      capabilities: true,
      elementBlock,
      positional,
      named,
      atNames,
      blocks
    });
    op(HighLevelBuilderOpcodes.Label, 'ELSE');
  });
}
function InvokeStaticComponent(op, {
  capabilities,
  layout,
  elementBlock,
  positional,
  named,
  blocks
}) {
  let {
    symbolTable
  } = layout;
  let bailOut = hasCapability(capabilities, InternalComponentCapabilities.prepareArgs);
  if (bailOut) {
    InvokeNonStaticComponent(op, {
      capabilities,
      elementBlock,
      positional,
      named,
      atNames: true,
      blocks,
      layout
    });
    return;
  }
  op(VM_FETCH_OP, $s0);
  op(VM_DUP_OP, $sp, 1);
  op(VM_LOAD_OP, $s0);
  op(VM_PUSH_FRAME_OP);

  // Setup arguments
  let {
    symbols
  } = symbolTable;

  // As we push values onto the stack, we store the symbols associated  with them
  // so that we can set them on the scope later on with SetVariable and SetBlock
  let blockSymbols = [];
  let argSymbols = [];
  let argNames = [];

  // First we push the blocks onto the stack
  let blockNames = blocks.names;

  // Starting with the attrs block, if it exists and is referenced in the component
  if (elementBlock !== null) {
    let symbol = symbols.indexOf(ATTRS_BLOCK);
    if (symbol !== -1) {
      PushYieldableBlock(op, elementBlock);
      blockSymbols.push(symbol);
    }
  }

  // Followed by the other blocks, if they exist and are referenced in the component.
  // Also store the index of the associated symbol.
  for (const name of blockNames) {
    let symbol = symbols.indexOf(`&${name}`);
    if (symbol !== -1) {
      PushYieldableBlock(op, blocks.get(name));
      blockSymbols.push(symbol);
    }
  }

  // Next up we have arguments. If the component has the `createArgs` capability,
  // then it wants access to the arguments in JavaScript. We can't know whether
  // or not an argument is used, so we have to give access to all of them.
  if (hasCapability(capabilities, InternalComponentCapabilities.createArgs)) {
    // First we push positional arguments
    let count = CompilePositional(op, positional);

    // setup the flags with the count of positionals, and to indicate that atNames
    // are used
    let flags = count << 4;
    flags |= 0b1000;
    let names = EMPTY_STRING_ARRAY;

    // Next, if named args exist, push them all. If they have an associated symbol
    // in the invoked component (e.g. they are used within its template), we push
    // that symbol. If not, we still push the expression as it may be used, and
    // we store the symbol as -1 (this is used later).
    if (named !== null) {
      names = named[0];
      let val = named[1];
      for (let i = 0; i < val.length; i++) {
        let symbol = symbols.indexOf(unwrap(names[i]));
        expr(op, val[i]);
        argSymbols.push(symbol);
      }
    }

    // Finally, push the VM arguments themselves. These args won't need access
    // to blocks (they aren't accessible from userland anyways), so we push an
    // empty array instead of the actual block names.
    op(VM_PUSH_ARGS_OP, names, EMPTY_STRING_ARRAY, flags);

    // And push an extra pop operation to remove the args before we begin setting
    // variables on the local context
    argSymbols.push(-1);
  } else if (named !== null) {
    // If the component does not have the `createArgs` capability, then the only
    // expressions we need to push onto the stack are those that are actually
    // referenced in the template of the invoked component (e.g. have symbols).
    let names = named[0];
    let val = named[1];
    for (let i = 0; i < val.length; i++) {
      let name = unwrap(names[i]);
      let symbol = symbols.indexOf(name);
      if (symbol !== -1) {
        expr(op, val[i]);
        argSymbols.push(symbol);
        argNames.push(name);
      }
    }
  }
  op(VM_BEGIN_COMPONENT_TRANSACTION_OP, $s0);
  if (hasCapability(capabilities, InternalComponentCapabilities.dynamicScope)) {
    op(VM_PUSH_DYNAMIC_SCOPE_OP);
  }
  if (hasCapability(capabilities, InternalComponentCapabilities.createInstance)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    op(VM_CREATE_COMPONENT_OP, blocks.has('default') | 0);
  }
  op(VM_REGISTER_COMPONENT_DESTRUCTOR_OP, $s0);
  if (hasCapability(capabilities, InternalComponentCapabilities.createArgs)) {
    op(VM_GET_COMPONENT_SELF_OP, $s0);
  } else {
    op(VM_GET_COMPONENT_SELF_OP, $s0, argNames);
  }

  // Setup the new root scope for the component
  op(VM_ROOT_SCOPE_OP, symbols.length + 1, Object.keys(blocks).length > 0 ? 1 : 0);

  // Pop the self reference off the stack and set it to the symbol for `this`
  // in the new scope. This is why all subsequent symbols are increased by one.
  op(VM_SET_VARIABLE_OP, 0);

  // Going in reverse, now we pop the args/blocks off the stack, starting with
  // arguments, and assign them to their symbols in the new scope.
  for (const symbol of reverse(argSymbols)) {
    // for (let i = argSymbols.length - 1; i >= 0; i--) {
    //   let symbol = argSymbols[i];

    if (symbol === -1) {
      // The expression was not bound to a local symbol, it was only pushed to be
      // used with VM args in the javascript side
      op(VM_POP_OP, 1);
    } else {
      op(VM_SET_VARIABLE_OP, symbol + 1);
    }
  }

  // if any positional params exist, pop them off the stack as well
  if (positional !== null) {
    op(VM_POP_OP, positional.length);
  }

  // Finish up by popping off and assigning blocks
  for (const symbol of reverse(blockSymbols)) {
    op(VM_SET_BLOCK_OP, symbol + 1);
  }
  op(VM_CONSTANT_OP, layoutOperand(layout));
  op(VM_COMPILE_BLOCK_OP);
  op(VM_INVOKE_VIRTUAL_OP);
  op(VM_DID_RENDER_LAYOUT_OP, $s0);
  op(VM_POP_FRAME_OP);
  op(VM_POP_SCOPE_OP);
  if (hasCapability(capabilities, InternalComponentCapabilities.dynamicScope)) {
    op(VM_POP_DYNAMIC_SCOPE_OP);
  }
  op(VM_COMMIT_COMPONENT_TRANSACTION_OP);
  op(VM_LOAD_OP, $s0);
}
function InvokeNonStaticComponent(op, {
  capabilities,
  elementBlock,
  positional,
  named,
  atNames,
  blocks: namedBlocks,
  layout
}) {
  let bindableBlocks = Boolean(namedBlocks);
  let bindableAtNames = capabilities === true || hasCapability(capabilities, InternalComponentCapabilities.prepareArgs) || named?.[0].length !== 0;
  let blocks = namedBlocks.with('attrs', elementBlock);
  op(VM_FETCH_OP, $s0);
  op(VM_DUP_OP, $sp, 1);
  op(VM_LOAD_OP, $s0);
  op(VM_PUSH_FRAME_OP);
  CompileArgs(op, positional, named, blocks, atNames);
  op(VM_PREPARE_ARGS_OP, $s0);
  invokePreparedComponent(op, blocks.has('default'), bindableBlocks, bindableAtNames, () => {
    if (layout) {
      op(VM_PUSH_SYMBOL_TABLE_OP, symbolTableOperand(layout.symbolTable));
      op(VM_CONSTANT_OP, layoutOperand(layout));
      op(VM_COMPILE_BLOCK_OP);
    } else {
      op(VM_GET_COMPONENT_LAYOUT_OP, $s0);
    }
    op(VM_POPULATE_LAYOUT_OP, $s0);
  });
  op(VM_LOAD_OP, $s0);
}
function WrappedComponent(op, layout, attrsBlockNumber) {
  op(HighLevelBuilderOpcodes.StartLabels);
  WithSavedRegister(op, $s1, () => {
    op(VM_GET_COMPONENT_TAG_NAME_OP, $s0);
    op(VM_PRIMITIVE_REFERENCE_OP);
    op(VM_DUP_OP, $sp, 0);
  });
  op(VM_JUMP_UNLESS_OP, labelOperand('BODY'));
  op(VM_FETCH_OP, $s1);
  op(VM_PUT_COMPONENT_OPERATIONS_OP);
  op(VM_OPEN_DYNAMIC_ELEMENT_OP);
  op(VM_DID_CREATE_ELEMENT_OP, $s0);
  YieldBlock(op, attrsBlockNumber, null);
  op(VM_FLUSH_ELEMENT_OP);
  op(HighLevelBuilderOpcodes.Label, 'BODY');
  InvokeStaticBlock(op, [layout.block[0], []]);
  op(VM_FETCH_OP, $s1);
  op(VM_JUMP_UNLESS_OP, labelOperand('END'));
  op(VM_CLOSE_ELEMENT_OP);
  op(HighLevelBuilderOpcodes.Label, 'END');
  op(VM_LOAD_OP, $s1);
  op(HighLevelBuilderOpcodes.StopLabels);
}
function invokePreparedComponent(op, hasBlock, bindableBlocks, bindableAtNames, populateLayout = null) {
  op(VM_BEGIN_COMPONENT_TRANSACTION_OP, $s0);
  op(VM_PUSH_DYNAMIC_SCOPE_OP);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  op(VM_CREATE_COMPONENT_OP, hasBlock | 0);

  // this has to run after createComponent to allow
  // for late-bound layouts, but a caller is free
  // to populate the layout earlier if it wants to
  // and do nothing here.
  if (populateLayout) {
    populateLayout();
  }
  op(VM_REGISTER_COMPONENT_DESTRUCTOR_OP, $s0);
  op(VM_GET_COMPONENT_SELF_OP, $s0);
  op(VM_VIRTUAL_ROOT_SCOPE_OP, $s0);
  op(VM_SET_VARIABLE_OP, 0);
  if (bindableAtNames) op(VM_SET_NAMED_VARIABLES_OP, $s0);
  if (bindableBlocks) op(VM_SET_BLOCKS_OP, $s0);
  op(VM_POP_OP, 1);
  op(VM_INVOKE_COMPONENT_LAYOUT_OP, $s0);
  op(VM_DID_RENDER_LAYOUT_OP, $s0);
  op(VM_POP_FRAME_OP);
  op(VM_POP_SCOPE_OP);
  op(VM_POP_DYNAMIC_SCOPE_OP);
  op(VM_COMMIT_COMPONENT_TRANSACTION_OP);
}
function InvokeBareComponent(op) {
  op(VM_FETCH_OP, $s0);
  op(VM_DUP_OP, $sp, 1);
  op(VM_LOAD_OP, $s0);
  op(VM_PUSH_FRAME_OP);
  op(VM_PUSH_EMPTY_ARGS_OP);
  op(VM_PREPARE_ARGS_OP, $s0);
  invokePreparedComponent(op, false, false, true, () => {
    op(VM_GET_COMPONENT_LAYOUT_OP, $s0);
    op(VM_POPULATE_LAYOUT_OP, $s0);
  });
  op(VM_LOAD_OP, $s0);
}
function WithSavedRegister(op, register, block) {
  op(VM_FETCH_OP, register);
  block();
  op(VM_LOAD_OP, register);
}

const STATEMENTS = new Compilers();
const INFLATE_ATTR_TABLE = ['class', 'id', 'value', 'name', 'type', 'style', 'href'];
const INFLATE_TAG_TABLE = ['div', 'span', 'p', 'a'];
function inflateTagName(tagName) {
  return typeof tagName === 'string' ? tagName : INFLATE_TAG_TABLE[tagName];
}
function inflateAttrName(attrName) {
  return typeof attrName === 'string' ? attrName : INFLATE_ATTR_TABLE[attrName];
}
STATEMENTS.add(opcodes.Comment, (op, sexp) => op(VM_COMMENT_OP, sexp[1]));
STATEMENTS.add(opcodes.CloseElement, op => op(VM_CLOSE_ELEMENT_OP));
STATEMENTS.add(opcodes.FlushElement, op => op(VM_FLUSH_ELEMENT_OP));
STATEMENTS.add(opcodes.Modifier, (op, [, expression, positional, named]) => {
  if (isGetFreeModifier(expression)) {
    op(HighLevelResolutionOpcodes.Modifier, expression, handle => {
      op(VM_PUSH_FRAME_OP);
      SimpleArgs(op, positional, named, false);
      op(VM_MODIFIER_OP, handle);
      op(VM_POP_FRAME_OP);
    });
  } else {
    expr(op, expression);
    op(VM_PUSH_FRAME_OP);
    SimpleArgs(op, positional, named, false);
    op(VM_DUP_OP, $fp, 1);
    op(VM_DYNAMIC_MODIFIER_OP);
    op(VM_POP_FRAME_OP);
  }
});
STATEMENTS.add(opcodes.StaticAttr, (op, [, name, value, namespace]) => {
  op(VM_STATIC_ATTR_OP, inflateAttrName(name), value, namespace ?? null);
});
STATEMENTS.add(opcodes.StaticComponentAttr, (op, [, name, value, namespace]) => {
  op(VM_STATIC_COMPONENT_ATTR_OP, inflateAttrName(name), value, namespace ?? null);
});
STATEMENTS.add(opcodes.DynamicAttr, (op, [, name, value, namespace]) => {
  expr(op, value);
  op(VM_DYNAMIC_ATTR_OP, inflateAttrName(name), false, namespace ?? null);
});
STATEMENTS.add(opcodes.TrustingDynamicAttr, (op, [, name, value, namespace]) => {
  expr(op, value);
  op(VM_DYNAMIC_ATTR_OP, inflateAttrName(name), true, namespace ?? null);
});
STATEMENTS.add(opcodes.ComponentAttr, (op, [, name, value, namespace]) => {
  expr(op, value);
  op(VM_COMPONENT_ATTR_OP, inflateAttrName(name), false, namespace ?? null);
});
STATEMENTS.add(opcodes.TrustingComponentAttr, (op, [, name, value, namespace]) => {
  expr(op, value);
  op(VM_COMPONENT_ATTR_OP, inflateAttrName(name), true, namespace ?? null);
});
STATEMENTS.add(opcodes.OpenElement, (op, [, tag]) => {
  op(VM_OPEN_ELEMENT_OP, inflateTagName(tag));
});
STATEMENTS.add(opcodes.OpenElementWithSplat, (op, [, tag]) => {
  op(VM_PUT_COMPONENT_OPERATIONS_OP);
  op(VM_OPEN_ELEMENT_OP, inflateTagName(tag));
});
STATEMENTS.add(opcodes.Component, (op, [, expr, elementBlock, named, blocks]) => {
  if (isGetFreeComponent(expr)) {
    op(HighLevelResolutionOpcodes.Component, expr, component => {
      InvokeComponent(op, component, elementBlock, null, named, blocks);
    });
  } else {
    // otherwise, the component name was an expression, so resolve the expression
    // and invoke it as a dynamic component
    InvokeDynamicComponent(op, expr, elementBlock, null, named, blocks, true, true);
  }
});
STATEMENTS.add(opcodes.Yield, (op, [, to, params]) => YieldBlock(op, to, params));
STATEMENTS.add(opcodes.AttrSplat, (op, [, to]) => YieldBlock(op, to, null));
STATEMENTS.add(opcodes.Debugger, (op, [, locals, upvars, lexical]) => {
  op(VM_DEBUGGER_OP, debugSymbolsOperand(locals, upvars, lexical));
});
STATEMENTS.add(opcodes.Append, (op, [, value]) => {
  // Special case for static values
  if (!Array.isArray(value)) {
    op(VM_TEXT_OP, value === null || value === undefined ? '' : String(value));
  } else if (isGetFreeComponentOrHelper(value)) {
    op(HighLevelResolutionOpcodes.OptionalComponentOrHelper, value, {
      ifComponent(component) {
        InvokeComponent(op, component, null, null, null, null);
      },
      ifHelper(handle) {
        op(VM_PUSH_FRAME_OP);
        Call(op, handle, null, null);
        op(VM_INVOKE_STATIC_OP, stdlibOperand('cautious-non-dynamic-append'));
        op(VM_POP_FRAME_OP);
      },
      ifValue(handle) {
        op(VM_PUSH_FRAME_OP);
        op(VM_CONSTANT_REFERENCE_OP, handle);
        op(VM_INVOKE_STATIC_OP, stdlibOperand('cautious-non-dynamic-append'));
        op(VM_POP_FRAME_OP);
      }
    });
  } else if (value[0] === opcodes.Call) {
    let [, expression, positional, named] = value;
    if (isGetFreeComponentOrHelper(expression)) {
      op(HighLevelResolutionOpcodes.ComponentOrHelper, expression, {
        ifComponent(component) {
          InvokeComponent(op, component, null, positional, hashToArgs(named), null);
        },
        ifHelper(handle) {
          op(VM_PUSH_FRAME_OP);
          Call(op, handle, positional, named);
          op(VM_INVOKE_STATIC_OP, stdlibOperand('cautious-non-dynamic-append'));
          op(VM_POP_FRAME_OP);
        }
      });
    } else {
      SwitchCases(op, () => {
        expr(op, expression);
        op(VM_DYNAMIC_CONTENT_TYPE_OP);
      }, when => {
        when(ContentType.Component, () => {
          op(VM_ASSERT_SAME_OP);
          op(VM_RESOLVE_CURRIED_COMPONENT_OP);
          op(VM_PUSH_DYNAMIC_COMPONENT_INSTANCE_OP);
          InvokeNonStaticComponent(op, {
            capabilities: true,
            elementBlock: null,
            positional,
            named,
            atNames: false,
            blocks: namedBlocks(null)
          });
        });
        when(ContentType.Helper, () => {
          CallDynamic(op, positional, named, () => {
            op(VM_INVOKE_STATIC_OP, stdlibOperand('cautious-non-dynamic-append'));
          });
        });
      });
    }
  } else {
    op(VM_PUSH_FRAME_OP);
    expr(op, value);
    op(VM_INVOKE_STATIC_OP, stdlibOperand('cautious-append'));
    op(VM_POP_FRAME_OP);
  }
});
STATEMENTS.add(opcodes.TrustingAppend, (op, [, value]) => {
  if (!Array.isArray(value)) {
    op(VM_TEXT_OP, value === null || value === undefined ? '' : String(value));
  } else {
    op(VM_PUSH_FRAME_OP);
    expr(op, value);
    op(VM_INVOKE_STATIC_OP, stdlibOperand('trusting-append'));
    op(VM_POP_FRAME_OP);
  }
});
STATEMENTS.add(opcodes.Block, (op, [, expr, positional, named, blocks]) => {
  if (isGetFreeComponent(expr)) {
    op(HighLevelResolutionOpcodes.Component, expr, component => {
      InvokeComponent(op, component, null, positional, hashToArgs(named), blocks);
    });
  } else {
    InvokeDynamicComponent(op, expr, null, positional, named, blocks, false, false);
  }
});
STATEMENTS.add(opcodes.InElement, (op, [, block, guid, destination, insertBefore]) => {
  ReplayableIf(op, () => {
    expr(op, guid);
    if (insertBefore === undefined) {
      PushPrimitiveReference(op, undefined);
    } else {
      expr(op, insertBefore);
    }
    expr(op, destination);
    op(VM_DUP_OP, $sp, 0);
    return 4;
  }, () => {
    op(VM_PUSH_REMOTE_ELEMENT_OP);
    InvokeStaticBlock(op, block);
    op(VM_POP_REMOTE_ELEMENT_OP);
  });
});
STATEMENTS.add(opcodes.If, (op, [, condition, block, inverse]) => ReplayableIf(op, () => {
  expr(op, condition);
  op(VM_TO_BOOLEAN_OP);
  return 1;
}, () => {
  InvokeStaticBlock(op, block);
}, inverse ? () => {
  InvokeStaticBlock(op, inverse);
} : undefined));
STATEMENTS.add(opcodes.Each, (op, [, value, key, block, inverse]) => Replayable(op, () => {
  if (key) {
    expr(op, key);
  } else {
    PushPrimitiveReference(op, null);
  }
  expr(op, value);
  return 2;
}, () => {
  op(VM_ENTER_LIST_OP, labelOperand('BODY'), labelOperand('ELSE'));
  op(VM_PUSH_FRAME_OP);
  op(VM_DUP_OP, $fp, 1);
  op(VM_RETURN_TO_OP, labelOperand('ITER'));
  op(HighLevelBuilderOpcodes.Label, 'ITER');
  op(VM_ITERATE_OP, labelOperand('BREAK'));
  op(HighLevelBuilderOpcodes.Label, 'BODY');
  InvokeStaticBlockWithStack(op, block, 2);
  op(VM_POP_OP, 2);
  op(VM_JUMP_OP, labelOperand('FINALLY'));
  op(HighLevelBuilderOpcodes.Label, 'BREAK');
  op(VM_POP_FRAME_OP);
  op(VM_EXIT_LIST_OP);
  op(VM_JUMP_OP, labelOperand('FINALLY'));
  op(HighLevelBuilderOpcodes.Label, 'ELSE');
  if (inverse) {
    InvokeStaticBlock(op, inverse);
  }
}));
STATEMENTS.add(opcodes.Let, (op, [, positional, block]) => {
  let count = CompilePositional(op, positional);
  InvokeStaticBlockWithStack(op, block, count);
});
STATEMENTS.add(opcodes.WithDynamicVars, (op, [, named, block]) => {
  if (named) {
    let [names, expressions] = named;
    CompilePositional(op, expressions);
    DynamicScope(op, names, () => {
      InvokeStaticBlock(op, block);
    });
  } else {
    InvokeStaticBlock(op, block);
  }
});
STATEMENTS.add(opcodes.InvokeComponent, (op, [, expr, positional, named, blocks]) => {
  if (isGetFreeComponent(expr)) {
    op(HighLevelResolutionOpcodes.Component, expr, component => {
      InvokeComponent(op, component, null, positional, hashToArgs(named), blocks);
    });
  } else {
    InvokeDynamicComponent(op, expr, null, positional, named, blocks, false, false);
  }
});
function hashToArgs(hash) {
  if (hash === null) return null;
  let names = hash[0].map(key => `@${key}`);
  return [names, hash[1]];
}

const PLACEHOLDER_HANDLE = -1;
class CompilableTemplateImpl {
  static {
  }
  compiled = new WeakMap();
  constructor(statements, meta,
  // Part of CompilableTemplate
  symbolTable,
  // Used for debugging
  moduleName = 'plain block') {
    this.statements = statements;
    this.meta = meta;
    this.symbolTable = symbolTable;
    this.moduleName = moduleName;
  }

  // Part of CompilableTemplate
  compile(context) {
    return maybeCompile(this, context);
  }
}
function compilable(layout, moduleName) {
  let [statements, symbols] = layout.block;
  return new CompilableTemplateImpl(statements, meta(layout), {
    symbols
  }, moduleName);
}
function maybeCompile(compilable, context) {
  if (compilable.compiled.has(context)) {
    return compilable.compiled.get(context);
  }
  compilable.compiled.set(context, PLACEHOLDER_HANDLE);
  let {
    statements,
    meta
  } = compilable;
  let result = compileStatements(statements, meta, context);
  compilable.compiled.set(context, result);
  return result;
}
function compileStatements(statements, meta, syntaxContext) {
  let sCompiler = STATEMENTS;
  let context = templateCompilationContext(syntaxContext, meta);
  let {
    encoder,
    evaluation
  } = context;
  function pushOp(...op) {
    encodeOp(encoder, evaluation, meta, op);
  }
  for (const statement of statements) {
    sCompiler.compile(pushOp, statement);
  }
  let handle = context.encoder.commit(meta.size);
  return handle;
}
function compilableBlock(block, containing) {
  return new CompilableTemplateImpl(block[0], containing, {
    parameters: block[1] || EMPTY_ARRAY
  });
}

class WrappedBuilder {
  symbolTable;
  compiled = null;
  attrsBlockNumber;
  meta;
  constructor(layout, moduleName) {
    this.layout = layout;
    this.moduleName = moduleName;
    let {
      block
    } = layout;
    let [, symbols] = block;
    symbols = symbols.slice();

    // ensure ATTRS_BLOCK is always included (only once) in the list of symbols
    let attrsBlockIndex = symbols.indexOf(ATTRS_BLOCK);
    if (attrsBlockIndex === -1) {
      this.attrsBlockNumber = symbols.push(ATTRS_BLOCK);
    } else {
      this.attrsBlockNumber = attrsBlockIndex + 1;
    }
    this.symbolTable = {
      symbols
    };
    this.meta = meta(layout);
  }
  compile(syntax) {
    if (this.compiled !== null) return this.compiled;
    let m = meta(this.layout);
    let context = templateCompilationContext(syntax, m);
    let {
      encoder,
      evaluation
    } = context;
    function pushOp(...op) {
      encodeOp(encoder, evaluation, m, op);
    }
    WrappedComponent(pushOp, this.layout, this.attrsBlockNumber);
    let handle = context.encoder.commit(m.size);
    if (typeof handle !== 'number') {
      return handle;
    }
    this.compiled = handle;
    return handle;
  }
}

let clientId = 0;
let templateCacheCounters = {
  cacheHit: 0,
  cacheMiss: 0
};

// These interfaces are for backwards compatibility, some addons use these intimate APIs

/**
 * Wraps a template js in a template module to change it into a factory
 * that handles lazy parsing the template and to create per env singletons
 * of the template.
 */
function templateFactory({
  id: templateId,
  moduleName,
  block,
  scope,
  isStrictMode
}) {
  // TODO(template-refactors): This should be removed in the near future, as it
  // appears that id is unused. It is currently kept for backwards compat reasons.
  let id = templateId || `client-${clientId++}`;

  // TODO: This caches JSON serialized output once in case a template is
  // compiled by multiple owners, but we haven't verified if this is actually
  // helpful. We should benchmark this in the future.
  let parsedBlock;
  let ownerlessTemplate = null;
  let templateCache = new WeakMap();
  let factory = owner => {
    if (parsedBlock === undefined) {
      parsedBlock = JSON.parse(block);
    }
    if (owner === undefined) {
      if (ownerlessTemplate === null) {
        templateCacheCounters.cacheMiss++;
        ownerlessTemplate = new TemplateImpl({
          id,
          block: parsedBlock,
          moduleName,
          owner: null,
          scope,
          isStrictMode
        });
      } else {
        templateCacheCounters.cacheHit++;
      }
      return ownerlessTemplate;
    }
    let result = templateCache.get(owner);
    if (result === undefined) {
      templateCacheCounters.cacheMiss++;
      result = new TemplateImpl({
        id,
        block: parsedBlock,
        moduleName,
        owner,
        scope,
        isStrictMode
      });
      templateCache.set(owner, result);
    } else {
      templateCacheCounters.cacheHit++;
    }
    return result;
  };
  factory.__id = id;
  factory.__meta = {
    moduleName
  };
  return factory;
}
class TemplateImpl {
  result = 'ok';
  layout = null;
  wrappedLayout = null;
  constructor(parsedLayout) {
    this.parsedLayout = parsedLayout;
  }
  get moduleName() {
    return this.parsedLayout.moduleName;
  }
  get id() {
    return this.parsedLayout.id;
  }

  // TODO(template-refactors): This should be removed in the near future, it is
  // only being exposed for backwards compatibility
  get referrer() {
    return {
      moduleName: this.parsedLayout.moduleName,
      owner: this.parsedLayout.owner
    };
  }
  asLayout() {
    if (this.layout) return this.layout;
    return this.layout = compilable(assign({}, this.parsedLayout), this.moduleName);
  }
  asWrappedLayout() {
    if (this.wrappedLayout) return this.wrappedLayout;
    return this.wrappedLayout = new WrappedBuilder(assign({}, this.parsedLayout), this.moduleName);
  }
}

export { CallDynamic as C, EMPTY_BLOCKS as E, InvokeStaticBlock as I, SwitchCases as S, WrappedBuilder as W, templateCacheCounters as a, compileStatements as b, compilable as c, InvokeStaticBlockWithStack as d, templateCompilationContext as e, EncoderImpl as f, encodeOp as g, InvokeBareComponent as h, invokePreparedComponent as i, meta as m, templateFactory as t };
