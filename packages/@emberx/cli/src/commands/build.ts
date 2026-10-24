/**
 * `emberx build [entry]`: the app for production, in dist/. See `emberx help build`.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import process from 'node:process';
import { readArgs, UsageError } from '../args.ts';
import { buildApp, formatReport } from '../build/app.ts';
import { rewritePage } from '../build/html.ts';
import { findProject } from '../project.ts';

export async function run(args: string[]): Promise<number> {
  const { values, positionals } = readArgs(args, {
    outdir: { type: 'string', short: 'o' },
    base: { type: 'string' },
    ssr: { type: 'boolean' },
    precompile: { type: 'boolean', default: true },
    split: { type: 'boolean', default: true },
    minify: { type: 'boolean', default: true },
    rsvp: { type: 'boolean' },
    sourcemap: { type: 'boolean' },
    analyze: { type: 'boolean' },
  });
  if (values.help) return (await import('./help.ts')).run(['build']);

  const started = performance.now();
  const project = findProject();
  const entry = positionals[0] ? resolve(positionals[0]) : project.entry;
  if (!entry || !existsSync(entry)) {
    throw new UsageError(
      entry
        ? `the entry module ${relative(process.cwd(), entry)} does not exist.`
        : 'no entry module: give one, `emberx build src/app.ts`, or name it in package.json\'s "emberx": { "entry" }.',
    );
  }
  const outdir = values.outdir ? resolve(values.outdir as string) : project.outdir;
  const base = ensureSlashes((values.base as string | undefined) ?? '/');
  const options = {
    precompile: values.precompile !== false,
    nativePromises: !values.rsvp,
    sourcemap: Boolean(values.sourcemap),
  };

  rmSync(outdir, { recursive: true, force: true });
  mkdirSync(outdir, { recursive: true });
  if (existsSync(project.publicDir)) cpSync(project.publicDir, outdir, { recursive: true });

  const assets = join(outdir, 'assets');
  const { files, modules } = await buildApp({
    ...options,
    entryPoints: { app: entry },
    outdir: assets,
    split: values.split !== false,
    minify: values.minify !== false,
    entryNames: '[name]-[hash]',
    chunkNames: 'chunks/[name]-[hash]',
    assetNames: '[name]-[hash]',
  });

  const url = (path: string) => `${base}assets/${relative(assets, path).split('\\').join('/')}`;
  const script = files.find((file) => file.initial && /[\\/]app-[^\\/]+\.js$/.test(file.path));
  if (existsSync(project.html) && script) {
    const page = rewritePage(readFileSync(project.html, 'utf8'), {
      root: project.root,
      htmlPath: project.html,
      entry,
      script: url(script.path),
      preloads: files
        .filter((file) => file.initial && file !== script && file.path.endsWith('.js'))
        .map((file) => url(file.path)),
      styles: files.filter((file) => file.initial && file.path.endsWith('.css')).map((file) => url(file.path)),
    });
    writeFileSync(join(outdir, 'index.html'), page);
  }

  let serverFiles: typeof files = [];
  if (values.ssr) {
    if (!existsSync(project.server)) {
      throw new UsageError(`--ssr builds ${relative(process.cwd(), project.server)}, which does not exist.`);
    }
    ({ files: serverFiles } = await buildApp({
      ...options,
      entryPoints: { server: project.server },
      outdir: join(outdir, 'server'),
      platform: 'node',
    }));
  }

  // With slashes on every platform, as the paths are in the page and in the docs.
  const shown = (list: typeof files) =>
    list.map((file) => ({ ...file, path: relative(process.cwd(), file.path).split('\\').join('/') }));
  console.log(formatReport(shown(files)));
  if (serverFiles.length > 0) {
    console.log(
      `\nserver: ${shown(serverFiles)
        .map((file) => file.path)
        .join(', ')}`,
    );
  }
  if (values.analyze) {
    console.log('\nthe first page load, by module:');
    for (const { path, bytes } of modules.slice(0, 20)) {
      console.log(`${(bytes / 1024).toFixed(1).padStart(8)} kB  ${path}`);
    }
  }
  if (!existsSync(project.html)) {
    console.log(`\n${relative(process.cwd(), project.html)} does not exist, so dist/ has no page: only the bundle.`);
  }
  console.log(
    `\nbuilt ${relative(process.cwd(), outdir) || '.'}/ in ${((performance.now() - started) / 1000).toFixed(1)}s`,
  );

  return 0;
}

/** `/app` and `app/` as `/app/`: the path the app is served under. */
function ensureSlashes(base: string): string {
  return `/${base.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
}
