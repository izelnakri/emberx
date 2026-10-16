import calculateLocationDisplay from '../system/calculate-location-display.js';
import { trackLocals } from './utils.js';

/**
 @module ember
*/

/**
  Prevents usage of named outlets, a legacy concept in Ember removed in 4.0.

  @private
  @class AssertAgainstNamedOutlets
*/
function assertAgainstNamedOutlets(env) {
  let moduleName = env.meta?.moduleName;
  let {
    hasLocal,
    visitor
  } = trackLocals(env);
  return {
    name: 'assert-against-named-outlets',
    visitor: {
      ...visitor,
      MustacheStatement(node) {
        if (node.path.type === 'PathExpression' && node.path.original === 'outlet' && node.params[0] && !hasLocal('outlet')) {
          calculateLocationDisplay(moduleName, node.loc);
        }
      }
    }
  };
}

export { assertAgainstNamedOutlets as default };
