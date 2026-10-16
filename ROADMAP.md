# Roadmap to v1

Status as of the 2026 modernization. The repo builds, tests and releases cleanly again;
what follows is what stands between that and a 1.0 anyone can put in production.

Ordered by what unblocks the most downstream work, not by size.

---

## 0. Where things actually stand

| Package                | Tests | State                                                             |
| ---------------------- | ----- | ----------------------------------------------------------------- |
| `@emberx/string`       | ✅    | Complete. Zero dependencies.                                      |
| `@emberx/helper`       | ✅    | Complete.                                                         |
| `@emberx/component`    | ✅    | Complete for the current renderer.                                |
| `@emberx/test-helpers` | ✅    | Complete; browser-only (see #3).                                  |
| `@emberx/router`       | ✅    | Complete apart from re-rendering (see #2); browser-only (see #3). |
| `@emberx/ssr`          | ❌ 0% | Untested, blocked on the router.                                  |

317 tests pass in the browser (the full suite). The 65 of them that need no router
also pass under node and under Deno, and the 13 code examples in the docs run as
doctests. See #3 for what keeps the rest browser-only.

---

## 1. Own the renderer — unblocks everything else

**Problem.** `@emberx/component` and `@emberx/helper` depend on `@glimmer/core`, the
standalone glimmer.js runtime. It is effectively abandoned: its last release pins the
Glimmer VM at `0.84.0`, while the VM itself ships `0.94`/`0.95` and Ember 7 has absorbed
glimmer-vm into its own monorepo. Staying on `@glimmer/core` means staying four years
behind the VM permanently, and it is the reason the dependency set is version-locked so
tightly.

**What emberx actually uses from it** is small and already enumerated:

- `renderComponent`, `didRender` — the render loop and its settledness signal
- `setComponentTemplate`, `templateOnlyComponent`, `getOwner`/`setOwner`
- `setComponentManager`, `setHelperManager`, `componentCapabilities`, `helperCapabilities`

Everything except `renderComponent`/`didRender` is a straight re-export of
`@glimmer/manager` and `@glimmer/owner`, so those can be repointed today with no behaviour
change. The real work is `renderComponent`: environment setup, the DOM tree builder, and
the render-transaction loop — roughly what `@glimmer/core/src/render-component.ts` does,
which is a few hundred lines.

**Why it is worth it.** It removes the last abandoned dependency, unlocks Glimmer 0.94+
(and whatever Ember ships next), and puts the render loop — the thing a framework competing
on performance must control — inside this repo instead of a dead upstream.

**Suggested order:** repoint the manager/owner imports first (mechanical, fully covered by
the existing suite) → port the environment delegate and render loop behind the existing
`renderComponent` signature → flip the VM to `0.94.x` → delete `@glimmer/core`.

---

## 2. Finish the router

Implemented and covered by `packages/@emberx/router/test/`: the model hook lifecycle,
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
compromising the premise. `benches/template-compilation.bench.ts` already measures exactly
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
- **Published `@emberx/component` leaves `@glimmer/compiler` external**, so the
  `defaultId` patch in `scripts/lib/glimmer-compat.js` only applies to this repo's own
  bundles. A consumer's bundler sees upstream's bare `require`: esbuild (and so Vite's dev
  server) turns it into a shim that throws inside upstream's `try` and works, but a bundler
  that leaves `require` as-is — a Rollup production build, for one — throws a
  `ReferenceError` on import. Either inline the patched compiler into `@emberx/component`,
  or add a Rollup build of a consumer app to the `package` CI job first to confirm it.
- **The published packages do not import natively in Deno.** `@glimmer/core` publishes
  CommonJS as `main`, with no exports map, and Deno does not see the named exports it
  re-exports, so `import { renderComponent } from '@emberx/component'` fails there. The Deno
  suite passes because esbuild bundles it from `@glimmer/core`'s ESM build, and
  `test:release` runs that suite against the tarballs but skips the native-import consumer
  test under Deno. Moving to `ember-source`, which is ESM with an exports map, removes it.
- **`@glimmer/core` never lets go of a rendered root.** `renderComponent` pushes every
  result onto a module-level array that nothing prunes, and every scheduled re-render
  revalidates all of them. In an app, each route transition adds a root, so re-render
  work and memory grow with navigation history. It also makes the Chrome render
  benchmarks too noisy to gate, keeps replaced routes following query-param changes
  unless the router freezes their args, and leaves `clearRender()` unable to destroy what
  it clears. `ember-source`'s `renderComponent` replaces what it rendered into an element
  before, which removes it.
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
