import { isPath } from './utils.js';

/**
 @module ember
*/

/**
  A Glimmer2 AST transformation that replaces all instances of

  ```handlebars
  {{#each-in iterableThing as |key value|}}
  ```

  with

  ```handlebars
  {{#each (-each-in iterableThing) as |value key|}}
  ```

  @private
  @class TransformHasBlockSyntax
*/
function transformEachInIntoEach(env) {
  let {
    builders: b
  } = env.syntax;
  return {
    name: 'transform-each-in-into-each',
    visitor: {
      BlockStatement(node) {
        if (isPath(node.path) && node.path.original === 'each-in') {
          node.params[0] = b.sexpr(b.path('-each-in'), [node.params[0]]);
          let blockParams = node.program.blockParams;
          if (!blockParams || blockParams.length === 0) ; else if (blockParams.length === 1) {
            // insert a dummy variable for the first slot
            // pick a name that won't parse so it won't shadow any real variables
            blockParams = ['( unused value )', blockParams[0]];
          } else {
            let key = blockParams.shift();
            let value = blockParams.shift();
            blockParams = [value, key, ...blockParams];
          }
          node.program.blockParams = blockParams;
          return b.block(b.path('each'), node.params, node.hash, node.program, node.inverse, node.loc);
        }
      }
    }
  };
}

export { transformEachInIntoEach as default };
