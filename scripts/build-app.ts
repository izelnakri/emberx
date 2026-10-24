#!/usr/bin/env node
/**
 * Builds an emberx app for production, as `emberx build` will:
 *
 *   node scripts/build-app.ts src/app.ts                  # dist/, and a size report
 *   node scripts/build-app.ts src/app.ts --outdir public/assets --no-precompile --no-split
 *
 * By default each template is compiled at build time, so Ember's template compiler is never
 * loaded; the code is split, so the compiler and each route imported when it is entered
 * (RouteLoader) are chunks the first page load does not download; it is minified, with
 * EMBERX_DEBUG off; and router_js gets native promises rather than rsvp. A flag turns each off.
 */
import { readFileSync, rmSync } from 'node:fs';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import precompilePlugin, { TEMPLATE_MODULES } from './lib/precompile-plugin.ts';

const NATIVE_PROMISE = fileURLToPath(new URL('./lib/native-promise.ts', import.meta.url));

export interface AppBuildOptions {
  entryPoints: string[] | Record<string, string>;
  outdir: string;
  platform?: 'browser' | 'node';
  precompile?: boolean;
  split?: boolean;
  minify?: boolean;
  nativePromises?: boolean;
  sourcemap?: boolean;
}

export interface BuiltFile {
  path: string;
  bytes: number;
  gzip: number;
  brotli: number;
  /** Whether the first page load downloads it: an entry, or a chunk an entry imports statically. */
  initial: boolean;
}

export async function buildApp({
  entryPoints,
  outdir,
  platform = 'browser',
  precompile = true,
  split = platform === 'browser',
  minify = platform === 'browser',
  nativePromises = true,
  sourcemap = false,
}: AppBuildOptions): Promise<BuiltFile[]> {
  // A build's chunks are named by their content: those of an earlier build would stay beside them.
  rmSync(outdir, { recursive: true, force: true });
  const { metafile } = await esbuild.build({
    entryPoints,
    outdir,
    platform,
    bundle: true,
    format: 'esm',
    target: 'es2022',
    splitting: split,
    minify,
    sourcemap,
    metafile: true,
    logLevel: 'warning',
    define: { EMBERX_DEBUG: 'false' },
    plugins: [
      ...(precompile ? [precompilePlugin(TEMPLATE_MODULES)] : []),
      ...(nativePromises ? [routerJSNativePromises] : []),
    ],
  });

  const outputs = Object.entries(metafile.outputs).filter(([path]) => !path.endsWith('.map'));
  const initial = new Set<string>();
  const visit = (path: string) => {
    if (initial.has(path)) return;
    initial.add(path);
    metafile.outputs[path].imports.filter(({ kind }) => kind === 'import-statement').forEach(({ path }) => visit(path));
  };
  // Not every output with an entryPoint: esbuild gives a dynamically imported chunk one too.
  const entries = new Set(Object.values(entryPoints).map((entry) => entry.replace(/^\.\//, '')));
  outputs.filter(([, output]) => entries.has(output.entryPoint ?? '')).forEach(([path]) => visit(path));

  return outputs.map(([path]) => {
    const contents = readFileSync(path);
    return {
      path,
      bytes: contents.length,
      gzip: gzipSync(contents).length,
      brotli: brotliCompressSync(contents).length,
      initial: initial.has(path),
    };
  });
}

/** Prints the files a build wrote, and what the first page load downloads of them. */
export function printReport(files: BuiltFile[]): void {
  const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} kB`.padStart(10);
  const sum = (list: BuiltFile[], key: 'bytes' | 'gzip' | 'brotli') =>
    list.reduce((total, file) => total + file[key], 0);
  const row = (name: string, list: BuiltFile[]) =>
    console.log(`${name.padEnd(44)}${kb(sum(list, 'bytes'))}${kb(sum(list, 'gzip'))}${kb(sum(list, 'brotli'))}`);

  console.log(`${''.padEnd(44)}${'minified'.padStart(10)}${'gzip'.padStart(10)}${'brotli'.padStart(10)}`);
  for (const file of [...files].sort((a, b) => Number(b.initial) - Number(a.initial) || b.bytes - a.bytes)) {
    row(`${file.initial ? '  ' : '  (lazy) '}${file.path}`, [file]);
  }
  row(
    'first page load',
    files.filter((file) => file.initial),
  );
}

/** router_js's `import { Promise } from 'rsvp'`, as native promises: 15 kB minified it does not need. */
const routerJSNativePromises: esbuild.Plugin = {
  name: 'emberx:router-js-native-promises',
  setup(build) {
    build.onResolve({ filter: /^rsvp$/ }, ({ importer }) =>
      importer.includes('/router_js/') ? { path: NATIVE_PROMISE } : undefined,
    );
  },
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const value = (flag: string) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);
  const entryPoints = args.filter((arg, index) => !arg.startsWith('--') && !args[index - 1]?.startsWith('--outdir'));
  if (entryPoints.length === 0) {
    console.error(
      'Usage: node scripts/build-app.ts <entry…> [--outdir dist] [--no-precompile] [--no-split] [--no-minify] [--rsvp] [--sourcemap]',
    );
    process.exit(1);
  }

  printReport(
    await buildApp({
      entryPoints,
      outdir: value('--outdir') ?? 'dist',
      precompile: !args.includes('--no-precompile'),
      split: !args.includes('--no-split'),
      minify: !args.includes('--no-minify'),
      nativePromises: !args.includes('--rsvp'),
      sourcemap: args.includes('--sourcemap'),
    }),
  );
}
