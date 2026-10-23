import { getComponentTemplate } from '@emberx/vendor/@glimmer/manager';

interface ScopeValues {
  [key: string]: any;
}

interface CreateTemplateOptions {
  strictMode?: boolean;
  moduleName?: string;
}

/** Ember's runtime template compiler, once loadTemplateCompiler() loaded it. */
let compiler: typeof import('@emberx/vendor/@ember/template-compiler/runtime') | undefined;

/**
 * Loads Ember's runtime template compiler, which createTemplate needs. It is
 * imported only when a template is to be compiled at runtime, so a page whose
 * templates a build compiled (@emberx/component/precompile) never loads it:
 * renderComponent loads it when a component it renders has a template as a
 * string. Code that calls createTemplate or setTemplate itself awaits this first.
 */
export async function loadTemplateCompiler(): Promise<void> {
  compiler ??= await import('@emberx/vendor/@ember/template-compiler/runtime');
}

/** Whether loadTemplateCompiler() has loaded the compiler. */
export function isTemplateCompilerLoaded(): boolean {
  return compiler !== undefined;
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
): object | undefined {
  if (!compiler) {
    throw new Error(
      'The template compiler is not loaded: `await loadTemplateCompiler()` from @emberx/component before compiling a template yourself. renderComponent loads it on its own.',
    );
  }

  const component = compiler.template(templateSource, {
    strictMode: options.strictMode ?? true,
    moduleName: options.moduleName,
    scope: () => scopeValues,
  } as any);

  return getComponentTemplate(component as object);
}
