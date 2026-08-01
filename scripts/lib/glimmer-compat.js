/**
 * esbuild plugins that make the Glimmer VM packages consumable as plain ESM,
 * in the browser and in node, without a bundler-specific runtime.
 *
 * Historically emberx solved these by rewriting files inside `node_modules`
 * before every build (scripts/fix-*.js, scripts/dedupe-*.js). That made builds
 * non-reproducible from a clean `npm install` and silently broke whenever a
 * Glimmer patch release shifted a line. These plugins do the same work in
 * memory, at build time, and fail loudly when upstream no longer matches.
 */

/**
 * `@glimmer/compiler` computes a default template id by reaching for node's
 * `crypto` module:
 *
 *   let req = typeof module === 'object' && typeof module.require === 'function'
 *     ? module.require : require;
 *
 * Evaluating the bare `require` identifier throws `ReferenceError` the moment
 * the module is imported anywhere `require` is not defined — i.e. browser
 * bundles and native node ESM. The IIFE runs at import time, so merely
 * importing `@glimmer/compiler` is enough to crash.
 *
 * emberx never uses `defaultId`: `@emberx/component/src/create-template.ts`
 * passes its own monotonic id to `precompileJSON`. So we replace the IIFE with
 * an equivalent counter, which is deterministic, dependency-free and identical
 * across browser, node and Deno.
 */
export function glimmerCompilerCryptoPlugin() {
  const MARKER = 'export const defaultId = (() => {';
  const END_MARKER = 'const defaultOptions = {';

  return {
    name: 'emberx:glimmer-compiler-crypto',
    setup(build) {
      build.onLoad({ filter: /@glimmer[\\/]compiler[\\/].*[\\/]lib[\\/]compiler\.js$/ }, async (args) => {
        const { readFile } = await import('node:fs/promises');
        const source = await readFile(args.path, 'utf8');

        const start = source.indexOf(MARKER);
        const end = source.indexOf(END_MARKER);

        if (start === -1 || end === -1 || end < start) {
          // Upstream changed shape. Do not silently ship a half-patched compiler.
          throw new Error(
            `[emberx] Could not patch ${args.path}.\n` +
              `Expected to find ${JSON.stringify(MARKER)} followed by ${JSON.stringify(END_MARKER)}.\n` +
              `@glimmer/compiler probably changed its defaultId implementation. ` +
              `Check whether the bare \`require\` call is gone; if so, delete this plugin.`,
          );
        }

        const replacement =
          'let __emberxTemplateId = 0;\n' + 'export const defaultId = () => String(++__emberxTemplateId);\n';

        return {
          contents: source.slice(0, start) + replacement + source.slice(end),
          loader: 'js',
        };
      });
    },
  };
}

/**
 * Every emberx package is consumed by the others through its bare specifier
 * (`@emberx/component`, not a relative path). When building or testing from a
 * checkout we want those to resolve to the workspace *sources*, so a change in
 * one package is picked up without an intermediate publish or build step.
 *
 * @param {string} rootDir absolute path to the repository root
 * @param {string[]} packageNames e.g. ['component', 'router']
 */
export function emberxWorkspacePlugin(rootDir, packageNames) {
  const filter = new RegExp(`^@emberx/(${packageNames.join('|')})(/.*)?$`);

  return {
    name: 'emberx:workspace-sources',
    setup(build) {
      build.onResolve({ filter }, async (args) => {
        const { stat } = await import('node:fs/promises');
        const [, name, subpath] = args.path.match(filter);
        const base = `${rootDir}/packages/@emberx/${name}`;

        // Bare package specifier -> the package's own entry point.
        if (!subpath) return { path: `${base}/src/index.ts` };

        // Subpath import. `@emberx/component/test` is a directory of test
        // modules with an index; `@emberx/helper/object/assign` is a file.
        // Try each candidate in the order node/TypeScript would.
        const target = `${base}${subpath}`;
        const candidates = [
          `${target}.ts`,
          `${target}.js`,
          `${target}/index.ts`,
          `${target}/index.js`,
          target,
        ];

        for (const candidate of candidates) {
          try {
            const stats = await stat(candidate);
            if (stats.isFile()) return { path: candidate };
          } catch {
            // Not this one; keep looking.
          }
        }

        return {
          errors: [
            {
              text:
                `Cannot resolve "${args.path}" to a file under ${base}. ` + `Tried: ${candidates.join(', ')}`,
            },
          ],
        };
      });
    },
  };
}
