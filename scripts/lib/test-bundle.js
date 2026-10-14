/**
 * Bundles test/node.ts, the suite that runs outside a browser, for node or Deno.
 * Neither can run most test modules directly: they use legacy decorators
 * (@tracked, @action, @service), which node's type stripping rejects and Deno
 * compiles with standard class-field semantics. esbuild transpiles them the way
 * the rest of the build does. The modules that use none, such as
 * @emberx/string's, already run as they are: `node --test` or `deno test` on them.
 *
 * `packagesFrom` points the bundle at installed @emberx packages instead of the
 * workspace sources: scripts/test-release.sh uses it to run this suite against
 * the packed tarballs.
 */
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

import { glimmerCompilerCryptoPlugin, emberxWorkspacePlugin } from './glimmer-compat.js';
import { PACKAGES } from '../build.js';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * Resolves @emberx/* and @glimmer/* from `directory`'s node_modules rather than
 * the workspace. @glimmer/* follows along so the suite and the installed
 * packages share one @glimmer/validator: two copies would mean two autotracking
 * registries, and reactivity tests would fail for the wrong reason.
 */
function installedPackagesPlugin(directory) {
  return {
    name: 'emberx:installed-packages',
    setup(build) {
      build.onResolve({ filter: /^@(emberx|glimmer)\// }, (args) => {
        // build.resolve re-enters this callback; the marker ends the recursion.
        if (args.pluginData?.fromInstalled) return null;
        return build.resolve(args.path, {
          kind: args.kind,
          resolveDir: directory,
          pluginData: { fromInstalled: true },
        });
      });
    },
  };
}

/**
 * qunitx's Deno build inlines QUnit, and its shared assert module also imports
 * vendor/qunit.js for the side effect. With a DOM present (jsdom here) both
 * copies register themselves on `window`, and the second throws "QUnit has
 * already been defined". The Deno build wires its own QUnit into Assert, so the
 * second import is dropped. Without a DOM, as in qunitx's own Deno tests, the
 * duplicate never surfaces.
 */
const singleQUnitPlugin = {
  name: 'emberx:single-qunit',
  setup(build) {
    build.onResolve({ filter: /vendor\/qunit\.js$/ }, (args) =>
      /[\\/]qunitx[\\/]dist[\\/]shared[\\/]/.test(args.importer)
        ? { path: 'qunitx-vendor-qunit', namespace: 'emberx-empty' }
        : null,
    );
    build.onLoad({ filter: /.*/, namespace: 'emberx-empty' }, () => ({ contents: '', loader: 'js' }));
  },
};

export async function bundleTestSuite({ runtime = 'node', outfile, packagesFrom } = {}) {
  await mkdir(dirname(outfile), { recursive: true });

  await esbuild.build({
    entryPoints: [`${ROOT}/test/node.ts`],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'esnext',
    sourcemap: 'inline',
    logLevel: 'warning',
    // Prefer each dependency's ESM build. esbuild defaults to `main` (CommonJS)
    // for platform: 'node'; every other emberx bundle consumes `module`.
    mainFields: ['module', 'main'],
    // qunitx picks its build from these: `deno` reports through Deno.test,
    // `node` through node:test. Deno runs node packages, so `node` stays on.
    conditions: runtime === 'deno' ? ['deno', 'node'] : ['node'],
    // CommonJS dependencies inlined into an ESM bundle still call `require` for
    // node builtins (util, crypto, ...), and ESM has no `require` of its own.
    banner: {
      js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
    },
    plugins: [
      ...(runtime === 'deno' ? [singleQUnitPlugin] : []),
      packagesFrom ? installedPackagesPlugin(packagesFrom) : emberxWorkspacePlugin(ROOT, PACKAGES),
      glimmerCompilerCryptoPlugin(),
    ],
  });

  return outfile;
}

/** `--packages-from=<dir>` from argv, resolved, or undefined. */
export function packagesFromArgv(argv = process.argv) {
  const flag = argv.find((argument) => argument.startsWith('--packages-from='));
  return flag ? resolve(flag.slice('--packages-from='.length)) : undefined;
}
