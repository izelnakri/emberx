/**
 * `emberx serve`: the build in dist/, served as in production. See `emberx help serve`.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, relative, resolve, sep } from 'node:path';
import process from 'node:process';
import { readArgs, UsageError } from '../args.ts';
import { findProject } from '../project.ts';
import { type AppServer, importServer, listen, respond, respondWithPage, TYPES, untilStopped } from '../http.ts';

const PORT = 4300;
/** The hashed files of a build: their names change with their contents, so a browser keeps them. */
const IMMUTABLE = { 'cache-control': 'public, max-age=31536000, immutable' };
const NO_CACHE = { 'cache-control': 'no-cache' };

export async function run(args: string[]): Promise<number> {
  const { values } = readArgs(args, {
    port: { type: 'string', short: 'p' },
    host: { type: 'string' },
    outdir: { type: 'string', short: 'o' },
    base: { type: 'string' },
  });
  if (values.help) return (await import('./help.ts')).run(['serve']);

  const project = findProject();
  const outdir = values.outdir ? resolve(values.outdir as string) : project.outdir;
  const shown = relative(process.cwd(), outdir) || '.';
  const html = join(outdir, 'index.html');
  if (!existsSync(html)) {
    throw new UsageError(`${shown}/index.html does not exist: \`emberx build\` builds the app first.`);
  }
  const base = `/${((values.base as string | undefined) ?? '/').replace(/^\/+|\/+$/g, '')}/`.replace('//', '/');
  const port = Number(values.port ?? process.env.PORT ?? PORT);
  const host = (values.host as string | undefined) ?? 'localhost';

  // What `emberx build --ssr` built: each page rendered by its render(), as `npm start` renders it.
  const serverFile = join(outdir, 'server', 'server.js');
  const appServer: AppServer | undefined = existsSync(serverFile) ? await importServer(serverFile) : undefined;
  const baseHTML = readFileSync(html, 'utf8');

  const http = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const path = decodeURIComponent(url.pathname);
    if (!path.startsWith(base) && `${path}/` !== base) return respond(response, 404, TYPES['.txt'], 'Not Found');

    const file = join(outdir, path.slice(base.length));
    const servable = file.startsWith(outdir + sep) && !file.startsWith(join(outdir, 'server') + sep);
    if (servable && file !== html && existsSync(file) && statSync(file).isFile()) {
      const headers = file.startsWith(join(outdir, 'assets') + sep) ? IMMUTABLE : NO_CACHE;
      return respond(response, 200, TYPES[extname(file)] ?? 'application/octet-stream', readFileSync(file), headers);
    }
    if (extname(path) && !path.endsWith('/index.html')) return respond(response, 404, TYPES['.txt'], 'Not Found');

    // Every other path is the app's to route: index.html, and with a server build, the page rendered into it.
    if (appServer) return respondWithPage(response, appServer, url.pathname + url.search, baseHTML, NO_CACHE);

    respond(response, 200, TYPES['.html'], baseHTML, NO_CACHE);
  });

  await listen(http, port, host);
  console.log(
    `emberx serve: ${shown}/ on http://${host}:${port}${base}${appServer ? ', each page rendered on the server' : ''} (Ctrl-C stops it)`,
  );

  return await untilStopped(() => {
    http.close();
    http.closeAllConnections();
  });
}
