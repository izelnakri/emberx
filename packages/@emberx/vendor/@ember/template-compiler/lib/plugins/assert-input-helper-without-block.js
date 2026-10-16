import { isPath, trackLocals } from './utils.js';

function errorOnInputWithContent(env) {
  env.meta?.moduleName;
  let {
    hasLocal,
    visitor
  } = trackLocals(env);
  return {
    name: 'assert-input-helper-without-block',
    visitor: {
      ...visitor,
      BlockStatement(node) {
        if (hasLocal('input')) return;
        if (isPath(node.path) && node.path.original === 'input') ;
      }
    }
  };
}

export { errorOnInputWithContent as default };
