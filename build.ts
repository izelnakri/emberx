#!/usr/bin/env -S deno run -A
/**
 * Builds every @emberx package to `dist/`, the directory a release publishes.
 *
 * Each package is bundled to a single ESM file with all bare specifiers left
 * external, so package boundaries survive: `@emberx/router` still imports
 * `@emberx/component` and `@emberx/vendor` at runtime rather than inlining a
 * copy of them.
 *
 * Type declarations are emitted separately, through the TypeScript compiler
 * API with tsconfig.build.json, which is the only thing esbuild cannot do.
 *
 *   deno run -A build.ts
 *
 * Only publishing needs it. In the repo each package's exports point at its
 * src/, so the tests, the dev server, the benchmarks and the doctests run the
 * sources; dist/ gets a package.json of its own whose exports point at the
 * bundle and its declarations, with the package's README and LICENSE, and that
 * is what `npm publish` and `npm pack` are given.
 *
 * Replaces the previous pipeline (tsc -> babel-over-every-emitted-file, or in
 * development a per-file babel invocation), which needed
 * babel-plugin-module-extension-resolver to make relative imports node-ESM
 * resolvable. Bundling removes that problem entirely.
 */

import { existsSync } from 'node:fs';
import { cp, rm, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname } from 'node:path';
import * as esbuild from 'esbuild';
import ts from 'typescript';

const ROOT = dirname(fileURLToPath(import.meta.url));

/** Build order is irrelevant (packages are external to each other) but kept stable for readable logs. */
export const PACKAGES = ['string', 'helper', 'component', 'router', 'test-helpers', 'ssr'];

/** What a release publishes, leaf first: @emberx/vendor (scripts/build-emberx-vendor.ts), which has no build, then PACKAGES. */
export const PUBLISHED = ['vendor', ...PACKAGES];

/** The directory `npm publish` and `npm pack` are given: a built package's dist/, or @emberx/vendor itself. */
export function publishedDirectory(name: string): string {
  return name === 'vendor' ? `${ROOT}/packages/@emberx/vendor` : `${ROOT}/packages/@emberx/${name}/dist`;
}

/** Mark every bare specifier external; only relative/absolute imports get inlined. */
const externalizeBareImports: esbuild.Plugin = {
  name: 'emberx:externalize-bare-imports',
  setup(build) {
    build.onResolve({ filter: /^[^./]|^\.[^./]/ }, (args) => {
      if (args.kind === 'entry-point') return null;
      return { path: args.path, external: true };
    });
  },
};

async function buildPackage(name: string) {
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
    sourcemap: true,
    minify: false,
    logLevel: 'warning',
    plugins: [externalizeBareImports],
  });

  return name;
}

/**
 * Emits .d.ts files for every package in one compiler pass, then moves each
 * package's declarations next to its bundle.
 *
 * The compiler runs once (not once per package) because six sequential
 * compiler startups dominate the build. It runs in this process, through the
 * compiler API, so it is the same on Deno and node and on every platform. It emits into `.tmp/types/@emberx/<pkg>/src/`,
 * mirroring `rootDir: packages`, and we relocate that into
 * `packages/@emberx/<pkg>/dist/` so `types: ./dist/index.d.ts` resolves.

 */
async function emitTypes() {
  const staging = `${ROOT}/.tmp/types`;

  await rm(staging, { recursive: true, force: true });

  const { config, error } = ts.readConfigFile(`${ROOT}/tsconfig.build.json`, ts.sys.readFile);
  const { options, fileNames, errors } = ts.parseJsonConfigFileContent(config, ts.sys, ROOT);
  const program = ts.createProgram(fileNames, options);
  const diagnostics = [
    ...(error ? [error] : []),
    ...errors,
    ...ts.getPreEmitDiagnostics(program),
    ...program.emit().diagnostics,
  ];

  if (diagnostics.length > 0) {
    process.stderr.write(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: () => ROOT,
        getNewLine: () => '\n',
      }),
    );
    throw new Error('Type declaration emit failed');
  }

  await pointDeclarationsAtJavaScript(staging);
  await Promise.all(
    PACKAGES.map((name) =>
      cp(`${staging}/@emberx/${name}/src`, `${ROOT}/packages/@emberx/${name}/dist`, {
        recursive: true,
      }),
    ),
  );

  await rm(`${ROOT}/.tmp`, { recursive: true, force: true });
}

/**
 * Sources import each other as `./module.ts`, which is what node and Deno need
 * to run them unbundled. tsc copies those specifiers into the declarations
 * as they are (`rewriteRelativeImportExtensions` only covers JavaScript), but a
 * consumer has `./module.d.ts` and `./module.js`, never `./module.ts`.
 */
async function pointDeclarationsAtJavaScript(directory: string) {
  const declarations = (await readdir(directory, { recursive: true })).filter((path) => path.endsWith('.d.ts'));

  await Promise.all(
    declarations.map(async (path) => {
      const file = `${directory}/${path}`;
      const source = await readFile(file, 'utf8');

      await writeFile(file, source.replace(/((?:from|import)\s*\(?\s*['"]\.{1,2}\/[^'"]*)\.ts(['"])/g, '$1.js$2'));
    }),
  );
}

/**
 * dist/package.json: the package's own manifest, with exports pointing at the
 * bundle and its declarations instead of src/, plus its README and LICENSE.
 */
async function writeDistManifest(name: string) {
  const packageDir = `${ROOT}/packages/@emberx/${name}`;
  const {
    exports: _sources,
    dependencies,
    ...fields
  } = JSON.parse(await readFile(`${packageDir}/package.json`, 'utf8'));
  const published = {
    ...fields,
    main: './index.js',
    types: './index.d.ts',
    exports: { '.': { types: './index.d.ts', default: './index.js' } },
    dependencies,
  };

  await writeFile(`${packageDir}/dist/package.json`, `${JSON.stringify(published, null, 2)}\n`);
  await Promise.all(
    ['README.md', 'LICENSE']
      .filter((file) => existsSync(`${packageDir}/${file}`))
      .map((file) => cp(`${packageDir}/${file}`, `${packageDir}/dist/${file}`)),
  );
}

async function main() {
  const started = Date.now();

  const built = await Promise.all(PACKAGES.map(buildPackage));
  process.stdout.write(`built ${built.length} packages: ${built.join(', ')}\n`);

  await emitTypes();
  process.stdout.write('emitted type declarations\n');

  await Promise.all(PACKAGES.map(writeDistManifest));
  process.stdout.write('wrote each dist/package.json\n');

  process.stdout.write(`done in ${Date.now() - started}ms\n`);
}

// Run only when invoked directly: the other scripts import PACKAGES from here.
// pathToFileURL, not a `file://` template — on Windows argv[1] is `C:\...`,
// which a template never matches, and the build silently did nothing. argv[1]
// is undefined under `node -e` and the REPL, where importing this must not throw.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}

export { buildPackage, emitTypes, externalizeBareImports, ROOT };
