/**
 * `emberx dev [entry]`: the app, served and rebuilt as it changes. See `emberx help dev`.
 */
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer, type ServerResponse } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, relative, resolve } from 'node:path';
import process from 'node:process';
import * as esbuild from 'esbuild';
import { readArgs, UsageError } from '../args.ts';
import { rewritePage } from '../build/html.ts';
import { findProject } from '../project.ts';
import { type AppServer, importServer, listen, respond, respondWithPage, TYPES, untilStopped } from '../http.ts';

const RELOAD = '/__emberx/reload';
const LIVE_RELOAD = `<script type="module">
const events = new EventSource('${RELOAD}');
events.addEventListener('reload', () => location.reload());
events.addEventListener('failure', (event) => console.error('emberx dev: the build failed\\n' + JSON.parse(event.data)));
</script>`;
const NO_CACHE = { 'cache-control': 'no-cache' };

export async function run(args: string[]): Promise<number> {
  const { values, positionals } = readArgs(args, {
    port: { type: 'string', short: 'p' },
    host: { type: 'string' },
    ssr: { type: 'boolean' },
  });
  if (values.help) return (await import('./help.ts')).run(['dev']);

  const project = findProject();
  const entry = positionals[0] ? resolve(positionals[0]) : project.entry;
  if (!entry || !existsSync(entry)) {
    throw new UsageError(
      'no entry module: give one, `emberx dev src/app.ts`, or name it in package.json\'s "emberx": { "entry" }.',
    );
  }
  if (values.ssr && !existsSync(project.server)) {
    throw new UsageError(
      `--ssr renders each page with ${relative(process.cwd(), project.server)}, which does not exist: \`emberx new my-app --ssr\` writes one.`,
    );
  }
  const port = Number(values.port ?? process.env.PORT ?? project.port);
  const host = (values.host as string | undefined) ?? 'localhost';

  const outputs = new Map<string, Uint8Array>();
  const listeners = new Set<ServerResponse>();
  const send = (event: string, data = '') => {
    for (const listener of listeners) listener.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };
  let serving = false;
  const failed = (name: string, errors: esbuild.Message[]) => {
    const text = errors
      .map((error) => `${error.location?.file ?? ''}:${error.location?.line ?? ''} ${error.text}`)
      .join('\n');
    console.error(`emberx dev: the ${name} build failed\n${text}`);
    send('failure', text);
  };

  // With --ssr, src/server.ts too, for node, rebuilt with the browser's bundle: each build written under a name of its
  // own, as an imported module stays imported, and imported, so each page renders with the latest render().
  let appServer: AppServer | undefined;
  const serverOutdir = values.ssr ? mkdtempSync(join(tmpdir(), 'emberx-dev-')) : '';
  let serverBuilds = 0;
  /** The server's own modules, which the browser's build watches too: one watcher, so one reload for a change. */
  let serverInputs: string[] = [];
  const server = values.ssr
    ? await esbuild.context({
        entryPoints: { server: project.server },
        outdir: serverOutdir,
        bundle: true,
        platform: 'node',
        format: 'esm',
        target: 'es2022',
        sourcemap: 'inline',
        metafile: true,
        write: false,
        logLevel: 'silent',
        define: { EMBERX_DEBUG: 'true' },
      })
    : undefined;
  /** Whether the server built, and its module ran. */
  const buildServer = async (): Promise<boolean> => {
    try {
      const { outputFiles, metafile } = await server!.rebuild();
      serverInputs = Object.keys(metafile.inputs)
        .filter((input) => !input.includes('node_modules'))
        .map((input) => resolve(input));
      const file = join(serverOutdir, `server-${++serverBuilds}.mjs`);
      writeFileSync(file, outputFiles.find((output) => output.path.endsWith('.js'))!.contents);
      try {
        appServer = await importServer(file);
      } finally {
        rmSync(file, { force: true });
      }
      return true;
    } catch (error) {
      const { errors } = error as { errors?: esbuild.Message[] };
      if (errors) {
        failed('server', errors);
      } else {
        console.error(`emberx dev: the server module failed\n${(error as Error).stack ?? error}`);
        send('failure', String(error));
      }
      return false;
    }
  };

  const outdir = join(project.root, '.emberx-dev');
  let firstBuilt = () => {};
  const firstBuild = new Promise<void>((resolve) => (firstBuilt = resolve));
  const browser = await esbuild.context({
    entryPoints: { app: entry },
    outdir,
    bundle: true,
    format: 'esm',
    target: 'es2022',
    splitting: true,
    sourcemap: 'linked',
    write: false,
    logLevel: 'silent',
    // Templates compile in the browser, as they do with no build, and the development checks are on.
    define: { EMBERX_DEBUG: 'true' },
    plugins: [
      {
        name: 'emberx:dev',
        setup(build) {
          build.onResolve({ filter: new RegExp(`^${entry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }, ({ path }) => ({
            path,
            watchFiles: serverInputs,
          }));
          build.onEnd(async ({ errors, outputFiles = [] }) => {
            if (errors.length > 0) {
              failed('browser', errors);
            } else {
              outputs.clear();
              for (const file of outputFiles)
                outputs.set(`/assets/${relative(outdir, file.path).split('\\').join('/')}`, file.contents);
              // A server that failed leaves the page as it is, its failure in the console.
              if (serving && (!server || (await buildServer()))) {
                console.log(`emberx dev: rebuilt, reloading ${listeners.size} page${listeners.size === 1 ? '' : 's'}`);
                send('reload');
              }
            }
            firstBuilt();
          });
        },
      },
    ],
  });

  if (server) await buildServer();
  // watch() starts the first build without waiting for it: the server opens once there is a bundle to serve.
  await browser.watch();
  await firstBuild;

  const http = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const path = decodeURIComponent(url.pathname);
    if (path === RELOAD) {
      response.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
      });
      response.write(': emberx dev\n\n');
      listeners.add(response);
      request.on('close', () => listeners.delete(response));
      return;
    }

    const output = outputs.get(path);
    if (output) return respond(response, 200, TYPES[extname(path)] ?? 'application/octet-stream', output, NO_CACHE);

    const file = [join(project.publicDir, path), join(project.root, path)].find(
      (candidate) => !path.includes('..') && existsSync(candidate) && statSync(candidate).isFile(),
    );
    if (file && file !== project.html)
      return respond(response, 200, TYPES[extname(file)] ?? 'application/octet-stream', readFileSync(file), NO_CACHE);
    // The icon every browser asks for: none yet is no error worth a line in the console.
    if (path === '/favicon.ico') return respond(response, 204, TYPES['.ico'], '');
    if (extname(path) && path !== '/index.html') return respond(response, 404, TYPES['.txt'], 'Not Found');

    // Every other path is the app's to route: the page, which loads the bundle, and with --ssr, rendered.
    if (!existsSync(project.html)) {
      return respond(
        response,
        404,
        TYPES['.txt'],
        `emberx dev serves ${relative(project.root, project.html)}, which does not exist.`,
      );
    }
    const page = rewritePage(readFileSync(project.html, 'utf8'), {
      root: project.root,
      htmlPath: project.html,
      entry,
      script: '/assets/app.js',
      styles: outputs.has('/assets/app.css') ? ['/assets/app.css'] : [],
      bodyEnd: LIVE_RELOAD,
    });
    if (appServer) return respondWithPage(response, appServer, url.pathname + url.search, page, NO_CACHE);

    respond(response, 200, TYPES['.html'], page, NO_CACHE);
  });

  await listen(http, port, host);
  serving = true;
  console.log(
    `emberx dev: http://${host}:${port}, rebuilt and reloaded on every change${values.ssr ? ', each page rendered on the server' : ''} (Ctrl-C stops it)`,
  );

  return await untilStopped(async () => {
    for (const listener of listeners) listener.end();
    http.close();
    await Promise.all([browser.dispose(), server?.dispose()]);
    if (serverOutdir) rmSync(serverOutdir, { recursive: true, force: true });
  });
}
