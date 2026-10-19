# Contributing to emberx

## Getting set up

```sh
npm ci
make check     # format + lint + typecheck + node, Deno and browser suites + doctests
```

Nothing needs building first: every suite, the dev server and the benchmarks run from the
package sources (see "Running from the sources" below).

Node 24 or newer is required (`engines.node`, and `volta.node` pins the exact version
used in CI). [Deno](https://docs.deno.com/runtime/getting_started/installation/) 2.9 or newer
is required for linting, the Deno suite, the doctests and the benchmarks
(`engines.deno`). It is not an npm dependency: installed once, it
is shared across projects instead of adding ~90 MB to every clone's `node_modules`. CI and
the Dockerfile pin the exact version (2.9.7); bump the two together. The browser suite needs a Chrome/Chromium binary, discovered from
`CHROME_BIN` or your `PATH`:

```sh
export CHROME_BIN=$(which google-chrome-stable)
```

Run `make` with no arguments for the full target list.

## How the repository is laid out

```
packages/@emberx/       the seven published packages
  vendor/               ember-source, @glimmer/component and location-bar, as emberx uses
                        them; written by scripts/build-emberx-vendor.ts, never by hand
  string/               zero dependencies; Ember's string utils
  helper/               template helpers, with owner services as a third argument
  component/            the Glimmer component layer + runtime template compilation
  router/               routing on top of router_js
  test-helpers/         render/visit/click/settled, no runloop
  ssr/                  server-side rendering
examples/basic          minimal component demo, with its tests in tests/
examples/blog           the integration testbed and de-facto documentation
benches/                Deno.bench and Chrome.bench files; results stay on your machine
build.ts                the package build: dist/ and the .d.ts files, as in qunitx
scripts/                release, vendoring, test runners, package verification
test/                   entry points (index.html, index.ts, node.ts, setup-dom.js), the blog's
                        E2E tests in e2e/ and their setup in helpers.ts; the package suites
                        live in packages/@emberx/*/test/
```

`build.ts` and every script in `scripts/` are TypeScript run by Deno, as in qunitx and
qunitx-cli: the build, the release, the vendoring, the benchmarks and the Deno suite. Two exceptions: `scripts/register.ts` is node's own loader for the sources (below),
and `scripts/test-release.sh` stays bash, since it drives `npm pack` and `npm install`, then
runs `scripts/release-consumer-test.ts` in the throwaway project it installs the tarballs
into. The helpers in `scripts/lib/` are plain JavaScript modules that both runtimes import.

## How the build works

`build.ts` bundles each package to a single ESM file with esbuild, leaving every
bare specifier external — so `@emberx/router` still _imports_ `@emberx/component` at
runtime instead of inlining a copy. TypeScript 7's `tsc`, a native binary, then emits the
`.d.ts` files in one run, which is the only thing esbuild cannot do.

There is no Babel and no webpack. Relative imports name the file they import, `.ts`
included (`import Route from './route.ts'`), as in qunitx and qunitx-cli, so node and
Deno can load a module without a bundler. `deno lint`'s `no-sloppy-imports` rule enforces
it. The build rewrites those specifiers to `.js` in the emitted declarations, the files a
consumer has.

Ember's modules come from `@emberx/vendor`: `import { tracked } from
'@emberx/vendor/@glimmer/tracking'`. `ember-source` ships the Glimmer VM and Ember's API as
files (`ember-source/@glimmer/manager/index.js`) whose types it declares under bare names
(`@glimmer/manager`) that only an Embroider build resolves. `@emberx/vendor` holds the
modules emberx uses as plain package exports, with their types, so node, Deno, esbuild,
TypeScript and every consumer resolve them with nothing in between (see "Vendored code"
below).

Two internal exports of Ember's are imported, where nothing public does the job (ROADMAP.md
#1 and #4), and both only in `packages/@emberx/component/src/ember-internals.ts`:
`_resetRenderers`, which forgets every renderer between tests, and `Renderer`, which renders
with Glimmer's `serializeBuilder` for `@emberx/ssr` and its `rehydrationBuilder` to hydrate.
An ember-source update that moves either breaks that file alone. Keep any new internal
import there.

Previously such problems were solved by scripts that **rewrote files inside
`node_modules`** before every build. Those are gone. If you find yourself wanting to patch a
dependency on disk, vendor it through `scripts/build-emberx-vendor.ts`, or add an `overrides` entry.

## Invariants worth knowing

**There must be one `@emberx/vendor`.** The renderer, the autotracking registry and every
manager live inside it. Two copies mean two registries, and `@tracked` updates made through
one are invisible to the renderer using the other. Every package that needs it depends on
the exact version a release stamps, and `ember-source` itself is only a devDependency of the
repo, the source `scripts/build-emberx-vendor.ts` copies from. Verify with:

```sh
npm ls @emberx/vendor   # every entry should be the one workspace package
```

**Debug assertions are off by default.** `@glimmer/env` ships `DEBUG = false` and expects a
build plugin to flip it; emberx has no such plugin, so Glimmer's development assertions
have never run here. The component base class (below) checks `EMBERX_DEBUG` instead. Turn
its checks on either way, before `@emberx/component` is first imported:

- in an app's own bundler, define `EMBERX_DEBUG` as `true` (esbuild:
  `--define:EMBERX_DEBUG=true`), which also lets it drop the checks when `false`;
- or at runtime, `globalThis.EMBERX_DEBUG = true` in a module imported ahead of
  emberx. It has to be its own module: imports run before the importing file's body.

This repo's build and dev scripts take no such flag. Expect failures when it is on, since
`@emberx/router` constructs `new Route()` with no arguments.

**Vendored code is written by a script.** `npm run vendor` (`scripts/build-emberx-vendor.ts`) writes
`@emberx/vendor` (`packages/@emberx/vendor/`) from the versions `package.json` pins as exact
devDependencies, laid out as each upstream package publishes its files:

- `ember-source` → `@ember/…`, `@glimmer/…`, `shared-chunks/…`: the modules emberx imports,
  found by reading every `@emberx/vendor/…` import under `packages/@emberx/*/src`, and every
  file they reach, from ember-source's `dist/prod/packages`; with the type declarations
  ember-source has for them (`types/`) and one declaration per module beside its
  JavaScript. A new import of an Ember module is one `npm run vendor` away. None of
  ember-source's 17 dependencies, which only its ember-cli hooks and blueprints use, is
  installed by a consumer.
- `@glimmer/component` → `@glimmer/component/`: the base class Ember apps use, published from
  ember.js, its imports pointed at the modules above. Two changes, marked `emberx:` in the
  file: its checks follow `EMBERX_DEBUG` (above), and an owner may be a function, as
  `@emberx/router`'s static `Owner` is.
- `location-bar` → `location-bar/location-bar.js`: Backbone's history handling, published
  in 2016 as a UMD script, turned into an ES module.

The script writes the package's `exports` and its `LICENSE` (the upstream licenses) too.
To update a vendored package, bump its devDependency (Dependabot's `vendored` group opens
that PR, and never auto-merges) and run `npm run vendor`. `make check-static` runs
`npm run vendor -- --check`, which fails when `packages/@emberx/vendor/` differs from what
the script would write, so a hand edit or a forgotten re-vendor cannot merge. Format and
lint skip it.

## Running from the sources

In the repo, each package's `exports` point at its source:

```json
"exports": { ".": "./src/index.ts" }
```

So every tool resolves `@emberx/router` to `packages/@emberx/router/src/` as it is: esbuild
(the browser suite, `npm run dev`, the benchmarks, the Deno suite, the doctests),
TypeScript, and node, where `scripts/register.ts` compiles the decorators that node's
type stripping rejects. Nothing is built but a
release, and CI's test jobs run with no `dist/`, so a change that needs one fails there.

`make build` makes each package's `dist/` a package of its own: the bundle, its
declarations, the README and LICENSE, and a `package.json` whose `exports` point at them.
`npm publish` and `npm pack` are given that directory (`make release`, `make test-release`),
and `@emberx/vendor` as it is, so a consumer installs `dist/` and never `src/`.

Deno runs the sources as they are, decorators included, since emberx's decorators are
standard ones: `npm run test:deno` is `deno test` on the same entry the node suite runs.

## Tests

| Suite   | Command              | Covers                                              |
| ------- | -------------------- | --------------------------------------------------- |
| node    | `make test-node`     | the full suite under node + jsdom, plus @emberx/ssr |
| deno    | `make test-deno`     | the same under Deno                                 |
| browser | `make test-browser`  | the full suite in a real browser                    |
| docs    | `make test-doctests` | the code examples in the READMEs and JSDoc          |

The same tests run in all three: `test/index.ts` is the browser's entry, and `test/node.ts`
imports what it does, plus `@emberx/ssr`'s suite, which needs no browser. The browser has
the final say on layout, focus and real events; jsdom stands in for it elsewhere, and
`test/setup-dom.js` fills in what jsdom lacks. All of them must pass before a change lands.

`assert.dom()` already looks inside `#ember-testing`, so write `assert.dom('p')`, not
`assert.dom('#ember-testing p')`: jsdom's `element.querySelector` finds nothing for a
selector that names the element it is called on, though browsers do.

Tests use [qunitx](https://github.com/izelnakri/qunitx) for assertions and
[qunitx-cli](https://github.com/izelnakri/qunitx-cli) as the runner; qunitx-cli bundles
each entry point with esbuild, so TypeScript runs directly with no build step.

There is no runloop. `settled()` awaits the promise queue that `@action` populates and any
router transition under way, then the render they caused, so a test helper automatically
waits for both. If you add an async path that tests need to wait on, it must flow through
one of them. `getSettledState()` says which one a hanging `await settled()` is waiting on.

To look at a test's page mid-test, `await pauseTest()` in it and run it in a visible
browser, `qunitx <test file> --open`; `resumeTest()` in the browser console carries on.

### Documentation examples

Every ` ```ts ` and ` ```js ` block in a README or in a JSDoc comment under
`packages/@emberx/*/src` runs in `make test-doctests` (and `make check`), so examples cannot
drift from the code. That is Deno's own `deno test --doc`, as in qunitx, with
`test/setup-dom.js` preloaded for a DOM. Write examples self-contained: import what they
use, and render into `document.getElementById('app')`, which the DOM has. Check a result
with `assert.equal(...)`, from `import assert from 'node:assert/strict'`, so a reader sees
both what runs and what it gives. A multi-file sketch that imports files a reader would write
themselves is marked ` ```ts ignore `.

Deno gives each file its own isolate, each loading jsdom and Ember again, so the examples run
with `--parallel`.

## Benchmarks

```sh
make bench                          # run and print
make bench-check                    # compare against where this branch left main
make bench-check BENCH_BASE=v0.1.0  # compare against any commit
```

The headline numbers are runtime template compilation: emberx compiles templates in the
browser on first render rather than at build time, so that cost is paid by users on page
load.

The benchmarks are `Deno.bench` files in `benches/`, run and checked by
`scripts/check-benchmarks.ts`, the same setup as qunitx-cli: each file runs in its own
`deno bench` process, and a case that looks regressed is re-run up to three times, keeping
the minimum, before it fails. Each file is bundled by esbuild from the
package sources, as the build bundles `dist/`.

Timings only compare on one machine, so no baseline is committed. `make bench-check` checks
the base commit out into a temporary worktree, installs and measures it, then measures your
tree (uncommitted changes included), and fails on a regression beyond
`REGRESSION_THRESHOLD` (default 26%). CI's `bench` job does the same against the PR's base,
and `make release` compares against the previous release tag. For a quick manual
before/after, `make bench-update` saves this machine's numbers to `benches/results.json`,
which is gitignored, and `npm run bench:check` compares against it.

When a change is slower on purpose, say so in its commit, with a trailer for each benchmark
name or `group/` it slows down:

```text
refactor!: render with ember-source 7 instead of glimmer.js

…

Benchmark-Regression: render/
Benchmark-Regression: template-compilation/createTemplate
```

The check reports those as `ACCEPTED` instead of failing. It reads only the commits after
the base it measured, so the trailer covers the PR and the release that ship the change,
and later comparisons gate those benchmarks again from the new numbers. A `BREAKING CHANGE`
footer goes in the same last paragraph, spelled `BREAKING-CHANGE:` (a form conventional
commits also accepts), so git reads the paragraph as trailers.

Files named `*.chrome.bench.ts` run in Chrome instead, through `Chrome.bench`
(`scripts/lib/chrome-bench.js`): the same signature as `Deno.bench` and the same JSON out, so
they are checked and compared the same way. Neither Chrome nor the DevTools Protocol has a
benchmark harness of its own, so this one warms up, sizes batches, samples and reports, on a
cross-origin-isolated page for 5µs timer precision. They need Chrome, found as the browser suite
finds it: `CHROME_BIN`, else a Chrome on your `PATH`, else Playwright's.
`CHROME_BENCH_CPU_THROTTLE=4` slows the CPU down 4× through CDP, roughly a mid-range phone.
They are observational: a browser's GC and scheduling still move them by 30% between runs now
and then, so they fail only on a catastrophic regression.

Cases under 10µs (the string transforms and helpers) are reported but only fail on a
catastrophic regression, ten times the threshold: at that scale the scheduler moves the
numbers more than code does. qunitx-cli draws that line at 1ms; emberx's headline cost,
template compilation, runs 40µs–10ms and has to stay gated.

## Releasing

```sh
make release LEVEL=patch   # or minor / major / an explicit x.y.z
```

This only runs on `main`, in sync with `origin/main` and with a clean tree — `npm publish`
happens before the release commit, so releasing from any other branch would publish code
`main` never contained. It then runs the checks cheapest first, as qunitx and qunitx-cli do:
`make check-static`, `make bench-check`, the suites, then `make test-release`. Then it stamps
all seven packages to one version (rewriting their intra-`@emberx` ranges to match, which
`npm version --workspaces` does not), publishes them leaf-first, prepends the new section to
`CHANGELOG.md` with [git-cliff](https://git-cliff.org), commits, tags and pushes. CI creates the GitHub release from the tag.

The changelog is built from conventional commit subjects: `feat`, `fix`, `perf`,
`refactor`, `deps` and `docs` appear in it; `build`, `ci`, `test` and `chore` do not.
`npm run changelog:preview` shows what the next release will say.

## Pull requests

- `make check` must pass.
- Keep commits scoped; a dependency change and a behaviour change belong in separate ones.
- If you change what ships, run `make test-release`. It packs every workspace, installs the
  tarballs into a throwaway project, and runs a consumer smoke test and the node suite
  against them. It catches missing `files` entries, wrong `exports` paths and undeclared
  dependencies — the last of which is how `@emberx/router` came to depend on a package that
  never existed. `make release` runs it too.
