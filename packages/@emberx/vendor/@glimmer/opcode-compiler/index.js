export { E as EMPTY_BLOCKS, W as WrappedBuilder, c as compilable, b as compileStatements, I as invokeStaticBlock, d as invokeStaticBlockWithStack, m as meta, a as templateCacheCounters, e as templateCompilationContext, t as templateFactory } from '../../shared-chunks/index-kwuZeaNz.js';
export { E as EvaluationContextImpl, S as StdLib, c as compileStd } from '../../shared-chunks/program-context-WVlzpPdi.js';

let debugCompiler;

const DEFAULT_CAPABILITIES = {
  dynamicLayout: true,
  dynamicTag: true,
  prepareArgs: true,
  createArgs: true,
  attributeHook: false,
  elementHook: false,
  dynamicScope: true,
  createCaller: false,
  updateHook: true,
  createInstance: true,
  wrapped: false,
  willDestroy: false,
  hasSubOwner: false
};
const MINIMAL_CAPABILITIES = {
  dynamicLayout: false,
  dynamicTag: false,
  prepareArgs: false,
  createArgs: false,
  attributeHook: false,
  elementHook: false,
  dynamicScope: false,
  createCaller: false,
  updateHook: false,
  createInstance: false,
  wrapped: false,
  willDestroy: false,
  hasSubOwner: false
};

export { DEFAULT_CAPABILITIES, MINIMAL_CAPABILITIES, debugCompiler };
