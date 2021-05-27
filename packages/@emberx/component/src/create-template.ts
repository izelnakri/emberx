import { templateFactory } from '@glimmer/opcode-compiler';
import { precompileJSON, PrecompileOptions } from '@glimmer/compiler';

interface ScopeValues {
  [key: string]: any;
}

let templateId = 0;
export default function createTemplate(
  templateSource: string,
  options: PrecompileOptions,
  scopeValues: ScopeValues = {}
) {
  options.locals = options.locals ?? Object.keys(scopeValues ?? {});

  let [block, usedLocals]: [any, any] = precompileJSON(templateSource, options);
  let reifiedScopeValues = usedLocals.map((key: string) => scopeValues[key]);
  let templateBlock = {
    id: String(templateId++),
    block: JSON.stringify(block),
    moduleName: options.meta?.moduleName ?? '(unknown template module)',
    scope: reifiedScopeValues.length > 0 ? () => reifiedScopeValues : null,
    isStrictMode: options.strictMode ?? false,
  };

  return templateFactory(templateBlock);
}
