import { o as or, d as not, c as lte, l as lt, b as gte, g as gt, n as neq, a as and, e as eq } from '../../../shared-chunks/not-DOTpWiG3.js';
import { h as hash, f as fn, a as array } from '../../../shared-chunks/hash-b373B4IL.js';
import { e as element } from '../../../shared-chunks/element-BmBjPjkQ.js';
import { on } from '../../modifier/on.js';
import { STRICT_MODE_KEYWORDS, STRICT_MODE_TRANSFORMS, RESOLUTION_MODE_TRANSFORMS } from './plugins/index.js';
import { ALLOWED_GLOBALS } from './plugins/allowed-globals.js';
import COMPONENT_NAME_SIMPLE_DASHERIZE_CACHE from './dasherize-component-name.js';

let USER_PLUGINS = [];

/**
 * The variable name used to inject the keywords object into the
 * template's evaluation scope. auto-import-builtins rewrites bare
 * keyword references (e.g. `on`) to property accesses on this
 * variable (e.g. `__ember_keywords__.on`).
 */
const RUNTIME_KEYWORDS_NAME = '__ember_keywords__';
const keywords = {
  array,
  eq,
  element,
  and,
  fn,
  hash,
  neq,
  gt,
  gte,
  lt,
  lte,
  not,
  on,
  or
};
function buildCompileOptions(_options) {
  let moduleName = _options.moduleName;
  let options = {
    isProduction: false,
    plugins: {
      ast: []
    },
    ..._options,
    moduleName,
    customizeComponentName(tagname) {
      return COMPONENT_NAME_SIMPLE_DASHERIZE_CACHE.get(tagname);
    }
  };
  options.meta ||= {};
  options.meta.emberRuntime ||= {
    lookupKeyword(name) {
      return `${RUNTIME_KEYWORDS_NAME}.${name}`;
    }
  };
  if ('eval' in options && options.eval) {
    const localScopeEvaluator = options.eval;
    const globalScopeEvaluator = value => new Function(`return ${value};`)();
    options.lexicalScope = variable => {
      // The keywords container variable is always "in scope" —
      // we inject it via the evaluator in template.ts.
      if (variable === RUNTIME_KEYWORDS_NAME) {
        return true;
      }
      if (ALLOWED_GLOBALS.has(variable)) {
        return variable in globalThis;
      }
      if (inScope(variable, localScopeEvaluator)) {
        return !inScope(variable, globalScopeEvaluator);
      }
      return false;
    };
    delete options.eval;
  }
  if ('scope' in options) {
    const scope = options.scope();
    options.lexicalScope = variable => variable in scope || variable === RUNTIME_KEYWORDS_NAME;
    delete options.scope;
  }

  // When neither eval nor scope is provided, the keywords container
  // still needs to be visible to the compiler.
  if (!options.lexicalScope) {
    options.lexicalScope = variable => variable === RUNTIME_KEYWORDS_NAME;
  }
  if ('locals' in options && !options.locals) {
    // Glimmer's precompile options declare `locals` like:
    //    locals?: string[]
    // but many in-use versions of babel-plugin-htmlbars-inline-precompile will
    // set locals to `null`. This used to work but only because glimmer was
    // ignoring locals for non-strict templates, and now it supports that case.
    delete options.locals;
  }

  // move `moduleName` into `meta` property
  if (options.moduleName) {
    let meta = options.meta;
    meta.moduleName = options.moduleName;
  }
  if (options.strictMode) {
    options.keywords = STRICT_MODE_KEYWORDS;
  }
  return options;
}
function transformsFor(options) {
  return options.strictMode ? STRICT_MODE_TRANSFORMS : RESOLUTION_MODE_TRANSFORMS;
}
function compileOptions(_options = {}) {
  let options = buildCompileOptions(_options);
  let builtInPlugins = transformsFor(options);
  if (!_options.plugins) {
    options.plugins = {
      ast: [...USER_PLUGINS, ...builtInPlugins]
    };
  } else {
    let potententialPugins = [...USER_PLUGINS, ...builtInPlugins];
    let pluginsToAdd = potententialPugins.filter(plugin => {
      return options.plugins.ast.indexOf(plugin) === -1;
    });
    options.plugins.ast = [...options.plugins.ast, ...pluginsToAdd];
  }
  return options;
}
// https://tc39.es/ecma262/2020/#prod-IdentifierName
const IDENT = /^[\p{ID_Start}$_][\p{ID_Continue}$_\u200C\u200D]*$/u;
function inScope(variable, evaluator) {
  // If the identifier is not a valid JS identifier, it's definitely not in scope
  if (!IDENT.exec(variable)) {
    return false;
  }
  try {
    return evaluator(`typeof ${variable} !== "undefined"`) === true;
  } catch (e) {
    // This occurs when attempting to evaluate a reserved word using eval (`eval('typeof let')`).
    // If the variable is a reserved word, it's definitely not in scope, so return false. Since
    // reserved words are somewhat contextual, we don't try to identify them purely by their
    // name. See https://tc39.es/ecma262/#sec-keywords-and-reserved-words
    if (e && e instanceof SyntaxError) {
      return false;
    }

    // If it's another kind of error, don't swallow it.
    throw e;
  }
}

export { RUNTIME_KEYWORDS_NAME, compileOptions as default, keywords };
