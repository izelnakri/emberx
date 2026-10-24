/**
 * Serves an example app rendered on the server, which the browser then hydrates, as
 * examples/build.ts bundled it:
 *
 *   npm run examples:blog                   # http://localhost:1234
 *   npm run examples:blog -- --precompile   # with its templates compiled at build time
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const app = Deno.args[0];
const precompile = Deno.args.includes('--precompile');
const directory = `tmp/examples/${app}/${precompile ? 'precompiled' : 'runtime'}`;
const respond = (await import(pathToFileURL(resolve(`${directory}/server/server.js`)).href)).default;
const port = Number(Deno.env.get('PORT') ?? 1234);

Deno.serve(
  {
    port,
    onListen: () =>
      console.log(`${app}, templates ${precompile ? 'precompiled' : 'compiled at runtime'}: http://localhost:${port}`),
  },
  (request) => {
    const url = new URL(request.url);

    // The browser build: the app's bundle, and the chunks it imports, a route's when it is entered.
    return url.pathname.startsWith('/examples/') && url.pathname.endsWith('.js')
      ? serveScript(`${directory}/browser/${url.pathname.slice('/examples/'.length)}`)
      : respond(url);
  },
);

async function serveScript(path: string): Promise<Response> {
  try {
    return new Response(await Deno.readFile(path), { headers: { 'content-type': 'text/javascript; charset=utf-8' } });
  } catch {
    return new Response('Not Found', { status: 404 });
  }
}
