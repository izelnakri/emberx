#!/usr/bin/env node
/**
 * Builds every @emberx package to `dist/`.
 *
 * Each package is bundled to a single ESM file with all bare specifiers left
 * external, so package boundaries survive: `@emberx/router` still imports
 * `@emberx/component` at runtime rather than inlining a copy of it. Relative
 * imports and vendored files (e.g. router's location-bar) are inlined.
 *
 * Type declarations are emitted separately by `tsc --emitDeclarationOnly`,
 * which is the only thing esbuild cannot do.
 *
 * Replaces the previous pipeline (tsc -> babel-over-every-emitted-file, or in
 * development a per-file babel invocation), which needed
 * babel-plugin-module-extension-resolver to make relative imports node-ESM
 * resolvable. Bundling removes that problem entirely.
 */
import { rm, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import * as esbuild from 'esbuild';

import { glimmerCompilerCryptoPlugin } from './lib/glimmer-compat.js';

const exec = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Build order is irrelevant (packages are external to each other) but kept stable for readable logs. */
export const PACKAGES = ['string', 'helper', 'component', 'router', 'test-helpers', 'ssr'];

const isDevelopment = process.env.ENVIRONMENT === 'development';

/** Mark every bare specifier external; only relative/absolute imports get inlined. */
const externalizeBareImports = {
  name: 'emberx:externalize-bare-imports',
  setup(build) {
    build.onResolve({ filter: /^[^./]|^\.[^./]/ }, (args) => {
      if (args.kind === 'entry-point') return null;
      return { path: args.path, external: true };
    });
  },
};

async function buildPackage(name) {
  const packageDir = `${ROOT}/packages/@emberx/${name}`;

  await rm(`${packageDir}/dist`, { recursive: true, force: true });
  await mkdir(`${packageDir}/dist`, { recursive: true });

  await esbuild.build({
    entryPoints: [`${packageDir}/src/index.ts`],
    outfile: `${packageDir}/dist/index.js`,
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    target: 'es2022',
    sourcemap: isDevelopment ? 'inline' : true,
    minify: false,
    logLevel: 'warning',
    plugins: [externalizeBareImports, glimmerCompilerCryptoPlugin()],
  });

  return name;
}

/**
 * Emits .d.ts files for every package in one tsc pass, then moves each
 * package's declarations next to its bundle.
 *
 * tsc is run once (not once per package) because six sequential compiler
 * startups dominate the build. It emits into `.tmp/types/@emberx/<pkg>/src/`,
 * mirroring `rootDir: packages`, and we relocate that into
 * `packages/@emberx/<pkg>/dist/` so `types: ./dist/index.d.ts` resolves.
 */
async function emitTypes() {
  const staging = `${ROOT}/.tmp/types`;

  await rm(staging, { recursive: true, force: true });

  try {
    await exec('node_modules/.bin/tsc', ['--project', 'tsconfig.build.json'], { cwd: ROOT });
  } catch (error) {
    // tsc writes diagnostics to stdout, not stderr.
    process.stderr.write(error.stdout || error.message);
    throw new Error('Type declaration emit failed');
  }

  const { cp } = await import('node:fs/promises');

  await Promise.all(
    PACKAGES.map((name) =>
      cp(`${staging}/@emberx/${name}/src`, `${ROOT}/packages/@emberx/${name}/dist`, {
        recursive: true,
      }),
    ),
  );

  await rm(`${ROOT}/.tmp`, { recursive: true, force: true });
}

async function main() {
  const started = Date.now();

  const built = await Promise.all(PACKAGES.map(buildPackage));
  process.stdout.write(`built ${built.length} packages: ${built.join(', ')}\n`);

  if (!isDevelopment) {
    await emitTypes();
    process.stdout.write('emitted type declarations\n');
  }

  process.stdout.write(`done in ${Date.now() - started}ms\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}

export { buildPackage, emitTypes, externalizeBareImports, ROOT };
