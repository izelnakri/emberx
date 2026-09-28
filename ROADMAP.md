# Roadmap to v1

Status as of the 2026 modernization. The repo builds, tests and releases cleanly again;
what follows is what stands between that and a 1.0 anyone can put in production.

Ordered by what unblocks the most downstream work, not by size.

---

## 0. Where things actually stand

| Package                | Tests   | State                                                            |
| ---------------------- | ------- | ---------------------------------------------------------------- |
| `@emberx/string`       | ✅      | Complete. Zero dependencies.                                     |
| `@emberx/helper`       | ✅      | Complete.                                                        |
| `@emberx/component`    | ✅      | Complete for the current renderer.                               |
| `@emberx/test-helpers` | ✅      | Complete; browser-only (see #3).                                 |
| `@emberx/router`       | ⚠️ ~70% | Query params, substates and lifecycle hooks incomplete (see #2). |
| `@emberx/ssr`          | ❌ 0%   | Untested, blocked on the router.                                 |

221 tests pass: 215 in the browser (the full suite) and 6 under plain node.

The node suite is small because of the assertion library, not emberx: every
suite other than `@emberx/string` asserts with `assert.dom(...)` from qunit-dom,
which installs onto `QUnit.assert`, and under node qunitx delegates to
`node:test` where no such object exists. See #3 and the DOM-assertion note there.

---

## 1. Stay on Ember's renderer

emberx renders through `ember-source` 7: `renderComponent` from `@ember/renderer`, runtime
templates from `@ember/template-compiler/runtime`, and the Glimmer VM that ships inside
`ember-source`. glimmer.js (`@glimmer/core`) and the standalone glimmer-vm packages are
archived upstream; this is where the VM is maintained now. What is left:

- **Report two `renderComponent` issues upstream.** A root that throws on its first render
  stays in its renderer and re-throws on every later render through the same owner
  (emberx works around it with a stand-in owner per real owner, plus `resetRendering()`
  between tests). And `into instanceof Element` throws where there is no DOM, which
  `@emberx/ssr` works around with a temporary stand-in class.
- **Stop importing `_resetRenderers`**, from `@ember/-internals/glimmer`, once Ember has a
  public way to tear renderers down, or once the first issue above is fixed.
- **Runtime templates need `'unsafe-eval'`.** `template()` compiles to JavaScript and
  evaluates it; the JSON wire format emberx used before needed no eval, but Ember no longer
  exports that entry point. Worth an upstream conversation if a CSP-strict deployment
  matters.
- **Overlap with `@ember/helper`.** Ember now ships `and`, `or`, `not`, `eq`, `neq`, `gt`,
  `gte`, `lt` and `lte`. `@emberx/helper` could re-export them once their semantics are
  checked against emberx's (`and`/`or` return values in particular).
- **Install weight.** `ember-source` depends on Babel, broccoli and ember-cli packages for
  its blueprints, none of which emberx loads at runtime.

---

## 2. Finish the router

The largest correctness gap, and what `@emberx/ssr` is waiting on. Each item below had a
test file that was deleted during the modernization because it was empty — they should come
back as real tests:

- **Query params** — `Route.getQueryParams()` returns `{}`. `finalizeQueryParamChange` has a
  `delete finalQueryParams[key]` that cannot work: `finalQueryParams` is router_js's array
  of `{ key, value }` records and `key` is a param name, not an index. Restore
  `packages/@emberx/router/test/route/query-params-test.ts`.
- **Loading and error substates** — no implementation. Restore
  `packages/@emberx/router/test/route/loading-and-error-substate-test.ts`.
- **Nested routes and lifecycle** — `beforeModel`/`afterModel` are mentioned in the README
  and the TODO but do not exist; only `model` and `setup` do. `Route.getParams()` returns
  `{}`, and `this.paramsFor()` is unimplemented. Restore
  `packages/@emberx/router/test/route/nested-routes-and-lifecycle-test.ts`.
- **History back does not re-resolve routes** (carried over from `TODO`). This is a
  user-visible bug in any real app.
- **`Route.setup` wipes `innerHTML`** on every transition and is marked "temporary
  solution" in the source. It defeats Glimmer's diffing — every navigation is a full
  re-render. Fixing this is both a correctness and a performance item.

`router_js` is on `^8`; the suite passes against it, but the query-param and substate paths
are the least exercised and most likely to hide v7→v8 differences.

---

## 3. Make the suite runnable in node

`@emberx/string`, `@emberx/helper` and `@emberx/component` run under node + jsdom. The
router and test-helpers suites do not yet. Getting them there would let the whole suite
run headless, and it is a prerequisite for real SSR.

- **Router state outlives each test.** Every test that starts a router builds a new
  `RouterService`, which starts a new `LocationBar` against `window` and never stops the
  previous one; nothing tears the router down in `afterEach`. Transitions from a finished
  test then render into a container the next test has already removed ("#app or
  #ember-testing not found"). The browser tolerates this, but `node:test` reports it as a
  failure. Fixes: a router teardown in `setupTest` (stop the `LocationBar`, reset the URL),
  and an injectable location strategy — a `history` implementation and a `none`
  implementation, as Ember has — which is worth doing on its own merits.
- **The test-helpers suite hangs under node** for the same reason, plus event helpers that
  lean on real layout. Revisit once the router tears down cleanly.

---

## 4. Server-side rendering

`@emberx/ssr` is 20 lines and has no tests. It also duplicates
`traverseAndCompileAllComponents` from `@emberx/component` instead of importing it. Needs:
routing support (#2, #3), a test suite, and a hydration story — SSR without hydration is a
static-site generator.

---

## 5. Build-time template compilation (opt-in)

emberx compiles templates in the browser on first render. That is the project's central
bet and what makes "no build system" true, but the benchmarks put a typical component at
~0.4ms and a large page at ~10ms of compilation — paid on every cold load, by every user.

The bet is worth keeping as the _default_. But a production build that precompiles `hbs`
templates to wire format ahead of time — while leaving the runtime path intact for
development and for consumers with no build step — would remove that cost without
compromising the premise. `benches/template-compilation.bench.js` already measures exactly
what such a change would eliminate.

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
- **`Router.visit` now propagates errors** instead of silently swallowing them. Any caller
  that relied on the old behaviour needs a real error path.
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
