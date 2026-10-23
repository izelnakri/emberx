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
- `head`: the `<title>` and the elements of the routes' `static head`, and `bodyStart` and
  `bodyEnd`, those of their `static body`, escaped, and marked so that the browser's router adopts
  them;
- `url`: where the page is, after its redirects, for a redirect response;
- `status`: the response's status: 404 for the page of a catch-all route, the router's
  not-found route or one the app declares, 500 for an error route's, 200 otherwise;
- `models`: the routes' models, by route name. Left in the document in a
  `<script type="application/json" id="shoebox">` element, the browser's `Router.start()` reads
  them, and its first transition takes them instead of running the model hooks again, so the
  browser does not fetch what the page it hydrates already shows. They travel as JSON, so a model
  is its data, not a class instance; `embedToShoeboxScriptTag()` writes them so a `<script>`
  element holds them safely.

`renderBaseHTMLToString(baseHTML, rendered)` returns the document to send, as HTML: the app's base
HTML, its index.html, with the page's `<title>` in place of its own, the page's head elements last
in `<head>`, its body elements first and last in `<body>`, its markup in the empty
`<div id="app"></div>`, and its models after that, in the `#shoebox` the browser's `Router.start()`
reads. `renderURLToString(url)` returns the page's markup alone. Start the same router on both
sides; in the browser, its first render hydrates the server's page.

```ts ignore
// start-router.ts, shared by the server and the browser
import Router from '@emberx/router';
import routes from './routes.ts';

export default (options = {}) => Router.start(routes, options);

// server.ts
import { renderBaseHTMLToString, renderURL } from '@emberx/ssr';
import startRouter from './start-router.ts';

// The app's index.html, with its <title>, its scripts and an empty <div id="app"></div>.
const INDEX_HTML = await Deno.readTextFile('dist/index.html');

startRouter();

Deno.serve(async (request) => {
  const { pathname, search } = new URL(request.url);
  const rendered = await renderURL(pathname + search, { services: { session: await sessionFrom(request) } });
  if (rendered.url !== pathname + search) {
    return Response.redirect(new URL(rendered.url, request.url), 302);
  }

  return new Response(renderBaseHTMLToString(INDEX_HTML, rendered), {
    status: rendered.status,
    headers: { 'content-type': 'text/html' },
  });
});

// app.ts, in the browser: Router.start() reads the models from #shoebox
import startRouter from './start-router.ts';

await startRouter().visit(`${location.pathname}${location.search}`);
```

Each call renders with a router and an owner of its own, from `Router.createInstance()`, so a
server renders the requests that arrive together at once. Its routes and pages find the
`services` it is given as theirs, beside the ones `Router.addServices()` registered for the app:
a request's session or headers belong there, rather than in a service every request shares.
