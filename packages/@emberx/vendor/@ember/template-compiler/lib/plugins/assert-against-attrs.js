import { trackLocals } from './utils.js';

/**
 @module ember
*/

/**
  A Glimmer2 AST transformation that asserts against

  ```handlebars
  {{attrs.foo.bar}}
  ```

  ...as well as `{{#if attrs.foo}}`, `{{deeply (nested attrs.foobar.baz)}}`.

  @private
  @class AssertAgainstAttrs
*/

function assertAgainstAttrs(env) {
  let {
    builders: b
  } = env.syntax;
  env.meta?.moduleName;
  let {
    hasLocal,
    visitor
  } = trackLocals(env);
  return {
    name: 'assert-against-attrs',
    visitor: {
      ...visitor,
      PathExpression(node) {
        if (isAttrs(node, hasLocal)) ; else if (isThisDotAttrs(node)) {
          return b.path(`@${node.original.slice(11)}`, node.loc);
        }
      }
    }
  };
}
function isAttrs(node, hasLocal) {
  return node.head.type === 'VarHead' && node.head.name === 'attrs' && !hasLocal(node.head.name);
}
function isThisDotAttrs(node) {
  return node.head.type === 'ThisHead' && node.tail[0] === 'attrs';
}

export { assertAgainstAttrs as default };
