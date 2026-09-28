import { template } from '@ember/template-compiler/runtime';
import { getComponentTemplate } from '@glimmer/manager';

interface ScopeValues {
  [key: string]: any;
}

interface CreateTemplateOptions {
  strictMode?: boolean;
  moduleName?: string;
}

/**
 * Compiles a template at runtime, with `scopeValues` as its lexical scope, and
 * returns the template for `setComponentTemplate`.
 *
 * This is Ember's public runtime compiler (`template()` from
 * @ember/template-compiler/runtime). It compiles to JavaScript source and
 * evaluates it with `new Function`, so a page served with a Content Security
 * Policy needs `'unsafe-eval'`. The glimmer-vm 0.84 path this replaces compiled
 * to a JSON wire format and needed no eval; Ember no longer exports that entry
 * point.
 */
export default function createTemplate(
  templateSource: string,
  options: CreateTemplateOptions = {},
  scopeValues: ScopeValues = {},
) {
  const component = template(templateSource, {
    strictMode: options.strictMode ?? true,
    moduleName: options.moduleName,
    scope: () => scopeValues,
  } as any);

  return getComponentTemplate(component as object);
}
