import { trackLocals } from './utils.js';

/**
 @module ember
*/

const keywordNames = new Set(['array', 'eq', 'element', 'and', 'fn', 'hash', 'neq', 'gt', 'gte', 'lt', 'lte', 'not', 'on', 'or']);
const importSource = {
  on: '@ember/modifier'
};

/**
  A Glimmer2 AST transformation that makes importable keywords work

  @private
  @class TransformActionSyntax
*/

function autoImportBuiltins(env) {
  let {
    hasLocal,
    visitor
  } = trackLocals(env);
  return {
    name: 'auto-import-built-ins',
    visitor: {
      ...visitor,
      PathExpression(node) {
        if (!keywordNames.has(node.original)) return;
        if (hasLocal(node.original)) return;
        rewriteKeyword(env, node, node.original, importSource[node.original] || '@ember/helper');
      }
    }
  };
}
function rewriteKeyword(env, node, name, moduleSpecifier) {
  if (env.meta?.jsutils) {
    node.original = env.meta.jsutils.bindImport(moduleSpecifier, name, node, {
      nameHint: `__keyword__${name}`
    });
  } else if (env.meta?.emberRuntime) {
    node.original = env.meta.emberRuntime.lookupKeyword(name);
  }
}

export { autoImportBuiltins as default };
