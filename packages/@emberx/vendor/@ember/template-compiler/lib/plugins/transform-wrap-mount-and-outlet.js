import { isPath, trackLocals } from './utils.js';

/**
 @module ember
*/

/**
  A Glimmer2 AST transformation that replaces all instances of

  ```handlebars
  {{mount "engine" model=this.model}}
  ```

  with

  ```handlebars
  {{component (-mount "engine" model=this.model)}}
  ```

  and

  ```handlebars
  {{outlet}}
  ```

  with

  ```handlebars
  {{component (-outlet)}}
  ```

  @private
  @class TransformHasBlockSyntax
*/
function transformWrapMountAndOutlet(env) {
  let {
    builders: b
  } = env.syntax;
  let {
    hasLocal,
    visitor
  } = trackLocals(env);
  return {
    name: 'transform-wrap-mount-and-outlet',
    visitor: {
      ...visitor,
      MustacheStatement(node) {
        if (isPath(node.path) && (node.path.original === 'mount' || node.path.original === 'outlet') && !hasLocal(node.path.original)) {
          let subexpression = b.sexpr(b.path(`-${node.path.original}`), node.params, node.hash, node.loc);
          return b.mustache(b.path('component'), [subexpression], b.hash(), undefined, node.loc);
        }
      }
    }
  };
}

export { transformWrapMountAndOutlet as default };
