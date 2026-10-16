# Roadmap to v1

Status as of the 2026 modernization. The repo builds, tests and releases cleanly again;
what follows is what stands between that and a 1.0 anyone can put in production.

Ordered by what unblocks the most downstream work, not by size.

---

## 0. Where things actually stand

| Package                | Tests | State                                                                      |
| ---------------------- | ----- | -------------------------------------------------------------------------- |
| `@emberx/string`       | ✅    | Complete. Zero dependencies.                                               |
| `@emberx/helper`       | ✅    | Complete.                                                                  |
| `@emberx/component`    | ✅    | Complete for the current renderer.                                         |
| `@emberx/test-helpers` | ✅    | Complete; browser-only (see #3).                                           |
| `@emberx/router`       | ✅    | Complete apart from re-rendering (see #2); browser-only (see #3).          |
| `@emberx/ssr`          | ⚠️    | Renders to a string under node and Deno; no routing or hydration (see #4). |

341 tests pass in the browser (the full suite). The 65 of them that need no router
also pass under node and under Deno, as do @emberx/ssr's 2, which run there only, and
the 13 code examples in the docs run as doctests. See #3 for what keeps the rest browser-only.

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
query params (`static queryParams`), loading and error substates, page actions that
`this.send()` takes up the routes, `willTransition`, `Route.refresh()`, `router.urlFor()`,
`router.on('routeWillChange' | 'routeDidChange')`, and the browser's back and forward
buttons. What is left:

- **Substates are not discovered by convention.** Ember creates a loading and an error
  route under every route and enters one when the app has a template or class for it.
  emberx enters a substate only when it is declared, in `Router.start()` or in a
  `Router.map()` definition, and has a class. Finding them by file name is the job of the
  classic and module-unification resolvers, which are still stubs.
- **`Route.setup` wipes `innerHTML`** on every transition and is marked "temporary
  solution" in the source. It defeats Glimmer's diffing — every navigation is a full
  re-render. Fixing this is both a correctness and a performance item.

`router_js` is on `^8`. The lifecycle, query-param and substate suites pin its behaviour,
including the parts emberx relies on that are not documented, such as `redirect` still
running on a route whose `afterModel` redirected.

---

## 3. Make the suite runnable in node

`@emberx/string`, `@emberx/helper` and `@emberx/component` run under node + jsdom, and
under Deno. The router and test-helpers suites do not yet. Getting them there would let the whole suite
run headless, and it is a prerequisite for real SSR.

- **Router state outlives each test.** Every test that starts a router builds a new
  `RouterService` with a new `LocationBar` against `window`. Starting one now stops the
  previous one following the browser, but nothing tears the router down in `afterEach`. Transitions from a finished
  test then render into a container the next test has already removed ("#app or
  #ember-testing not found"). The browser tolerates this, but `node:test` reports it as a
  failure. Fixes: a router teardown in `setupTest` (stop the `LocationBar`, reset the URL),
  and an injectable location strategy — a `history` implementation and a `none`
  implementation, as Ember has — which is worth doing on its own merits.
- **The test-helpers suite hangs under node** for the same reason, plus event helpers that
  lean on real layout. Revisit once the router tears down cleanly.

---

## 4. Server-side rendering

`@emberx/ssr` renders a component to a string, and the node suite covers that. It
duplicates `traverseAndCompileAllComponents` from `@emberx/component` instead of importing
it. Needs: routing support (#2, #3) and a hydration story — SSR without hydration is a
static-site generator.

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
- **TypeScript 7** is current; this repo is on 5.9 because the codebase leans on legacy
  (`experimentalDecorators`) decorators. Worth evaluating, together with a move to standard
  decorators.
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
