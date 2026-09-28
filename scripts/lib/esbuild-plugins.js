/**
 * esbuild plugins shared by the package build, the node suite, the dev server
 * and (through package.json#qunitx.plugins) the browser suite.
 */
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * The Glimmer VM and Ember's public modules ship inside `ember-source`, which
 * publishes them as `ember-source/@glimmer/manager/index.js`,
 * `ember-source/@ember/renderer/index.js` and so on. Its type declarations, on
 * the other hand, declare the familiar bare names (`@glimmer/manager`,
 * `@ember/renderer`), and those names only resolve inside an Embroider build.
 *
 * So emberx source imports the bare names, which typecheck, and this plugin
 * rewrites each one to the `ember-source/...` path that actually exists. With
 * `external: true` the rewrite is left in the output, which is how the
 * published dist/ reaches ember-source without asking consumers to alias
 * anything. Otherwise the path is resolved and bundled.
 *
 * Only names ember-source really provides are rewritten; anything else under
 * @ember/ or @glimmer/ falls through to normal resolution.
 */
export function emberSourcePlugin({ external = false } = {}) {
  const packagesDir = join(dirname(require.resolve('ember-source/package.json')), 'dist', 'prod', 'packages');

  function emberSourcePath(specifier) {
    if (existsSync(join(packagesDir, `${specifier}.js`))) return `ember-source/${specifier}.js`;
    if (existsSync(join(packagesDir, specifier, 'index.js'))) return `ember-source/${specifier}/index.js`;
    return null;
  }

  return {
    name: 'emberx:ember-source',
    setup(build) {
      build.onResolve({ filter: /^@(ember|glimmer)\// }, (args) => {
        const target = emberSourcePath(args.path);
        if (!target) return null;
        if (external) return { path: target, external: true };
        return build.resolve(target, { kind: args.kind, resolveDir: args.resolveDir ?? ROOT });
      });
    },
  };
}

/** qunitx-cli loads `"./scripts/lib/esbuild-plugins.js"` from package.json#qunitx.plugins and calls this. */
export default function qunitxPlugin() {
  return emberSourcePlugin();
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
        const candidates = [`${target}.ts`, `${target}.js`, `${target}/index.ts`, `${target}/index.js`, target];

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
              text: `Cannot resolve "${args.path}" to a file under ${base}. ` + `Tried: ${candidates.join(', ')}`,
            },
          ],
        };
      });
    },
  };
}
