# @emberx/ssr: emberx components and pages rendered to HTML, on a server

Renders in node or Deno, with no browser DOM, as Ember's FastBoot does: into a simple-dom
document, with modifiers and `{{on}}` off, then serialized. The markup is hydratable: a browser
render into it adopts the server's nodes instead of building them again.

## A component

```ts
import assert from 'node:assert/strict';
import Component, { hbs } from '@emberx/component';
import { renderToString } from '@emberx/ssr';

class Greeting extends Component {
  static template = hbs`<p>Hello {{@name}}</p>`;
}

assert.equal(await renderToString(Greeting, { args: { name: 'server' }, hydratable: false }), '<p>Hello server</p>');
```

Without `hydratable: false`, the markup also carries the comments Glimmer's rehydration reads.
`renderComponent` from `@emberx/component`, into an element holding it, then reuses the server's
nodes, attaches their event handlers and updates them in place from then on.

## The page a URL shows

`renderURLToString(url)` renders a whole app's page: a router of its own goes to the URL as it
would in a browser, model hooks, redirects and loading or error substates included, and the page
it ends on renders to a string. Start the same router on both sides; in the browser, its first
render hydrates the server's page.

```ts ignore
// start-router.ts, shared by the server and the browser
import Router from '@emberx/router';
import routes from './routes.ts';

export default () => Router.start(routes);

// server.ts
import { renderURLToString } from '@emberx/ssr';
import startRouter from './start-router.ts';

startRouter();

Deno.serve(async (request) => {
  const { pathname, search } = new URL(request.url);
  const page = await renderURLToString(pathname + search, {
    services: { session: await sessionFrom(request) },
  });

  return new Response(`<!doctype html><body><div id="app">${page}</div><script type="module" src="/app.js"></script>`, {
    headers: { 'content-type': 'text/html' },
  });
});

// app.ts, in the browser
import startRouter from './start-router.ts';

await startRouter().visit(`${location.pathname}${location.search}`);
```

Each call renders with a router and an owner of its own, from `Router.createInstance()`, so a
server renders the requests that arrive together at once. Its routes and pages find the
`services` it is given as theirs, beside the ones `Router.addServices()` registered for the app:
a request's session or headers belong there, rather than in a service every request shares.
