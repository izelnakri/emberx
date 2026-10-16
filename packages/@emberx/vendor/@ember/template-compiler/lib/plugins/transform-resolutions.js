import { isPath, trackLocals, isStringLiteral } from './utils.js';

/**
 @module ember
*/

/**
  A Glimmer2 AST transformation that replaces all instances of

  ```handlebars
  {{helper "..." ...}}
  ```

  with

  ```handlebars
  {{helper (-resolve "helper:...") ...}}
  ```

  and

  ```handlebars
  {{helper ... ...}}
  ```

  with

  ```handlebars
  {{helper (-disallow-dynamic-resolution ...) ...}}
  ```

  and

  ```handlebars
  {{modifier "..." ...}}
  ```

  with

  ```handlebars
  {{modifier (-resolve "modifier:...") ...}}
  ```
  and

  ```handlebars
  {{modifier ... ...}}
  ```

  with

  ```handlebars
  {{modifier (-disallow-dynamic-resolution ...) ...}}
  ```

  @private
  @class TransformResolutions
*/

const TARGETS = Object.freeze(['helper', 'modifier']);
function transformResolutions(env) {
  let {
    builders: b
  } = env.syntax;
  let moduleName = env.meta?.moduleName;
  let {
    hasLocal,
    node: tracker
  } = trackLocals(env);
  let seen;
  return {
    name: 'transform-resolutions',
    visitor: {
      Template: {
        enter() {
          seen = new Set();
        },
        exit() {
          seen = undefined;
        }
      },
      Block: tracker,
      ElementNode: {
        keys: {
          children: tracker
        }
      },
      MustacheStatement(node) {
        if (seen.has(node)) {
          return;
        }
        if (isPath(node.path) && !isLocalVariable(node.path, hasLocal) && TARGETS.indexOf(node.path.original) !== -1) {
          let result = b.mustache(node.path, transformParams(b, node.params, node.path.original, moduleName, node.loc), node.hash, node.trusting, node.loc, node.strip);

          // Avoid double/infinite-processing
          seen.add(result);
          return result;
        }
      },
      SubExpression(node) {
        if (seen.has(node)) {
          return;
        }
        if (isPath(node.path) && !isLocalVariable(node.path, hasLocal) && TARGETS.indexOf(node.path.original) !== -1) {
          let result = b.sexpr(node.path, transformParams(b, node.params, node.path.original, moduleName, node.loc), node.hash, node.loc);

          // Avoid double/infinite-processing
          seen.add(result);
          return result;
        }
      }
    }
  };
}
function isLocalVariable(node, hasLocal) {
  return !(node.head.type === 'ThisHead') && node.tail.length === 1 && hasLocal(node.head.original);
}
function transformParams(b, params, type, moduleName, loc) {
  let [first, ...rest] = params;
  if (isStringLiteral(first)) {
    return [b.sexpr(b.path('-resolve', first.loc), [b.string(`${type}:${first.value}`)], undefined, first.loc), ...rest];
  } else {
    return params;
  }
}

export { transformResolutions as default };
