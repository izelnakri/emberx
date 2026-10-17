/**
 * Template compilation at build time, for a production build that would rather
 * not compile templates in the browser. emberx compiles each template on its
 * first render, which is what lets it run with no build step, at the cost of
 * Ember's compiler on every cold load, and of the `'unsafe-eval'` a Content
 * Security Policy needs for the JavaScript that compiler emits.
 *
 * precompileTemplates() rewrites a module's hbs templates to what Ember's
 * compiler makes of them, so that a component only builds its template from
 * that in the browser, with Ember's createTemplateFactory and no eval. Any
 * template left as it was still compiles at runtime: a build can apply it to
 * some files, all of them, or none.
 *
 * It compiles each template in strict mode against what the component has in
 * scope at runtime: the built-in helpers, and the names in a
 * `static includes = { ... }` of the same module. A name it cannot see there,
 * one spread in from elsewhere for one, fails the build with Ember's "not in
 * scope" error, which names it.
 *
 * It reads the source as text, as a regular expression can: an hbs tag right
 * after a backtick, as prose writes it, is not a template, but one in a comment
 * or a string otherwise is.
 */
import { precompile } from '@emberx/vendor/ember-template-compiler';
import BUILTINS from './builtins.ts';

const ESCAPES: Record<string, string> = { n: '\n', r: '\r', t: '\t' };

interface PrecompileOptions {
  /** The names the template has in scope besides the built-in helpers: its component's `includes`. */
  includes?: Iterable<string>;
  /** Where the template is, for error messages. */
  moduleName?: string;
}

/**
 * Compiles one template to a JavaScript expression: a function that takes the
 * template's scope and returns its wire format, which is what a component's
 * `static template` may be instead of a string.
 */
export function precompileTemplate(template: string, { includes = [], moduleName }: PrecompileOptions = {}): string {
  const inScope = new Set([...Object.keys(BUILTINS), ...includes]);
  const used = new Set<string>();
  const wireFormat = precompile(template, {
    strictMode: true,
    moduleName,
    lexicalScope: (name: string) => {
      if (!inScope.has(name)) return false;

      used.add(name);
      return true;
    },
  });

  return `(({ ${[...used].join(', ')} }) => (${wireFormat}))`;
}

/**
 * Rewrites every hbs-tagged template literal in a module's source to a
 * precompiled template. One with a `${...}` in it is left as it is: hbs reads
 * only what comes before the first one, at runtime.
 */
export function precompileTemplates(code: string, { moduleName }: Pick<PrecompileOptions, 'moduleName'> = {}): string {
  // Each key that is a JavaScript name, as only those can be a template's: not a spread, nor a quoted `'x-y'`.
  const includes = [...code.matchAll(/static\s+includes\s*=\s*\{([^}]*)\}/g)].flatMap(([, body]) =>
    body
      .split(',')
      .map((entry) => entry.split(':')[0].trim())
      .filter((name) => /^[\w$]+$/.test(name)),
  );

  // \x60 is a backtick, written so that this file has no tagged template in it to find.
  return code.replace(/(?<![\x60\w$])hbs\x60((?:[^\x60\\]|\\[\s\S])*)\x60/g, (literal, template: string) =>
    template.includes('${') ? literal : precompileTemplate(applyEscapes(template), { includes, moduleName }),
  );
}

/** A template literal's text as hbs receives it, its escapes applied. */
function applyEscapes(raw: string): string {
  return raw.replace(/\\([\s\S])/g, (_, character: string) => ESCAPES[character] ?? character);
}
