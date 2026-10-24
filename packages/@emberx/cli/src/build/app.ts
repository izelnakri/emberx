/**
 * An app's production build, as `emberx build` makes it. By default each template is compiled
 * at build time, so Ember's template compiler is never loaded; the code is split, so the
 * compiler, and each route imported when it is entered, are chunks the first page load does not
 * download; it is minified, with EMBERX_DEBUG off; and router_js gets native promises rather
 * than rsvp, which it imports only Promise from.
 */
import { readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import * as esbuild from 'esbuild';
import precompilePlugin from './precompile-plugin.ts';

export interface AppBuildOptions {
  entryPoints: string[] | Record<string, string>;
  outdir: string;
  platform?: 'browser' | 'node';
  precompile?: boolean;
  split?: boolean;
  minify?: boolean;
  nativePromises?: boolean;
  sourcemap?: boolean;
  /** esbuild's names for the files it writes: `[name]-[hash]`, for files a browser may cache forever. */
  entryNames?: string;
  chunkNames?: string;
  assetNames?: string;
}

export interface BuiltFile {
  path: string;
  bytes: number;
  gzip: number;
  brotli: number;
  /** Whether the first page load downloads it: an entry, or a chunk an entry imports statically. */
  initial: boolean;
}

/** A module the first page load bundled, and its minified size there: `emberx build --analyze`. */
export interface BundledModule {
  path: string;
  bytes: number;
}

export interface AppBuild {
  files: BuiltFile[];
  /** The modules of the first page load, largest first. */
  modules: BundledModule[];
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
  entryNames,
  chunkNames,
  assetNames,
}: AppBuildOptions): Promise<AppBuild> {
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
    ...(entryNames ? { entryNames } : {}),
    ...(chunkNames ? { chunkNames } : {}),
    ...(assetNames ? { assetNames } : {}),
    plugins: [...(precompile ? [precompilePlugin()] : []), ...(nativePromises ? [routerJSNativePromises] : [])],
  });

  const outputs = Object.entries(metafile.outputs).filter(([path]) => !path.endsWith('.map'));
  const initial = new Set<string>();
  const visit = (path: string) => {
    if (initial.has(path)) return;
    initial.add(path);
    // Only what the build wrote: a node build's imports include node:fs and the other externals.
    metafile.outputs[path].imports
      .filter(({ kind, path }) => kind === 'import-statement' && path in metafile.outputs)
      .forEach(({ path }) => visit(path));
  };
  // Not every output with an entryPoint: esbuild gives a dynamically imported chunk one too.
  const entries = new Set(Object.values(entryPoints).map((entry) => resolve(entry)));
  outputs
    .filter(([, output]) => output.entryPoint && entries.has(resolve(output.entryPoint)))
    .forEach(([path]) => visit(path));

  const sizes = new Map<string, number>();
  for (const [, output] of outputs.filter(([path]) => initial.has(path))) {
    for (const [input, { bytesInOutput }] of Object.entries(output.inputs)) {
      sizes.set(input, (sizes.get(input) ?? 0) + bytesInOutput);
    }
  }

  return {
    files: outputs.map(([path]) => {
      const contents = readFileSync(path);
      return {
        path,
        bytes: contents.length,
        gzip: gzipSync(contents).length,
        brotli: brotliCompressSync(contents).length,
        initial: initial.has(path),
      };
    }),
    modules: [...sizes]
      .filter(([, bytes]) => bytes > 0)
      .map(([path, bytes]) => ({ path, bytes }))
      .sort((a, b) => b.bytes - a.bytes),
  };
}

/** The files a build wrote, and what the first page load downloads of them, as a table. */
export function formatReport(files: BuiltFile[]): string {
  const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} kB`.padStart(10);
  const sum = (list: BuiltFile[], key: 'bytes' | 'gzip' | 'brotli') =>
    list.reduce((total, file) => total + file[key], 0);
  const width = Math.max(24, ...files.map((file) => file.path.length + 10));
  const row = (name: string, list: BuiltFile[]) =>
    `${name.padEnd(width)}${kb(sum(list, 'bytes'))}${kb(sum(list, 'gzip'))}${kb(sum(list, 'brotli'))}`;

  return [
    `${''.padEnd(width)}${'minified'.padStart(10)}${'gzip'.padStart(10)}${'brotli'.padStart(10)}`,
    ...[...files]
      .sort((a, b) => Number(b.initial) - Number(a.initial) || b.bytes - a.bytes)
      .map((file) => row(`${file.initial ? '  ' : '  (lazy) '}${file.path}`, [file])),
    row(
      'first page load',
      files.filter((file) => file.initial),
    ),
  ].join('\n');
}

/** router_js's `import { Promise } from 'rsvp'`, as native promises: 13 kB it does not need. */
const routerJSNativePromises: esbuild.Plugin = {
  name: 'emberx:router-js-native-promises',
  setup(build) {
    build.onResolve({ filter: /^rsvp$/ }, ({ importer }) =>
      /[\\/]router_js[\\/]/.test(importer) ? { path: 'rsvp', namespace: 'emberx-native-promise' } : undefined,
    );
    build.onLoad({ filter: /.*/, namespace: 'emberx-native-promise' }, () => ({
      contents: 'export const Promise = globalThis.Promise;',
      loader: 'js',
    }));
  },
};
