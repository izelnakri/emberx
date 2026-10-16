function isPath(node) {
  return node.type === 'PathExpression';
}
function isSubExpression(node) {
  return node.type === 'SubExpression';
}
function isStringLiteral(node) {
  return node.type === 'StringLiteral';
}
function inScope(env, name) {
  return Boolean(env.lexicalScope?.(name));
}
function getLocalName(node) {
  if (typeof node === 'string') {
    return node;
  } else {
    return node.original;
  }
}
function trackLocals(env) {
  let locals = new Map();
  let node = {
    enter(node) {
      let params = 'params' in node ? node.params : node.blockParams;
      for (let param of params) {
        let name = getLocalName(param);
        let value = locals.get(param) || 0;
        locals.set(name, value + 1);
      }
    },
    exit(node) {
      let params = 'params' in node ? node.params : node.blockParams;
      for (let param of params) {
        let name = getLocalName(param);
        let value = locals.get(name) - 1;
        if (value === 0) {
          locals.delete(name);
        } else {
          locals.set(name, value);
        }
      }
    }
  };
  return {
    hasLocal: key => locals.has(key) || inScope(env, key),
    node,
    visitor: {
      Template: node,
      ElementNode: node,
      Block: node
    }
  };
}

export { inScope, isPath, isStringLiteral, isSubExpression, trackLocals };
