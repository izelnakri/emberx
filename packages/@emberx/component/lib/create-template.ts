import { templateFactory } from '@glimmer/opcode-compiler';
import { precompileJSON } from '@glimmer/compiler';

let templateId = 0;
export default function createTemplate(templateSource, options, scopeValues = {}) {
  options.locals = options.locals ?? Object.keys(scopeValues ?? {});
  debugger;
  let [block, usedLocals] = precompileJSON(templateSource, options);
  let reifiedScopeValues = usedLocals.map((key) => scopeValues[key]);

  let templateBlock = {
    id: String(templateId++),
    block: JSON.stringify(block),
    moduleName: options.meta?.moduleName ?? '(unknown template module)',
    scope: reifiedScopeValues.length > 0 ? () => reifiedScopeValues : null,
    isStrictMode: options.strictMode ?? false,
  };

  debugger;
  return templateFactory(templateBlock);
}

