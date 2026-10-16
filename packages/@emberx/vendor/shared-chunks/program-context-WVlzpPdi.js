import { V as VM_MAIN_OP, a as VM_CONTENT_TYPE_OP, b as VM_ASSERT_SAME_OP, c as VM_APPEND_HTML_OP, d as VM_APPEND_TEXT_OP, e as VM_RESOLVE_CURRIED_COMPONENT_OP, f as VM_PUSH_DYNAMIC_COMPONENT_INSTANCE_OP, g as VM_APPEND_SAFE_HTML_OP, h as VM_APPEND_DOCUMENT_FRAGMENT_OP, i as VM_APPEND_NODE_OP } from './syscall-ops-CkPT1Kfx.js';
import { V as VM_INVOKE_STATIC_OP } from './vm-ops-ImHv0Wtg.js';
import { $ as $s0 } from './registers-C_W2qYHJ.js';
import { ContentType } from '../@glimmer/vm/index.js';
import { f as EncoderImpl, g as encodeOp, i as invokePreparedComponent, S as SwitchCases, h as InvokeBareComponent, C as CallDynamic } from './index-kwuZeaNz.js';

class StdLib {
  constructor(main, trustingGuardedAppend, cautiousGuardedAppend, trustingNonDynamicAppend, cautiousNonDynamicAppend) {
    this.main = main;
    this.trustingGuardedAppend = trustingGuardedAppend;
    this.cautiousGuardedAppend = cautiousGuardedAppend;
    this.trustingNonDynamicAppend = trustingNonDynamicAppend;
    this.cautiousNonDynamicAppend = cautiousNonDynamicAppend;
  }
  get 'trusting-append'() {
    return this.trustingGuardedAppend;
  }
  get 'cautious-append'() {
    return this.cautiousGuardedAppend;
  }
  get 'trusting-non-dynamic-append'() {
    return this.trustingNonDynamicAppend;
  }
  get 'cautious-non-dynamic-append'() {
    return this.cautiousNonDynamicAppend;
  }
  getAppend(trusting) {
    return trusting ? this.trustingGuardedAppend : this.cautiousGuardedAppend;
  }
}

function main(op) {
  op(VM_MAIN_OP, $s0);
  invokePreparedComponent(op, false, false, true);
}

/**
 * Append content to the DOM. This standard function triages content and does the
 * right thing based upon whether it's a string, safe string, component, fragment
 * or node.
 *
 * @param trusting whether to interpolate a string as raw HTML (corresponds to
 * triple curlies)
 */
function StdAppend(op, trusting, nonDynamicAppend) {
  SwitchCases(op, () => op(VM_CONTENT_TYPE_OP), when => {
    when(ContentType.String, () => {
      if (trusting) {
        op(VM_ASSERT_SAME_OP);
        op(VM_APPEND_HTML_OP);
      } else {
        op(VM_APPEND_TEXT_OP);
      }
    });
    if (typeof nonDynamicAppend === 'number') {
      when(ContentType.Component, () => {
        op(VM_ASSERT_SAME_OP);
        op(VM_RESOLVE_CURRIED_COMPONENT_OP);
        op(VM_PUSH_DYNAMIC_COMPONENT_INSTANCE_OP);
        InvokeBareComponent(op);
      });
      when(ContentType.Helper, () => {
        CallDynamic(op, null, null, () => {
          op(VM_INVOKE_STATIC_OP, nonDynamicAppend);
        });
      });
    } else {
      // when non-dynamic, we can no longer call the value (potentially because we've already called it)
      // this prevents infinite loops. We instead coerce the value, whatever it is, into the DOM.
      when(ContentType.Component, () => {
        op(VM_APPEND_TEXT_OP);
      });
      when(ContentType.Helper, () => {
        op(VM_APPEND_TEXT_OP);
      });
    }
    when(ContentType.SafeString, () => {
      op(VM_ASSERT_SAME_OP);
      op(VM_APPEND_SAFE_HTML_OP);
    });
    when(ContentType.Fragment, () => {
      op(VM_ASSERT_SAME_OP);
      op(VM_APPEND_DOCUMENT_FRAGMENT_OP);
    });
    when(ContentType.Node, () => {
      op(VM_ASSERT_SAME_OP);
      op(VM_APPEND_NODE_OP);
    });
  });
}
function compileStd(context) {
  let mainHandle = build(context, op => main(op));
  let trustingGuardedNonDynamicAppend = build(context, op => StdAppend(op, true, null));
  let cautiousGuardedNonDynamicAppend = build(context, op => StdAppend(op, false, null));
  let trustingGuardedDynamicAppend = build(context, op => StdAppend(op, true, trustingGuardedNonDynamicAppend));
  let cautiousGuardedDynamicAppend = build(context, op => StdAppend(op, false, cautiousGuardedNonDynamicAppend));
  return new StdLib(mainHandle, trustingGuardedDynamicAppend, cautiousGuardedDynamicAppend, trustingGuardedNonDynamicAppend, cautiousGuardedNonDynamicAppend);
}
const STDLIB_META = {
  symbols: {
    locals: null,
    upvars: null
  },
  moduleName: 'stdlib',
  // TODO: ??
  scopeValues: null,
  isStrictMode: true,
  owner: null,
  size: 0
};
function build(evaluation, builder) {
  let encoder = new EncoderImpl(evaluation.program.heap, STDLIB_META);
  function pushOp(...op) {
    encodeOp(encoder, evaluation, STDLIB_META, op);
  }
  builder(pushOp);
  let result = encoder.commit(0);
  if (typeof result !== 'number') {
    // This shouldn't be possible
    throw new Error(`Unexpected errors compiling std`);
  } else {
    return result;
  }
}

class EvaluationContextImpl {
  constants;
  heap;
  resolver;
  stdlib;
  createOp;
  env;
  program;
  constructor({
    constants,
    heap
  }, createOp, runtime) {
    this.constants = constants;
    this.heap = heap;
    this.resolver = runtime.resolver;
    this.createOp = createOp;
    this.env = runtime.env;
    this.program = runtime.program;
    this.stdlib = compileStd(this);
  }
}

export { EvaluationContextImpl as E, StdLib as S, compileStd as c };
