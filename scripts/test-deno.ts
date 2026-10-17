#!/usr/bin/env -S deno run -A
/**
 * Runs the node test suite (test/node.ts) under Deno, through qunitx's Deno
 * build, which reports through Deno.test:
 *
 *   deno run -A scripts/test-deno.ts                      against the workspace sources
 *   deno run -A scripts/test-deno.ts --packages-from=DIR  against packages installed in DIR
 *
 * Node runs the suite's files as they are (scripts/register.ts); Deno cannot
 * yet. It compiles decorators with standard class-field semantics whatever
 * deno.json says, under which a legacy `@tracked` field is overwritten by its
 * own initializer. So esbuild bundles the suite first, compiling decorators as
 * the build does, and Deno runs the bundle.
 */
import { mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTFILE = `${ROOT}/tmp/deno-tests.mjs`;
const flag = process.argv.find((argument) => argument.startsWith('--packages-from='));
const packagesFrom = flag ? resolve(flag.slice('--packages-from='.length)) : undefined;

/**
 * Resolves @emberx/* from `directory`'s node_modules rather than the
 * workspace. @emberx/vendor follows along, so the suite and the installed
 * packages share one renderer and autotracking registry: two copies would make
 * reactivity tests fail for the wrong reason.
 */
function installedPackagesPlugin(directory: string): esbuild.Plugin {
  return {
    name: 'emberx:installed-packages',
    setup(build) {
      build.onResolve({ filter: /^@emberx\// }, (args) => {
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
const singleQUnitPlugin: esbuild.Plugin = {
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

await mkdir(dirname(OUTFILE), { recursive: true });
await esbuild.build({
  entryPoints: [`${ROOT}/test/node.ts`],
  outfile: OUTFILE,
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'es2022',
  sourcemap: 'inline',
  logLevel: 'warning',
  // Prefer each dependency's ESM build. esbuild defaults to `main` (CommonJS)
  // for platform: 'node'; every other emberx bundle consumes `module`.
  mainFields: ['module', 'main'],
  // qunitx picks its build from these: `deno` reports through Deno.test.
  conditions: ['deno', 'node'],
  // CommonJS dependencies inlined into an ESM bundle still call `require` for
  // node builtins (util, crypto, ...), and ESM has no `require` of its own.
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
  plugins: [singleQUnitPlugin, ...(packagesFrom ? [installedPackagesPlugin(packagesFrom)] : [])],
});

// jsdom's globals have to exist before the bundle evaluates.
const { status } = spawnSync(
  'deno',
  ['test', '--no-check', '--allow-read', '--allow-env', '--preload', 'test/setup-dom.js', OUTFILE],
  { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' },
);
process.exit(status ?? 1);
