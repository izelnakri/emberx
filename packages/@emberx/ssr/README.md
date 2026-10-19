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

`renderURL(url)` renders a whole app's page: a router of its own goes to the URL as it would in a
browser, model hooks, redirects and loading or error substates included, and the page it ends on
renders to HTML. It returns what the document around the page needs too:

- `html`: the page, for the element the browser's router renders into, `#app`;
- `title`: the page's title, from the deepest route with a `static title`;
- `url`: where the page is, after its redirects, for a redirect response;
- `models`: the routes' models, by route name. Given to the browser's `Router.start({ models })`,
  its first transition takes them instead of running the model hooks again, so the browser does
  not fetch what the page it hydrates already shows. They travel as JSON, so a model is its data,
  not a class instance; `embedToShoeboxScriptTag()` writes them so a `<script>` element holds them safely.

`renderURLToString(url)` returns the HTML alone. Start the same router on both sides; in the
browser, its first render hydrates the server's page.

```ts ignore
// start-router.ts, shared by the server and the browser
import Router from '@emberx/router';
import routes from './routes.ts';

export default (options = {}) => Router.start(routes, options);

// server.ts
import { embedToShoeboxScriptTag, renderURL } from '@emberx/ssr';
import startRouter from './start-router.ts';

startRouter();

Deno.serve(async (request) => {
  const { pathname, search } = new URL(request.url);
  const page = await renderURL(pathname + search, { services: { session: await sessionFrom(request) } });
  if (page.url !== pathname + search) {
    return Response.redirect(new URL(page.url, request.url), 302);
  }

  return new Response(
    `<!doctype html>
    <title>${escapeHTML(page.title ?? 'Blog')}</title>
    <div id="app">${page.html}</div>
    <script type="application/json" id="models">${embedToShoeboxScriptTag(page.models)}</script>
    <script type="module" src="/app.js"></script>`,
    { headers: { 'content-type': 'text/html' } },
  );
});

// app.ts, in the browser
import startRouter from './start-router.ts';

const models = JSON.parse(document.getElementById('models').textContent);

await startRouter({ models }).visit(`${location.pathname}${location.search}`);
```

Each call renders with a router and an owner of its own, from `Router.createInstance()`, so a
server renders the requests that arrive together at once. Its routes and pages find the
`services` it is given as theirs, beside the ones `Router.addServices()` registered for the app:
a request's session or headers belong there, rather than in a service every request shares.
