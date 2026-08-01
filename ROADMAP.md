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

271 tests pass (56 node, 215 browser).

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

The largest correctness gap, and what `@emberx/ssr` is waiting on. Each item below had a
test file that was deleted during the modernization because it was empty — they should come
back as real tests:

- **Query params** — `Route.getQueryParams()` returns `{}`. `finalizeQueryParamChange` has a
  `delete finalQueryParams[key]` that cannot work: `finalQueryParams` is router_js's array
  of `{ key, value }` records and `key` is a param name, not an index. Restore
  `test/route/query-params-test.ts`.
- **Loading and error substates** — no implementation. Restore
  `test/route/loading-and-error-substate-test.ts`.
- **Nested routes and lifecycle** — `beforeModel`/`afterModel` are documented in the README
  and the TODO but do not exist; only `model` and `setup` do. `Route.getParams()` returns
  `{}`, and `this.paramsFor()` is unimplemented. Restore
  `test/route/nested-routes-and-lifecycle-test.ts`.
- **History back does not re-resolve routes** (carried over from `TODO`). This is a
  user-visible bug in any real app.
- **`Route.setup` wipes `innerHTML`** on every transition and is marked "temporary
  solution" in the source. It defeats Glimmer's diffing — every navigation is a full
  re-render. Fixing this is both a correctness and a performance item.

`router_js` is on `^8`; the suite passes against it, but the query-param and substate paths
are the least exercised and most likely to hide v7→v8 differences.

---

## 3. Make the router runnable in node

`@emberx/router` instantiates `LocationBar` at construction, which touches `window`, so
router and test-helper tests cannot run under node — which is why the node suite covers
only two packages. Injecting the location strategy (a `history` implementation and a `none`
implementation, as Ember has) would let the whole suite run headless, cut CI time
substantially, and is a prerequisite for real SSR.

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
- **TypeScript 7** is current; this repo is on 5.9 because the codebase leans on legacy
  (`experimentalDecorators`) decorators. Worth evaluating, together with a move to standard
  decorators.
- **`Router.visit` now propagates errors** instead of silently swallowing them. Any caller
  that relied on the old behaviour needs a real error path.
- **Benchmark baselines are machine-specific**, so CI's `bench-check` is advisory. Recording
  a baseline on CI hardware, or comparing a PR against its merge-base on the same runner,
  would make it a real gate.

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
