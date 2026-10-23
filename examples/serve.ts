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
const directory = precompile ? `tmp/examples/${app}/precompiled` : `tmp/examples/${app}`;
const respond = (await import(pathToFileURL(resolve(`${directory}/server.js`)).href)).default;
const browserScript = await Deno.readTextFile(`${directory}/browser.js`);
const port = Number(Deno.env.get('PORT') ?? 1234);

Deno.serve(
  {
    port,
    onListen: () =>
      console.log(`${app}, templates ${precompile ? 'precompiled' : 'compiled at runtime'}: http://localhost:${port}`),
  },
  (request) => {
    const url = new URL(request.url);

    return url.pathname === `/examples/${app}.bundle.js`
      ? new Response(browserScript, { headers: { 'content-type': 'text/javascript; charset=utf-8' } })
      : respond(url);
  },
);
