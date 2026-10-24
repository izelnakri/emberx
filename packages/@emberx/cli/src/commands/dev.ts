/**
 * `emberx dev [entry]`: the app, served and rebuilt as it changes. See `emberx help dev`.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer, type ServerResponse } from 'node:http';
import { extname, join, relative, resolve } from 'node:path';
import process from 'node:process';
import { readArgs, UsageError } from '../args.ts';
import { rewritePage } from '../build/html.ts';
import { findProject } from '../project.ts';

const RELOAD = '/__emberx/reload';
const LIVE_RELOAD = `<script type="module">
const events = new EventSource('${RELOAD}');
events.addEventListener('reload', () => location.reload());
events.addEventListener('failure', (event) => console.error('emberx dev: the build failed\\n' + event.data));
</script>`;
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

export async function run(args: string[]): Promise<number> {
  const { values, positionals } = readArgs(args, {
    port: { type: 'string', short: 'p' },
    host: { type: 'string' },
  });
  if (values.help) return (await import('./help.ts')).run(['dev']);

  const project = findProject();
  const entry = positionals[0] ? resolve(positionals[0]) : project.entry;
  if (!entry || !existsSync(entry)) {
    throw new UsageError(
      'no entry module: give one, `emberx dev src/app.ts`, or name it in package.json\'s "emberx": { "entry" }.',
    );
  }
  const port = Number(values.port ?? process.env.PORT ?? project.port);
  const host = (values.host as string | undefined) ?? 'localhost';

  const esbuild = await import('esbuild');
  const outdir = join(project.root, '.emberx-dev');
  const outputs = new Map<string, Uint8Array>();
  const listeners = new Set<ServerResponse>();
  let firstBuild: () => void = () => {};
  const built = new Promise<void>((resolve) => (firstBuild = resolve));
  const send = (event: string, data = '') => {
    for (const listener of listeners) listener.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const context = await esbuild.context({
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
          let first = true;
          build.onEnd(({ errors, outputFiles }) => {
            firstBuild();
            if (errors.length > 0) {
              const text = errors
                .map((error) => `${error.location?.file ?? ''}:${error.location?.line ?? ''} ${error.text}`)
                .join('\n');
              console.error(`emberx dev: the build failed\n${text}`);
              send('failure', text);
              return;
            }
            outputs.clear();
            for (const file of outputFiles ?? [])
              outputs.set(`/assets/${relative(outdir, file.path).split('\\').join('/')}`, file.contents);
            if (!first) {
              console.log(`emberx dev: rebuilt, reloading ${listeners.size} page${listeners.size === 1 ? '' : 's'}`);
              send('reload');
            }
            first = false;
          });
        },
      },
    ],
  });
  // watch() starts the first build without waiting for it: the server opens once there is a bundle to serve.
  await context.watch();
  await built;

  const server = createServer((request, response) => {
    const path = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
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
    if (output) return respond(response, 200, TYPES[extname(path)] ?? 'application/octet-stream', output);

    const file = [join(project.publicDir, path), join(project.root, path)].find(
      (candidate) => !path.includes('..') && existsSync(candidate) && statSync(candidate).isFile(),
    );
    if (file && file !== project.html)
      return respond(response, 200, TYPES[extname(file)] ?? 'application/octet-stream', readFileSync(file));
    // The icon every browser asks for: none yet is no error worth a line in the console.
    if (path === '/favicon.ico') return respond(response, 204, TYPES['.ico'], '');
    if (extname(path) && path !== '/index.html') return respond(response, 404, TYPES['.txt'], 'Not Found');

    // Every other path is the app's to route: the page, which loads the bundle.
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
    respond(response, 200, TYPES['.html'], page);
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => resolve());
  });
  console.log(`emberx dev: http://${host}:${port}, rebuilt and reloaded on every change (Ctrl-C stops it)`);

  return await new Promise<number>((resolve) => {
    const stop = async () => {
      for (const listener of listeners) listener.end();
      server.close();
      await context.dispose();
      resolve(0);
    };
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
  });
}

function respond(response: ServerResponse, status: number, type: string, body: string | Uint8Array): void {
  response.writeHead(status, { 'content-type': type, 'cache-control': 'no-cache' });
  response.end(body);
}
