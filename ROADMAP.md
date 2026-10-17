# Roadmap to v1

Status as of the 2026 modernization. The repo builds, tests and releases cleanly again;
what follows is what stands between that and a 1.0 anyone can put in production.

Ordered by what unblocks the most downstream work, not by size.

---

## 0. Where things actually stand

| Package                | Tests | State                                                                 |
| ---------------------- | ----- | --------------------------------------------------------------------- |
| `@emberx/string`       | ✅    | Complete. Zero dependencies.                                          |
| `@emberx/helper`       | ✅    | Complete.                                                             |
| `@emberx/component`    | ✅    | Complete for the current renderer.                                    |
| `@emberx/test-helpers` | ✅    | Complete.                                                             |
| `@emberx/router`       | ✅    | Complete (see #2).                                                    |
| `@emberx/ssr`          | ✅    | Components and URLs to hydratable HTML, under node and Deno (see #4). |

353 tests pass in the browser (the full suite), and the same 353 pass under node and
under Deno, as do @emberx/ssr's 11, which run there only. The 14 code examples in the docs
run as doctests.

---

## 1. Stay on Ember's renderer

emberx renders through `ember-source` 7, vendored as `@emberx/vendor`: `renderComponent`
from `@ember/renderer`, runtime templates from `@ember/template-compiler/runtime`, and the
Glimmer VM that ships inside `ember-source`. glimmer.js (`@glimmer/core`) and the standalone glimmer-vm packages are
archived upstream; this is where the VM is maintained now. Checked against 7.3.1, what is
left is upstream's to change:

- **Two `renderComponent` issues to report.** A root that throws on its first render stays
  in its renderer: in the production build every later render through the same owner runs
  it again and throws again (the development build only warns), and neither
  `destroy(owner)` nor `_resetRenderers()` clears it, since Ember keeps one renderer per
  owner. emberx renders each owner through a stand-in that inherits from it, and drops the
  stand-ins between tests. And `into instanceof Element` throws where there is no DOM,
  which `@emberx/ssr` gets past with a temporary stand-in class.
- **The `_resetRenderers` import**, Ember's `@ember/-internals/glimmer` through
  `@emberx/vendor`, stays until the first
  issue is fixed. `renderComponent` returns a public `{ destroy() }`, but a root that failed
  its first render gets no handle and stays in Ember's renderer list, which only
  `_resetRenderers()` empties.
- **Runtime templates need `'unsafe-eval'`.** `template()` always evaluates the JavaScript it
  compiles to. An eval-free path exists in parts: `createTemplateFactory`
  (`@ember/template-factory`, public) takes a wire-format block, but only the private
  `precompile` of `ember-source/ember-template-compiler` produces one, in a format that is
  not a public contract. Build-time compilation (#5) is the robust way out.

Settled: install weight. `ember-source` lists 17 dependencies (Babel, broccoli, ember-cli
packages) for its ember-cli hooks and blueprints, which its `dist/` never imports. emberx
does not depend on it: `@emberx/vendor` holds the ember-source modules emberx imports and
the files they reach, about half of its `dist/`.

Settled too: emberx keeps its own `and`, `or`, `not`, `eq`, `neq`, `gt`, `gte`, `lt` and `lte`
rather than re-exporting `@ember/helper`'s. Only `eq` and `neq` agree in templates, and even
they take `(a, b)` from JavaScript where emberx's take `([a, b])`. The rest differ: Ember's
treat `[]` and an empty `htmlSafe` string as false and follow proxies' `isTruthy`, throw on
any argument count but their own, and Ember's `not` takes one argument where emberx's is
true when every argument is falsy; Ember's comparisons have no `forceNumber`. They are also
keywords in Ember's runtime templates, which the helpers emberx puts in a template's scope
override.

---

## 2. Finish the router

Implemented and covered by `packages/@emberx/router/test/`: route names from paths, a
`console.error` for a route declared twice, the application route, the model hook lifecycle,
query params (`static queryParams`), loading and error substates, routes and substates found
by name through `Router.start(…, { resolve })` as Ember finds them by file name, page actions
that `this.send()` takes up the routes, `willTransition`, `Route.refresh()`,
`router.urlFor()`, `router.on('routeWillChange' | 'routeDidChange')`, and the browser's back
and forward buttons. Each transition renders the new page in place of the old one, through
Ember's renderer, which tears the previous one down; nothing clears the DOM behind it.

`router_js` is on `^8`. The lifecycle, query-param and substate suites pin its behaviour,
including the parts emberx relies on that are not documented, such as `redirect` still
running on a route whose `afterModel` redirected.

---

## 3. Make the suite runnable in node ✅

Done: every suite runs under node + jsdom and under Deno, as in the browser, so the whole
suite runs headless. What it took:

- **A router knows it is under test from `Router.testing`**, which @emberx/test-helpers'
  `setupTest` turns on, as Ember's test setup sets `Ember.testing`. It used to look for a
  global `QUnit`, which only qunitx's browser build defines, so under node the router
  rendered into `#app` and wrote its URLs to the address bar.
- **A test's teardown destroys what it rendered.** `resetRendering()` destroys each owner it
  rendered through, and Ember destroys every root rendered with one along with it, so a
  page's `willDestroy` runs and its timers stop instead of keeping node alive.
- **jsdom's gaps, filled in `test/setup-dom.js`**: `document.hasFocus()` agrees with the
  focus events jsdom fires, and `isContentEditable` exists. `pauseTest()` turns the
  timeout off with the longest one there is, since qunitx outside a browser takes no
  "off" value.

---

## 4. Server-side rendering

`@emberx/ssr` renders a component (`renderToString`) or the page a URL shows
(`renderURLToString`, through the router with its `none` location) to HTML that carries
Glimmer's rehydration markers. A browser render into that markup, `renderComponent` or the
router's first page, adopts the server's nodes instead of building them again. The node
suite covers both sides, and test:release runs a hydration against the packed tarballs.
What is left:

- **One render at a time.** emberx's `Owner` is a static class, so a process holds one
  router, and `renderURLToString` queues requests rather than rendering them together.
  Parallel rendering needs an owner per request, as FastBoot has an application instance
  per request: a change to how the packages find their owner, not to SSR.
- **Ember internals.** Serializing and hydrating go through Ember's `Renderer` and Glimmer's
  `serializeBuilder` and `rehydrationBuilder`, in `@emberx/component`'s
  `ember-internals.ts`: `renderComponent` always builds the DOM afresh and takes no
  builder. FastBoot relies on the same builders; a builder or mode option on
  `renderComponent` is the upstream ask that would make all of it public API.
- **The document around the page**: its `<title>`, meta tags and the data a route loaded,
  which the browser would otherwise fetch again before hydrating.

---

## 5. Build-time template compilation (opt-in)

emberx compiles templates in the browser on first render. That is the project's central
bet and what makes "no build system" true, but the benchmarks put a typical component at
~0.9ms and a large page at ~16ms of compilation — paid on every cold load, by every user.
Ember's compiler runs its AST plugins, which makes this about 2.5× what glimmer.js's
compiler took (~0.35ms and ~11ms in v0.1.0).

The bet is worth keeping as the _default_. But a production build that precompiles `hbs`
templates to wire format ahead of time — while leaving the runtime path intact for
development and for consumers with no build step — would remove that cost without
compromising the premise, and with it the `'unsafe-eval'` a strict CSP needs for runtime
templates (#1). `benches/template-compilation.bench.ts` already measures exactly what such
a change would eliminate.

---

## 6. Dependency and infrastructure debt

- **`@memserver/server`** is pinned transitively via an `overrides` entry for `pretender`
  (see CONTRIBUTING.md). It is a test-only dependency, but the pin blocks pretender
  updates. Either update memserver or replace the mock with something maintained.
- **`browser-inputs@1.1.0`** is exact-pinned and unmaintained; `@emberx/test-helpers` is
  entirely built on it.
- **`@memserver/model` imports `@emberx/string` without declaring it.** It resolves
  through this repo's workspace link on every platform except Windows, where esbuild
  cannot follow the junction — so the Windows CI leg runs the node suite only. Declaring
  the dependency upstream, or replacing memserver, restores the full Windows matrix.
- **TypeScript 7** is current; this repo is on 5.9. Its decorators are standard ones now,
  which the native TypeScript 7 compiler supports, so the move is worth evaluating.
- **`Router.visit` rejects when a transition fails** and no `error` handler or error
  substate deals with it, where it used to swallow every error. A caller that relied on
  that needs an error path: a handler, a substate, or a `catch`.
- **CI's `bench` job is advisory.** It compares against the PR's base on the same runner,
  which is like for like, but shared runners are still noisy on sub-microsecond cases.
  Once a few weeks of runs show which cases stay stable, it can become a real gate.

---

## 7. Before calling anything 1.0

- Documentation that is not the examples folder. The blog example is currently the
  specification.
- A public API commitment per package, and semver discipline across the six.
- `examples/blog` has an unused `.scss` tree left from the Parcel era and no stylesheet
  pipeline; decide whether styling is in scope.
- Accessibility and SSR/hydration correctness are unexamined.
- Decide what `emberx` (the npm name, currently a 2020 package at 1.0.4) should be: a
  meta-package that re-exports the six, or left alone.
