import { trackLocals, isPath } from './utils.js';

/**
 @module ember
*/

/**
  A Glimmer2 AST transformation that replaces all instances of

  ```handlebars
 <button {{action 'foo'}}>
 <button onblur={{action 'foo'}}>
 <button onblur={{action (action 'foo') 'bar'}}>
  ```

  with

  ```handlebars
 <button {{action this 'foo'}}>
 <button onblur={{action this 'foo'}}>
 <button onblur={{action this (action this 'foo') 'bar'}}>
  ```

  @private
  @class TransformActionSyntax
*/

function transformActionSyntax(env) {
  let {
    builders: b
  } = env.syntax;
  let {
    hasLocal,
    visitor
  } = trackLocals(env);
  return {
    name: 'transform-action-syntax',
    visitor: {
      ...visitor,
      ElementModifierStatement(node) {
        if (isAction(node, hasLocal)) {
          insertThisAsFirstParam(node, b);
        }
      },
      MustacheStatement(node) {
        if (isAction(node, hasLocal)) {
          insertThisAsFirstParam(node, b);
        }
      },
      SubExpression(node) {
        if (isAction(node, hasLocal)) {
          insertThisAsFirstParam(node, b);
        }
      }
    }
  };
}
function isAction(node, hasLocal) {
  return isPath(node.path) && node.path.original === 'action' && !hasLocal('action');
}
function insertThisAsFirstParam(node, builders) {
  node.params.unshift(builders.path('this'));
}

export { transformActionSyntax as default };
