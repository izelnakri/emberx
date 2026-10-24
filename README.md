# EmberX: Ember.js as plain npm packages, with no Ember-specific build

[![CI](https://github.com/izelnakri/emberx/actions/workflows/ci.yml/badge.svg)](https://github.com/izelnakri/emberx/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/izelnakri/emberx/branch/main/graph/badge.svg)](https://codecov.io/gh/izelnakri/emberx)
[![npm](https://img.shields.io/npm/v/@emberx/component?label=npm)](https://www.npmjs.com/org/emberx)
[![npm downloads](https://img.shields.io/npm/dm/@emberx/component)](https://www.npmjs.com/package/@emberx/component)
[![JSR](https://jsr.io/badges/@izelnakri/emberx-component)](https://jsr.io/@izelnakri/emberx-component)
[![API docs](https://img.shields.io/badge/docs-API-d4412b)](https://izelnakri.github.io/emberx/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Sponsor](https://img.shields.io/badge/sponsor-%E2%99%A5-pink)](https://github.com/sponsors/izelnakri)

**Ember's rendering engine, router and test helpers, as ES modules you import.** No Ember CLI, no
resolver, no addons: write a component in a `.ts` file, import it where it is used, and the same
module runs in the browser through any bundler, under node, and under Deno as it is.

- **Glimmer, from ember-source 7.** `@tracked` state and templates that update only the DOM that
  depends on what changed. Templates compile in the browser on first render, or at build time when
  you want no `eval`.
- **Ember's router, whole.** Nested routes, model hooks, query params, loading and error substates,
  redirects, page titles and `<head>`. A page is a route: no controllers.
- **Server rendering with hydration.** `renderURL()` renders any URL with a router of its own per
  request, and answers with its status; the browser adopts the server's HTML instead of rebuilding
  it, and its models instead of fetching them again.
- **Tests that run anywhere.** The same test file runs under node, Deno and real browsers through
  [QUnitX](https://github.com/izelnakri/qunitx), and `@emberx/test-helpers` waits for the actions,
  transitions and renders it starts, with no runloop.
- **Shareable by design.** A template's `static includes` names what it uses, so a route, a
  component or a helper is a module any npm package can ship.

**[Website](https://izelnakri.github.io/emberx/)** ·
**[API docs](https://izelnakri.github.io/emberx/#packages)** ·
**[Coverage](https://izelnakri.github.io/emberx/coverage/)** ·
**[npm](https://www.npmjs.com/org/emberx)** ·
**[JSR](https://jsr.io/@izelnakri)** ·
**[Changelog](CHANGELOG.md)**

| Package                                                           | What it is                                                                     | npm                                                                                                                    | API                                                         | JSR                                                                                                           |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [`@emberx/component`](packages/@emberx/component/README.md)       | Glimmer components, `@tracked`/`@action`/`@service`/`@cached`, rendering       | [![npm](https://img.shields.io/npm/v/@emberx/component?label=)](https://www.npmjs.com/package/@emberx/component)       | [API](https://izelnakri.github.io/emberx/api/component/)    | [![JSR](https://jsr.io/badges/@izelnakri/emberx-component)](https://jsr.io/@izelnakri/emberx-component)       |
| [`@emberx/router`](packages/@emberx/router/README.md)             | Ember's router: route hooks, query params, substates, actions, `<LinkTo>`      | [![npm](https://img.shields.io/npm/v/@emberx/router?label=)](https://www.npmjs.com/package/@emberx/router)             | [API](https://izelnakri.github.io/emberx/api/router/)       | [![JSR](https://jsr.io/badges/@izelnakri/emberx-router)](https://jsr.io/@izelnakri/emberx-router)             |
| [`@emberx/helper`](packages/@emberx/helper/README.md)             | template helpers (`eq`, `and`, `take`...), and `helper()` for your own         | [![npm](https://img.shields.io/npm/v/@emberx/helper?label=)](https://www.npmjs.com/package/@emberx/helper)             | [API](https://izelnakri.github.io/emberx/api/helper/)       | [![JSR](https://jsr.io/badges/@izelnakri/emberx-helper)](https://jsr.io/@izelnakri/emberx-helper)             |
| [`@emberx/test-helpers`](packages/@emberx/test-helpers/README.md) | `render`, `visit`, `click` and the rest, which wait for what they start        | [![npm](https://img.shields.io/npm/v/@emberx/test-helpers?label=)](https://www.npmjs.com/package/@emberx/test-helpers) | [API](https://izelnakri.github.io/emberx/api/test-helpers/) | [![JSR](https://jsr.io/badges/@izelnakri/emberx-test-helpers)](https://jsr.io/@izelnakri/emberx-test-helpers) |
| [`@emberx/ssr`](packages/@emberx/ssr/README.md)                   | components and whole pages rendered to HTML on a server, hydrated in a browser | [![npm](https://img.shields.io/npm/v/@emberx/ssr?label=)](https://www.npmjs.com/package/@emberx/ssr)                   | [API](https://izelnakri.github.io/emberx/api/ssr/)          | [![JSR](https://jsr.io/badges/@izelnakri/emberx-ssr)](https://jsr.io/@izelnakri/emberx-ssr)                   |
| [`@emberx/string`](packages/@emberx/string/README.md)             | Ember's string utilities: `camelize`, `dasherize`...                           | [![npm](https://img.shields.io/npm/v/@emberx/string?label=)](https://www.npmjs.com/package/@emberx/string)             | [API](https://izelnakri.github.io/emberx/api/string/)       | [![JSR](https://jsr.io/badges/@izelnakri/emberx-string)](https://jsr.io/@izelnakri/emberx-string)             |

This README and each package's are the documentation, and the [website](https://izelnakri.github.io/emberx/)
has each package's API docs, from the JSDoc in its sources; every code example in them that is not
marked `ignore` runs as a test.

`examples/` holds two apps, each rendered on a server and hydrated in the browser. Deno serves
them with read access to the repository and network access to localhost, nothing else:

```sh
npm run examples:basic   # a component with a service, rendered with renderToString: no data
npm run examples:blog    # a routed blog, its comments fetched from its own API as it renders
npm run examples:blog -- --precompile   # the same, with its templates compiled at build time
```

They serve http://localhost:1234 (`PORT=4000 npm run examples:blog` for another port).
`benches/ssr-examples.bench.ts` measures both rendering, with templates compiled at runtime and at
build time. The end-to-end tests drive the blog.

Install from npm, or from [JSR](https://jsr.io/@izelnakri), where each package is
`@izelnakri/emberx-<package>`:

```sh
npm install @emberx/component @emberx/router
deno add jsr:@izelnakri/emberx-component jsr:@izelnakri/emberx-router
```

To work on emberx itself:

```sh
npm ci          # or: make install
make dev        # serves examples/blog on http://localhost:1234
```

### Development

Everything runs through `make`; run `make` on its own for the full list.

| Command                             | What it does                                           |
| ----------------------------------- | ------------------------------------------------------ |
| `make check`                        | format + lint + typecheck + tests, the core CI checks  |
| `make test`                         | the node, Deno and browser suites, with no build       |
| `make test-node`                    | the full suite under node + jsdom, plus @emberx/ssr    |
| `make test-deno`                    | the same suite under Deno                              |
| `make test-doctests`                | the code examples in the docs, run and checked         |
| `make test-browser`                 | the full suite in a real browser (chromium)            |
| `make coverage`                     | coverage of the packages' sources, to `tmp/coverage/`  |
| `node scripts/build-app.ts <entry>` | an app's production build, with a size report          |
| `make site`                         | the docs site: API docs, coverage and the landing page |
| `make bench`                        | runtime template-compilation and per-render benchmarks |
| `make build`                        | `dist/` and `.d.ts` for every package, for publishing  |
| `make dev`                          | example app with watch rebuilds                        |

CI runs these same checks as separate jobs, and also runs the browser suite in Firefox and WebKit,
a benchmark regression check, a package verification step, and coverage, which it sends to
Codecov.

Linting is `deno lint` and formatting is prettier, the same pair qunitx-cli uses. `deno fmt` would
be the natural partner, but it always moves a class-field decorator onto its own line, turning
`@tracked accessor count = 0;` into two lines, and no flag or `deno.json` option prevents it. emberx code is
full of one-line `@tracked`, `@service` and `@action` fields, so prettier stays. prettier comes
from `npm ci`; Deno is installed once per machine (see CONTRIBUTING.md).

The browser suite needs a Chrome/Chromium binary. It is picked up from `CHROME_BIN`,
otherwise from your `PATH`:

```sh
export CHROME_BIN=$(which google-chrome-stable)
make test-browser
```

### Status

Every package is tested in the browser (Chrome, Firefox and WebKit), under node and under Deno.
emberx is below 1.0: each package's public API, and what a release may change about it, is in
[CONTRIBUTING.md](CONTRIBUTING.md#public-api-and-versions).

### Differences between ember and emberx:

- Everything is resolvable without a build system on node.js or JS module bundlers.
- No controller abstraction, you can simply use the route object.
- No runloop, we dont need it anymore.
- test helpers(`click()`, `keyPress()` etc.) wait without a waiter when the fired action returns a promise, and for any router transition it started.
- Explicit and flexible routes declarations with @emberx/router.
- Ember Route hooks (`beforeModel`, `model`, `afterModel`, `redirect`) are static methods instead of instance methods. Actions are the routes' own `@action` methods, which do the work of Ember's controller and route actions; `this.send()` reaches the routes above a page (see Actions on a page).
- No sticky queryParams, instead link building is explicit with `<LinkTo @query={{hash param=value}}/>` or with object helpers `<LinkTo @query={{assign (hash active=true) this.router.queryParams}}/>`.
- No `{{outlet}}`: the router renders the page, the deepest route, and nothing around it. A layout pages share, such as a header, is a component each page's template includes. This keeps every route file compilable for the browser on its own, without a build step.
- Decorators are standard (TC39) decorators, as Deno, TypeScript and esbuild run them, not Ember's legacy ones: tracked state is an accessor, `@tracked accessor count = 0`. `@action` and `@service` read as in Ember.
- No need for initializers and instance initializers, all code runs in module file import and execution order.
- Easily sharable/downloadable/distributable emberx components and routes with npm.

### API Design

What if `@ember/routing/router` & `@ember/routing/route` were a tiny and explicitly resolvable router you could import from npm.
Flexible and simple API below can be progressively backward-compatible and support current ember router definitions!

```ts ignore
// in ./router.js

import Router from '@emberx/router';
import IndexRoute from './routes/index/route.ts';
import PostsRoute from './routes/posts/route.ts';
import PostsIndexRoute from './routes/posts/index/route.ts';
import PostsPostRoute from './routes/posts/post/route.ts';

Router.addServices({
  intl: new LocaleService(),
});

let router = Router.start([
  { path: '/', route: IndexRoute }, // named "index"
  { path: '/posts', route: PostsRoute, indexRoute: PostsIndexRoute }, // "posts", and "posts.index"
  { path: '/posts/:post_id', route: PostsPostRoute }, // "posts.post"
  { path: '/posts/:slug/comments', name: 'posts.post.comments', route: PostsPostCommentsRoute }, // a name of its own
]);

export default router;
```

A route's name is what `<LinkTo @route="...">`, `transitionTo`, `urlFor` and `modelFor`
refer to. Nested routes have dotted names. A definition can give its route a `name`; one
without a name is named after its path, one name segment for each path segment:

| `path`                         | The route's name          | Why                                              |
| ------------------------------ | ------------------------- | ------------------------------------------------ |
| `/`                            | `index`                   | the root page                                    |
| `/posts`                       | `posts`                   |                                                  |
| `/blog-posts`                  | `blog-posts`              | a segment stays as it is                         |
| `/posts/:post_id`              | `posts.post`              | a dynamic segment loses its `_id`                |
| `/users/:userId`               | `users.user`              | or its `Id`                                      |
| `/pages/:slug`                 | `pages.slug`              | any other dynamic segment keeps its name         |
| `/posts/:post_id/comments/new` | `posts.post.comments.new` |                                                  |
| `/*path`                       | `not-found`               | a catch-all, for the URLs no other route matches |

Give a route a `name` when the one from its path isn't the one you want, as the comments
route above does: from its path it would be `posts.slug.comments`.

A URL no route matches goes to the `not-found` route. Unless the app declares a catch-all,
that is `NotFoundRoute`, a page that says nothing is at the URL, titled "Page not found". Declare
`{ path: '/*path', route: AppNotFoundRoute }` to show a page of your own, extending
`NotFoundRoute` to keep its title; with `resolve` (below), a `not-found` route it finds
replaces it too. An `@emberx/ssr` server answers such a page with a 404.

A route's parents need no definition of their own. With `/admin/reports` declared alone, the
router creates an `admin` route above `admin.reports`, with no class and nothing to show, the
way Ember's `this.route('admin', function () { this.route('reports'); })` does. Declare
`/admin` too when it has a page, a model or actions of its own. A route whose name ends in
`.index` is created for you as well — declare it with `indexRoute` instead.

Declaring a route twice is a mistake the router reports with a `console.error`, and the later
declaration replaces the earlier one:

- the same name twice, whether given or from the path: `{ path: '/posts' }` and
  `{ path: '/articles', name: 'posts' }`;
- one path under two names: `{ path: '/posts', name: 'posts' }` and
  `{ path: '/posts', name: 'articles' }`, where only one of them could ever be visited;
- the application route, or the same loading or error route (by its `loadingRoute`/`errorRoute`
  or by its name), twice.

#### An existing `Router.map()`, with routes found by name:

`Router.start()` also takes an Ember `Router.map()` definition, as it is. A route a map
declares has no class of its own; `resolve` finds one by its name, as Ember finds
`app/routes/posts/post.js`. It is called for every route declared without a class, index
routes included, and for every route's loading and error substates, by Ember's names:
`posts_loading` while `posts` loads, `posts.loading` while a route under `posts` loads, and a
top-level `loading` and `error` for everything else. It returns a route class, or a module
whose default export is one, so a bundler's glob is enough:

```ts ignore
import Router from '@emberx/router';

// { './routes/posts.ts': { default: PostsRoute }, './routes/posts/loading.ts': ..., ... }
const modules = import.meta.glob('./routes/**/*.ts', { eager: true });

Router.start(
  [],
  function () {
    this.route('posts', function () {
      this.route('post', { path: '/:post_id' });
    });
    this.route('about');
  },
  { resolve: (name) => modules[`./routes/${name.replaceAll('.', '/')}.ts`] },
);
```

Here `routes/posts/index.ts` is what `/posts` shows, `routes/posts/loading.ts` shows while a
post loads, and `routes/error.ts` catches a failure nothing closer handles. Definitions mix
with it, and win over it: `Router.start(definitions, { resolve })` without a map, or
`Router.start(definitions, map, { resolve })` with one. A route that declares a
`loadingRoute` keeps it whatever `resolve` returns for `<name>_loading`.

#### Routes loaded when they are entered:

A route can be a function that imports it, in a definition or from `resolve`, as
`import.meta.glob` without `eager` returns them. The router imports it on the first transition
that enters it, so a bundler that splits code (esbuild's `--splitting`) gives each such route a
chunk of its own, which the browser downloads only when the route is visited:

```ts ignore
Router.start([
  { path: '/', route: IndexRoute }, // in the page's own bundle
  { path: '/posts/:post_id', route: () => import('./routes/post.ts') }, // imported on its first visit
]);
```

Links to it have their URLs before it is imported, and a server renders it as it renders any route.

This experiment is also a sketch/request for a new ember edition.

#### Familiar @emberx/route:

```ts ignore
import { Route, LinkTo, hbs, tracked, service, action, on } from '@emberx/router';

import t from '../helpers/t';
import Counter from '../components/Counter';

export default class IndexRoute extends Route {
  @service intl;

  @tracked accessor dynamicObject;

  constructor(owner, args) {
    super(owner, args);

    window.setInterval(() => {
      this.dynamicObject = {
        dynamicDate: new Date().toString(),
      };
    }, 200);
  }

  static includes = {
    LinkTo,
    Counter,
    t,
  };

  static model(): object {
    return {
      logo: 'https://emberjs.com/images/ember-logo.svg',
      dynamicObject: { dynamicDate: new Date() },
    };
  }

  static template = hbs`
    <div id="intro">
      <h1>This is some route</h1>

      <LinkTo @route="posts.post" @model="232">Go to post 232</LinkTo>

      <h5>Current locale is: {{this.intl.currentLocale}}</h5>
      <button type="button" {{on "click" this.changeLocale}}>Change locale</button>

      <p>Localized button example:</p>
      <button type="button">{{t "button.save" this.intl}}</button>


      <img src={{this.model.logo}}/>
      <h5>Logo is {{this.model.logo}}</h5>
    </div>

    {{this.dynamicObject.dynamicDate}}

    <Counter/>
  `;

  @action changeLocale(): void {
    this.intl.currentLocale = this.intl.currentLocale === 'en' ? 'es' : 'en';
  }
}
```

#### The application route:

Every app has one route above all the others, named `application`. It has no URL of its own and
adds nothing to the names or URLs of the routes under it: `/posts/1` is still the `posts.post`
route at `/posts/1`, with `application` above `posts`. Its job is what concerns every page.
Declaring it is optional; without a declaration, a blank one is there.

```ts ignore
import Router, { Route, action, service } from '@emberx/router';

class ApplicationRoute extends Route {
  @service session;

  // Query params every page can read as @queryParams: here ?theme=dark.
  static queryParams = { theme: 'light' };

  // Runs once, on the first visit, whatever page that is.
  static async beforeModel(transition) {
    await this.session.restore();

    if (!this.session.isAuthenticated && transition.to.name !== 'login') {
      return this.router.transitionTo('login');
    }
  }

  // Any route reads this with this.modelFor('application').
  static model() {
    return { currentUser: this.session.currentUser };
  }

  // Any page can send it: {{on "click" (fn this.send "logout")}}.
  @action async logout() {
    await this.session.invalidate();
    this.router.transitionTo('login');
  }
}

Router.start([
  { name: 'application', route: ApplicationRoute, loadingRoute: LoadingRoute, errorRoute: ErrorRoute },
  { path: '/', name: 'home', route: HomeRoute },
  { path: '/login', name: 'login', route: LoginRoute },
  { path: '/posts', name: 'posts', route: PostsRoute },
]);
```

| To                                                              | On the application route                                                      |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| load what every page needs: the current user, settings          | `beforeModel` and `model`; routes read it with `this.modelFor('application')` |
| send people elsewhere before any page shows: log in, onboarding | `transitionTo()` in `beforeModel`, unless they are already going there        |
| do something any page can ask for: log out, notify              | an `@action`, which any page reaches with `this.send()`                       |
| guard leaving any page                                          | `willTransition(transition)`, for pages and routes that have none             |
| read query params on every page: `?theme=`, `?locale=`          | `static queryParams`                                                          |
| show the same loading or error page everywhere                  | `loadingRoute` and `errorRoute`                                               |

- **Its hooks run once,** on the first visit. Moving between pages leaves it active, so they do
  not run again; `ApplicationRoute.refresh()` runs them again, and those of every route under it.
- **Its `beforeModel` runs for the first visit to any page,** so a redirect there must let the
  page it redirects to through, as `transition.to.name !== 'login'` does above.
- **It has no template on screen.** As with any route above the page, its actions run on an
  instance the router makes of it, which keeps its state until the route is refreshed. A layout every page
  shares, such as a header or navigation, is a component each page's template includes.
- **Its `loadingRoute` and `errorRoute` are the app-wide fallbacks,** used for a route that has
  no closer one, the same as routes named `loading` and `error`.

For Ember users: this is Ember's `ApplicationRoute`, declared in `Router.start()` instead of found
at `app/routes/application.js`. There is no `application` template and no `{{outlet}}`.

#### Index, loading and error routes:

A route definition can name up to three more routes besides its own `route`. None of them
has a URL of its own:

| Key            | What it shows                                                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `indexRoute`   | The route's own URL, when it has routes under it. Without one, `/posts` shows `route`; with one, `route` only loads data its children share.       |
| `loadingRoute` | The page while this route's model hooks are pending, or those of a route under it that has no `loadingRoute` of its own.                           |
| `errorRoute`   | The page when this route's hooks throw or reject, or those of a route under it that has no `errorRoute` of its own. It gets the error as `@model`. |

The application route's own `loadingRoute` and `errorRoute` (see The application route) catch whatever no route below handles.

```ts ignore
Router.start([
  { path: '/', name: 'home', route: HomeRoute },
  {
    path: '/posts',
    name: 'posts',
    route: PostsRoute, // loads the posts, which routes under it read with this.modelFor('posts')
    indexRoute: PostsIndexRoute, // what /posts shows: the list
    loadingRoute: PostsLoadingRoute, // while /posts, or /posts/:post_id, loads
    errorRoute: PostsErrorRoute, // when loading the posts fails
  },
  {
    path: '/posts/:post_id',
    name: 'posts.post',
    route: PostRoute,
    errorRoute: PostErrorRoute, // when loading one post fails; it loads with PostsLoadingRoute
  },
  { name: 'application', loadingRoute: LoadingRoute, errorRoute: ErrorRoute }, // the fallbacks, here for /
]);
```

| URL        | While it loads      | When it fails                                                      |
| ---------- | ------------------- | ------------------------------------------------------------------ |
| `/`        | `LoadingRoute`      | `ErrorRoute`                                                       |
| `/posts`   | `PostsLoadingRoute` | `PostsErrorRoute`                                                  |
| `/posts/1` | `PostsLoadingRoute` | `PostErrorRoute`, or `PostsErrorRoute` if loading the posts failed |

A loading or error route is an ordinary route with a template, entered without changing the
URL. A model that resolves right away never shows its loading route, and a hook that catches
its own error shows no error route (see Actions on a page).

For Ember users: `loadingRoute` and `errorRoute` declare the `posts_loading` and `posts_error`
substates, and on the application route the top-level `loading` and `error`. The Ember names work too, as definitions without a path (`{ name: 'posts.loading',
route }`) or as `this.route('loading')` in a `Router.map()` definition.

#### Route hooks and query params:

```ts ignore
import Router, { Route, hbs } from '@emberx/router';

class PostsRoute extends Route {
  // A change to `page` runs the model hook again; `sort` only updates the template,
  // and swaps the history entry instead of adding one. Defaults stay out of the URL.
  static queryParams = {
    page: { defaultValue: 1, refreshModel: true },
    sort: { defaultValue: 'newest', replace: true },
  };

  static beforeModel(transition) {
    if (!this.session.currentUser) {
      return this.router.transitionTo('login');
    }
  }

  static model({ queryParams }) {
    return fetch(`/posts?page=${queryParams.page}`).then((response) => response.json()); // a failure shows PostsErrorRoute
  }

  static template = hbs`
    <h1>Page {{@queryParams.page}}, {{@queryParams.sort}} first</h1>
    {{#each this.model as |post|}}<p>{{post.title}}</p>{{/each}}
  `;
}

Router.start([
  { path: '/posts', name: 'posts', route: PostsRoute, errorRoute: PostsErrorRoute },
  { path: '/posts/:post_id', name: 'posts.post', route: PostRoute },
]);

// The router service, `this.router` in routes and components, as in Ember:
router.on('routeDidChange', (transition) => analytics.trackPage(transition.to.name));
router.urlFor('posts.post', post, { queryParams: { page: 2 } }); // '/posts/1?page=2', no transition
PostsRoute.refresh(); // its model hooks again, and its children's; {{on "click" this.refresh}} in a template
```

#### Page titles, `<head>` and `<body>`:

A route's `static title`, a string or a function of its model, names the page: the deepest
active route that has one wins. `static head` is what a page puts in `<head>`, for search
engines, link previews and the like: a `title`, a `description`, and `meta`, `link` and `script`
elements, a `script` for structured data (JSON-LD) above all. `static body` is what it puts
`start` and `end` of `<body>`, around the page: an analytics script, or a `<noscript>` for one.
Each is a value, or a function of the route's model, what its model hook resolved to, with the
route as `this`.

```ts ignore
class ApplicationRoute extends Route {
  static title = 'Blog';
  static head = {
    description: 'Essays on web frameworks.',
    meta: [{ property: 'og:site_name', content: 'Blog' }],
    link: [{ rel: 'canonical', href: 'https://blog.example/' }],
  };
  static body = {
    end: [{ tag: 'script', src: '/analytics.js', async: true }],
  };
}

class PostRoute extends Route {
  static head = (post) => ({
    title: `${post.title} | Blog`,
    description: post.summary,
    meta: [{ property: 'og:title', content: post.title }],
    link: [{ rel: 'canonical', href: `https://blog.example/posts/${post.id}` }],
    script: [
      { type: 'application/ld+json', children: JSON.stringify({ '@type': 'BlogPosting', headline: post.title }) },
    ],
  });
}
```

Routes merge from the application route down to the page: a deeper route's element replaces one
above it that is the same `<meta>` (by `name`, `property`, `http-equiv` or `itemprop`), the
canonical `<link>`, or a script with the same `id` or `src`; the others add up. So the
application route holds the app's defaults, and each page only what is its own: on `/posts/1`
above, the description and canonical link are the post's, and `og:site_name` and the analytics
script are the app's.

In a browser, the router applies them after each transition, the title to `document.title`, which
a screen reader announces, and changes only the elements that changed: one that stays the same
is left as it is, so its script does not run again. `router.currentTitle` and
`router.currentHead` hold what it applied. On a server, `@emberx/ssr`'s `renderURL` renders them
into the document it sends, and the browser's router adopts those elements on its first
transition rather than adding them again.

#### When a transition fails:

A model hook that throws or rejects shows the nearest error route (see Index, loading and error
routes). With none to show, `Router.visit()` and `router.transitionTo()` reject with the error,
and the page stays as it was: an app with no error routes catches it, or declares one on the
application route for everything. An aborted transition, one `willTransition` stopped for
example, is no failure.

To follow transitions in the console, turn on `Router.LOG_ROUTES`, which logs each route the
router looks up, and `Router.LOG_MODELS`, which logs each model and transition a route sets up.
Both are off by default.

#### Actions on a page:

In emberx a page is a route: one class holds the page's hooks, its template and everything the
page does. A page needs no component to act, and no controller: its `@action` methods and
`@tracked` fields belong to the route.

```ts ignore
import Router, { Route, hbs, action, service, tracked } from '@emberx/router';

class PostRoute extends Route {
  @service sharing; // what several pages do the same way lives in a service

  @tracked accessor isLiked = false;
  @tracked accessor draft = '';

  static model({ post_id }) {
    return fetch(`/posts/${post_id}`).then((response) => response.json());
  }

  @action toggleLike() {
    this.isLiked = !this.isLiked;
  }

  @action updateDraft(event) {
    this.draft = event.target.value;
  }

  @action async saveComment() {
    await fetch(`/posts/${this.model.id}/comments`, { method: 'POST', body: this.draft });
    this.draft = '';
    await this.refresh(); // the model hook again, for the new comment
  }

  @action share(medium) {
    this.sharing.share(this.model, medium);
  }

  // The router calls this on the page on screen, before it leaves the page.
  @action willTransition(transition) {
    if (this.draft && !window.confirm('Leave without posting your comment?')) {
      transition.abort(); // stays on the page; the URL does not change
    }
  }

  static template = hbs`
    <h1>{{this.model.title}}</h1>

    <button type="button" {{on "click" this.toggleLike}}>{{if this.isLiked "Liked" "Like"}}</button>

    <textarea value={{this.draft}} {{on "input" this.updateDraft}}></textarea>
    <button type="button" {{on "click" this.saveComment}}>Comment</button>

    <button type="button" {{on "click" (fn this.share "mastodon")}}>Share</button>
  `;
}
```

In an action, `this` is the page on screen: its `@tracked` fields, `this.model`, `this.router` and
its services. `click()`, `fillIn()` and the other test helpers wait for an async action to finish.

##### Sending an action to the routes above a page

A page can also send an action to the routes above it: `this.send(name, ...args)`, or
`(fn this.send "name" ...)` in its template. The action goes to the page first, then to its
parent route, then to that route's parent, and runs on the first that has an `@action` by that
name. An action that returns `true` passes it on to the next route up. This is how Ember's
`send()` works, and it suits what belongs to a part of the app rather than to one page:

```ts ignore
class BlogRoute extends Route {
  @service sharing;

  @action subscribe(email) {
    return fetch('/subscriptions', { method: 'POST', body: email }); // any page of the blog can send it
  }

  @action share(post, medium) {
    this.sharing.share(post, medium);
  }
}

class PostsRoute extends Route {
  @service sharing;
  @tracked accessor archivedCount = 0;

  static model() {
    return fetch('/posts').then((response) => response.json());
  }

  @action async archive(post) {
    await fetch(`/posts/${post.id}/archive`, { method: 'POST' });
    post.isArchived = true;
    this.archivedCount++;
  }

  @action share(post, medium) {
    if (medium !== 'mastodon') {
      return true; // the blog shares by every other medium
    }

    this.sharing.toot(post);
  }
}

// What /blog/posts shows. It needs no actions of its own.
class PostsIndexRoute extends Route {
  static model() {
    return this.modelFor('blog.posts');
  }

  static template = hbs`
    {{#each this.model as |post|}}
      <h2>{{post.title}}</h2>
      <button type="button" {{on "click" (fn this.send "archive" post)}}>Archive</button>
      <button type="button" {{on "click" (fn this.send "share" post "mastodon")}}>Mastodon</button>
      <button type="button" {{on "click" (fn this.send "share" post "email")}}>Email</button>
    {{/each}}
    <button type="button" {{on "click" (fn this.send "subscribe" "reader@example.com")}}>Subscribe</button>
  `;
}

Router.start([
  { path: '/blog', name: 'blog', route: BlogRoute },
  { path: '/blog/posts', name: 'blog.posts', route: PostsRoute, indexRoute: PostsIndexRoute },
  { path: '/blog/posts/:post_id', name: 'blog.posts.post', route: PostRoute },
]);
```

- **A route above the page has no template on screen.** Its action runs on an instance of the
  route the router makes, with that route's own `this.model`, params and services. The instance
  lasts while the route stays active with the same model, so `archivedCount` keeps counting
  across the pages under `/blog/posts`. Leaving the route, or a `refresh()` of it, starts a new
  one.
- **`this.send()` returns what the action that ran returned**, a promise for an async one, so
  `click()` in tests waits for it. An action that neither the page nor a route above it has
  throws `Nothing handles the action '<name>'`.
- **`willTransition` takes the same path:** the page first, then the routes above it, so a
  parent route can guard its whole section.
- **Outside a page,** in a component or a service, `this.router.send(name, ...args)` does the
  same, starting from the page on screen.

The rest of what a page reacts to has one place each:

| To                                                        | Use                                                                                    |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| change what the page shows                                | an `@action` that sets `@tracked` fields                                               |
| do what the pages under one route share: archive, share   | an `@action` on that route, sent with `this.send()`                                    |
| do what pages all over the app share: log out, notify     | an `@action` on the application route, or a service                                    |
| warn before leaving a page, or keep the user on it        | `willTransition(transition)` on the page or a route above it, and `transition.abort()` |
| load the page's data again                                | `this.refresh()`                                                                       |
| show something while a page loads                         | a `loadingRoute`                                                                       |
| recover from a failing request, or redirect (403 → login) | a `catch` in the model hooks                                                           |
| show an error page                                        | an `errorRoute`; it gets the error as `@model`                                         |
| react to every transition: analytics, scroll, page titles | `router.on('routeWillChange')` and `router.on('routeDidChange')`                       |

A hook that catches its own error is not an error to the router: no error route shows, and
`visit()` resolves.

```ts ignore
class DashboardRoute extends Route {
  static async model() {
    const response = await fetch('/dashboard');
    if (response.status === 403) {
      return this.router.transitionTo('login');
    } else if (!response.ok) {
      throw new Error(`The dashboard could not load (${response.status})`); // the nearest errorRoute shows it
    }

    return response.json();
  }
}
```

For Ember users: actions are `@action` methods on routes, and `this.send()` goes from the page
up the routes, as in Ember. With services and the router's own hooks, they cover what Ember
splits between controllers and route actions:

| In Ember                                               | In emberx                                                               |
| ------------------------------------------------------ | ----------------------------------------------------------------------- |
| `ApplicationRoute`                                     | the `application` route, declared in `Router.start()`                   |
| a controller's `@action` methods and `@tracked` fields | the route's `@action` methods and `@tracked` fields                     |
| route actions, and `this.send()` to reach them         | `@action` methods on the routes above the page, and `this.send()`       |
| `{{action "share"}}`                                   | `{{on "click" (fn this.send "share")}}`, or the page's own `this.share` |
| the route's `error` action                             | a `catch` in the model hooks, or an `errorRoute`                        |
| the route's `loading` action                           | a `loadingRoute`, or `router.on('routeWillChange')`                     |
| the route's `willTransition` action                    | `willTransition` on the page or a route above it                        |
| the route's `didTransition` action                     | `router.on('routeDidChange')`, or the page's constructor                |

A route written the Ember way, with an `error`, `loading` or `didTransition` method, gets a
console warning naming the emberx way, once.

#### Familiar @emberx/component:

```ts
import assert from 'node:assert/strict';
import Component, { service, tracked, action, hbs, renderComponent } from '@emberx/component';

class LocaleService {
  @tracked accessor currentLocale: string;

  constructor(currentLocale: string) {
    this.currentLocale = currentLocale;
  }

  @action
  setLocale(locale) {
    this.currentLocale = locale;
  }
}

class AnotherComponent extends Component {
  @service locale;

  message = 'hello world';
  @tracked accessor count = 55;

  static template = hbs`
    <div id="another-component">
      <p id="message">Current message: {{this.message}}</p>
      <p id="locale-info">Component gets rendered. Current locale is {{this.locale.currentLocale}}</p>
      <span>Count is {{this.count}}</span>
      <p id="received-arg">Received argument is {{@notice}}</p>
      <button {{on "click" this.increment}} id="increment-button">Increment</button>
      <button {{on "click" this.changeMessage}} id="another-message-button">Change message</button>
      <button {{on "click" (fn this.locale.setLocale "tr")}} id="change-locale-button">Change locale</button>
    </div>
  `;

  @action
  increment(): void {
    this.count++;
  }

  @action
  changeMessage(): void {
    this.message = 'message changed';
  }
}

class MainComponent extends Component {
  @service locale;
  @tracked accessor mainMessage = 'hello world';

  // This is how you can do template imports
  static includes = {
    AnotherComponent,
  };
  static template = hbs`
    <p id="main-component-message">{{this.mainMessage}}</p>
    <p id="main-component-formatted-message">{{this.formattedMessage}}</p>
    <div id="another">
      <AnotherComponent @notice={{this.mainMessage}} />
    </div>
    <button {{on "click" this.changeMessage}} id="message-button">Change main message</button>
  `;

  get formattedMessage() {
    return this.mainMessage.toUpperCase();
  }

  @action
  changeMessage(): void {
    this.mainMessage = 'message changed';
  }
}

await renderComponent(MainComponent, {
  element: document.getElementById('app'),
  owner: { services: { locale: new LocaleService('en') } },
});

assert.equal(document.querySelector('#main-component-formatted-message').textContent, 'HELLO WORLD');
assert.equal(document.querySelector('#locale-info').textContent, 'Component gets rendered. Current locale is en');
```

Template/Component imports are respecting typescript standards, thus can be easily run node.js with npm, allowing
simple server side rendering.

#### Server-side rendering, and hydration in the browser:

`@emberx/ssr` renders on a server, in node or Deno, with no browser DOM:

```ts
import assert from 'node:assert/strict';
import Component, { hbs } from '@emberx/component';
import { renderToString } from '@emberx/ssr';

class Greeting extends Component {
  static template = hbs`<p>Hello {{@name}}</p>`;
}

assert.equal(await renderToString(Greeting, { args: { name: 'server' }, hydratable: false }), '<p>Hello server</p>');
```

Without `hydratable: false` the markup also carries the comments Glimmer's rehydration reads.
A browser render into an element holding it then adopts it: `renderComponent` reuses the
server's nodes, attaches their event handlers, and updates them in place from then on,
instead of building the page again.

For a whole app, `renderURL(url)` renders the page a URL shows: the router goes to it as it
would in a browser, model hooks, redirects and loading or error substates included, and the page
it ends on renders to HTML. It returns the page's `title` and the routes' `models` with it: left
in the page's `#shoebox` element, the browser's `Router.start()` reads them, and its first
transition takes them instead of fetching them again; its first render hydrates the server's page. Each call renders with a router of
its own, so requests that arrive together render at once, each with the `services` it is given.
See [@emberx/ssr](packages/@emberx/ssr/README.md) for a server.

#### Inside an app of another framework:

emberx needs no page of its own: a React, Vue or Svelte app, or a server-rendered page, can host it.

- A component renders into any element, as many as you like: `renderComponent` resolves to the
  render, whose `destroy()` removes it, and `unmountComponent(element)` removes what an element
  holds, what a host's unmount calls. Args in a `trackedObject` update it in place when the host
  sets them. See [@emberx/component](packages/@emberx/component/README.md#mounted-in-an-app-of-another-framework)
  for a React and a Vue host.
- A routed app renders into the element `Router.start(routes, { rootElement })` names, `#app`
  by default, and with `location: 'none'` keeps its URL to itself, leaving the page's to the
  host's router. There is one router a page: `Router` is static.
- Nothing is global but Glimmer's own setup: no run loop, no `window` listeners until a router
  follows the address bar, and an `owner` of each render's own for its services.

#### Compiling templates at build time (optional):

Templates compile in the browser on first render, which needs no build step. A production
build can compile them ahead of time with `@emberx/component/precompile`, so the browser
compiles nothing and evaluates no code: no `'unsafe-eval'` in a Content Security Policy. See
[@emberx/component](packages/@emberx/component/README.md#compiling-templates-at-build-time).

#### Building an app for production:

`node scripts/build-app.ts src/app.ts` builds an app the way `emberx build` will: its templates
precompiled, its code split so that Ember's template compiler and each route imported on entry
are chunks of their own, minified, and with router_js on native promises rather than rsvp. It
prints each file's size, and what a first page load downloads: 191 kB minified, 62 kB gzip, for
an app of one component, half of what the same app bundled and minified downloads. Flags turn
each default off: `--no-precompile`, `--no-split`, `--no-minify`, `--rsvp`.

#### Testing:

Tests use QUnit through [QUnitX](https://github.com/izelnakri/qunitx), which runs the same test
files in the browser, under node and under Deno, and `@emberx/test-helpers`, Ember's test helpers
without a runloop: `click()` and the rest wait for the actions, transitions, test waiters and
renders they start. See [@emberx/test-helpers](packages/@emberx/test-helpers/README.md).

#### Configuration:

An app with no build has no build-time environment: configuration is a module it imports, which a
server or a deploy can write. A build that bundles the app can replace values in it instead, as
esbuild's `--define` does:

```ts ignore
// config.ts
export default { apiHost: globalThis.API_HOST ?? 'http://localhost:3000' };

// esbuild app.ts --bundle --define:globalThis.API_HOST='"https://api.example.com"'
```

Development checks, such as the component base class reporting a component built outside a
render, are off unless `EMBERX_DEBUG` is defined as `true` the same way, or set on `globalThis`
before `@emberx/component` is imported. Every emberx test suite runs with them on.

emberx distributes every component, route and helper as a module of its own, which a parent
component includes with `static includes`, so any of them can be an npm package with no addon
system. It is also a sketch for an Ember edition without controllers, in which Ember's CLI is an
option rather than a requirement: "npm your way to Ember".

## Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) 24 or newer (with npm)
- A Chrome/Chromium binary for the browser test suite — see [Development](#development)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow.

## Further Reading / Useful Links

- [glimmerx](http://github.com/glimmerjs/glimmer-experimental/)
