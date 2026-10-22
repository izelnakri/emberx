# Contributing to emberx

## Getting set up

```sh
npm ci
make check     # format + lint + typecheck + node, Deno and browser suites + doctests
```

Nothing needs building first: every suite, the dev server and the benchmarks run from the
package sources. Run `make` with no arguments for every target.

- **Node 24** or newer (`engines.node`; `volta.node` pins the version CI uses).
- **[Deno](https://docs.deno.com/runtime/getting_started/installation/) 2.9** or newer, for
  linting, the Deno suite, the doctests, the build and the benchmarks. It is installed once per
  machine rather than as an npm dependency, which would add ~90 MB to every clone. CI and the
  Dockerfile pin 2.9.7; bump them together.
- **Chrome or Chromium** for the browser suite, from `CHROME_BIN` or your `PATH`:
  `export CHROME_BIN=$(which google-chrome-stable)`.

## How the repository is laid out

```
packages/@emberx/       the seven published packages
  vendor/               the ember-source, @glimmer/component and location-bar code emberx
                        uses; written by scripts/build-emberx-vendor.ts, never by hand
  string/               Ember's string utilities
  helper/               template helpers, with owner services as a third argument
  component/            the Glimmer component layer, runtime and build-time template compilation
  router/               routing on top of router_js
  test-helpers/         render/visit/click/settled, no runloop
  ssr/                  server-side rendering
examples/basic          a component, a helper and a service, with its tests in tests/
examples/blog           the app the end-to-end tests in test/e2e/ drive
benches/                Deno.bench and Chrome.bench files; results stay on your machine
build.ts                the package build: each dist/ and its .d.ts files
scripts/                vendoring, benchmarks, publishing, the release test, node's loader
test/                   the suites' entry points, the public API test, the blog's E2E tests;
                        each package's own suite is in packages/@emberx/*/test/
```

`build.ts` and the scripts are TypeScript that Deno runs, as in qunitx and qunitx-cli. Two
exceptions: `scripts/register.ts` is node's loader for the sources, and
`scripts/test-release.sh` is bash, since it drives `npm pack` and `npm install`.

## Running from the sources

In the repo, each package's `exports` point at its source (`"exports": { ".": "./src/index.ts" }`),
so every tool resolves `@emberx/router` to `packages/@emberx/router/src/` as it is: esbuild
(the browser suite, `npm run dev`, the benchmarks), TypeScript, Deno, which runs emberx's
standard decorators natively, and node, through `scripts/register.ts`, which compiles the
decorators that node's type stripping rejects. Nothing is built but a release, and CI's test
jobs run with no `dist/`, so a change that needs one fails there.

Relative imports name the file they import, `.ts` included (`import Route from './route.ts'`), so
node and Deno load a module without a bundler; `deno lint`'s `no-sloppy-imports` rule enforces
it. Only TypeScript node can strip is used (`erasableSyntaxOnly`, `verbatimModuleSyntax`).

## How the build works

`make build` bundles each package to one ESM file with esbuild, leaving every bare specifier
external, so `@emberx/router` still imports `@emberx/component` at runtime rather than inlining a
copy, and compiles the packages' own templates (`<LinkTo>`'s, `Route`'s) as an app's build can.
TypeScript 7's `tsc` then emits the declarations for every package in one run, with their `.ts`
specifiers rewritten to `.js`. Each `dist/` is a package of its own, with a `package.json` whose
`exports` point at the bundle and its declarations, its README and LICENSE: `npm publish` and
`npm pack` are given that directory, and `@emberx/vendor` as it is.

## Ember, through @emberx/vendor

Ember's modules come from `@emberx/vendor`: `import { renderComponent } from
'@emberx/vendor/@ember/renderer'`. `ember-source` ships them as files whose types it declares
under bare names that only an Embroider build resolves; `@emberx/vendor` holds the ones emberx
uses as plain package exports, with their types, so node, Deno, esbuild, TypeScript and every
consumer resolve them with nothing in between.

`npm run vendor` (`scripts/build-emberx-vendor.ts`) writes it from the versions `package.json`
pins as exact devDependencies:

- from `ember-source`, the modules the packages' sources import from `@emberx/vendor/…`, every
  file they reach, and their declarations. A new import of an Ember module is one
  `npm run vendor` away. None of `ember-source`'s own dependencies, which its ember-cli hooks and
  blueprints use, reaches a consumer.
- `@glimmer/component`, the base class Ember apps use, with three changes marked `emberx:`: its
  checks follow `EMBERX_DEBUG` (below), an owner may be a function, as `@emberx/router`'s static
  `Owner` is, and the args the router makes for a route above the page pass for Glimmer's.
- `location-bar`, Backbone's history handling, a 2016 UMD script, as an ES module with a
  declaration of its API.

To update one, bump its devDependency (Dependabot's `vendored` group opens that PR) and run
`npm run vendor`. `make check-static` runs `npm run vendor -- --check`, which fails when the
directory differs from what the script would write, so a hand edit or a forgotten re-vendor
cannot merge. Format and lint skip it.

**There must be one `@emberx/vendor`.** The renderer, the autotracking registry and every manager
live inside it; two copies mean `@tracked` updates made through one go unseen by the renderer of
the other. Every package depends on the exact version a release stamps; `npm ls @emberx/vendor`
shows the one workspace package.

**`EMBERX_DEBUG` turns the development checks on.** `@glimmer/env`'s `DEBUG` is `false` in every
ember-source build, so the component base class reads `EMBERX_DEBUG` instead: defined as `true`
by an app's bundler (`--define:EMBERX_DEBUG=true`), or set on `globalThis` in a module imported
before `@emberx/component`. Every suite runs with it on: `test/debug.js` is the first thing each
entry point imports.

### What emberx works around in Ember

Each in one place, so an ember-source update that changes it breaks that place alone:

- **Internal imports**, only in `packages/@emberx/component/src/ember-internals.ts`: `Renderer`,
  to render with Glimmer's `serializeBuilder` for `@emberx/ssr` and its `rehydrationBuilder` to
  hydrate, since public `renderComponent` takes no builder; `_resetRenderers`, to forget every
  renderer between tests; and Glimmer's tags, for `@tracked accessor`, since Ember's `tracked` is
  a legacy decorator only. Keep any new internal import there.
- **A root that throws on its first render stays in its renderer**, and every later render
  through the same owner throws again. `renderComponent` renders each owner through a stand-in
  that inherits from it (`renderingOwnerFor`), and `resetRendering()` destroys the stand-ins.

These are what to ask of Ember upstream: a builder option on `renderComponent`, a failed root
removed from its renderer, and a standard-decorator `tracked`. No script rewrites files in
`node_modules`: a dependency that needs a change is vendored through
`scripts/build-emberx-vendor.ts`, or pinned with an `overrides` entry.

## Tests

| Suite   | Command              | Covers                                              |
| ------- | -------------------- | --------------------------------------------------- |
| node    | `make test-node`     | the full suite under node + jsdom, plus @emberx/ssr |
| deno    | `make test-deno`     | the same under Deno                                 |
| browser | `make test-browser`  | the full suite in a real browser                    |
| docs    | `make test-doctests` | the code examples in the READMEs and JSDoc          |

The same tests run in all three: `test/index.ts` is the browser's entry, and `test/node.ts`
imports what it does, plus `@emberx/ssr`'s suite, which needs no browser. jsdom stands in for the
browser under node and Deno, and `test/setup-dom.js` fills in what it lacks; the browser has the
final say on layout, focus and real events. Tests use
[qunitx](https://github.com/izelnakri/qunitx), and [qunitx-cli](https://github.com/izelnakri/qunitx-cli)
runs the browser suite.

`assert.dom()` already looks inside `#ember-testing`: write `assert.dom('p')`, since jsdom's
`element.querySelector` finds nothing for a selector that names the element it is called on.
In the browser, `click('button')` finds QUnit's own toolbar first: give the element a
`data-test-` attribute.

There is no runloop. `settled()` waits for the promises `@action` methods return, router
transitions, the work test waiters mark (`waitForPromise`, `buildWaiter`), and the renders those
cause; an async path a test needs to wait on goes through one of them. `getSettledState()` says
which one a hanging `await settled()` waits on. To look at a page mid-test, `await pauseTest()`
in it and run `qunitx <test file> --open`; `resumeTest()` in the browser console carries on.

Every ` ```ts ` and ` ```js ` block in a README, or in JSDoc under `packages/@emberx/*/src`, runs
in `make test-doctests`, Deno's `deno test --doc` with `test/setup-dom.js` preloaded. Write
examples self-contained, rendering into `document.getElementById('app')` and checking results
with `assert.equal(...)` from `node:assert/strict`; mark a sketch of files a reader would write
` ```ts ignore `.

## Benchmarks

```sh
make bench                          # run and print
make bench-check                    # compare against where this branch left main
make bench-check BENCH_BASE=v0.4.0  # compare against any commit
```

The headline numbers are runtime template compilation, which users pay on page load. The
benchmarks are `Deno.bench` files in `benches/`, run by `scripts/check-benchmarks.ts` as in
qunitx-cli: each file in its own process, and a case that looks regressed re-run up to three
times, keeping the minimum. No baseline is committed, since timings only compare on one machine:
`make bench-check` measures the base commit in a temporary worktree, then your tree, and fails on
a regression beyond `REGRESSION_THRESHOLD` (26%). CI's `bench` job does the same against a PR's
base and fails the run like any other check; `make release` compares against the last release.

A change that is slower on purpose says so in its commit, with a trailer for each benchmark name
or `group/` it slows, which the check then reports as `ACCEPTED`:

```text
refactor!: render with ember-source 7 instead of glimmer.js

…

Benchmark-Regression: render/
BREAKING-CHANGE: …
```

Only the commits after the base it measured count, so later comparisons gate those benchmarks
again. A breaking-change footer goes in the same paragraph, spelled `BREAKING-CHANGE:`, so git
reads the paragraph as trailers.

`*.chrome.bench.ts` files run in Chrome through `Chrome.bench` (`scripts/lib/chrome-bench.js`),
with `Deno.bench`'s signature and output; `CHROME_BENCH_CPU_THROTTLE=4` slows the CPU 4×, roughly
a mid-range phone. They, and cases under 10µs, fail only on a catastrophic regression: a browser's
GC, and at that scale the scheduler, move them more than code does.

## Public API and versions

A package's public API is what it exports, as `test/public-api-test.ts` lists it (and
`@emberx/ssr`'s test for its own), with the behaviour its README and JSDoc describe and the types
its declarations give. A name starting with `_` is exported for emberx's own packages, not for
apps. `@emberx/vendor` is no package of its own to an app: what an app imports from Ember comes
through the packages above.

All seven packages share one version, which `make release` stamps. A change that removes or
renames an export, or changes what one does in a way a caller would notice, is a breaking change:
its commit says so with `!` and a `BREAKING-CHANGE:` trailer, and, while emberx is below 1.0, it
releases as the next minor version (`LEVEL=minor`), from 1.0 the next major. An export added is
a feature, a minor version; a fix, a patch. Changing `test/public-api-test.ts` is how a change
to the API is made on purpose rather than by accident.

An app's routes and components type-check under Deno's `noImplicitOverride`, which
`test/types.ts` keeps true. So the base classes declare no static an app sets, which would need
`override`: `EmberXComponentClass` and `RouteHooks` type them, and a `static {}` block sets their
defaults.

## Releasing

```sh
make release LEVEL=patch   # or minor / major / an explicit x.y.z
```

It runs only on `main`, in sync with `origin/main`, with a clean tree and a `node_modules` that
matches the lockfile (`npm ci` after a pull that changed it): `npm publish` happens before the
release commit, so releasing from anywhere else would publish code `main` never had. It runs the
checks cheapest first: `make check-static`, `make bench-check`, the suites, the doctests, then
`make test-release`. Then it stamps all seven packages to one version, their `@emberx/*` ranges
included, publishes them leaf-first, prepends the release's section to `CHANGELOG.md` with
[git-cliff](https://git-cliff.org), commits, tags and pushes. CI creates the GitHub release from
the tag.

The changelog is built from conventional commit subjects: `feat`, `fix`, `perf`, `refactor`,
`deps` and `docs` appear in it; `build`, `ci`, `test` and `chore` do not.
`npm run changelog:preview` shows what the next release will say.

## Pull requests

- `make check` must pass.
- Keep commits scoped; a dependency change and a behaviour change belong in separate ones.
- If you change what ships, run `make test-release`: it packs every package, installs the
  tarballs into a throwaway project, and runs a consumer test and the node and Deno suites
  against them, catching a missing `files` entry, a wrong `exports` path or an undeclared
  dependency. `make release` runs it too.
