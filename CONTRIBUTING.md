# Contributing to emberx

## Getting set up

```sh
npm ci
make build
make check     # format + lint + typecheck + node, Deno and browser suites + doctests
```

Node 24 or newer is required (`engines.node`, and `volta.node` pins the exact version
used in CI). [Deno](https://docs.deno.com/runtime/getting_started/installation/) 2.9 or newer
is required for `make lint` and `make test-deno` (`engines.deno`). It is not an npm dependency: installed once, it
is shared across projects instead of adding ~90 MB to every clone's `node_modules`. CI and
the Dockerfile pin the exact version (2.9.6); bump the two together. The browser suite needs a Chrome/Chromium binary, discovered from
`CHROME_BIN` or your `PATH`:

```sh
export CHROME_BIN=$(which google-chrome-stable)
```

Run `make` with no arguments for the full target list.

## How the repository is laid out

```
packages/@emberx/       the six published packages
  string/               zero dependencies; Ember's string utils
  helper/               template helpers, with owner services as a third argument
  component/            the Glimmer component layer + runtime template compilation
  router/               routing on top of router_js
  test-helpers/         render/visit/click/settled, no runloop
  ssr/                  server-side rendering
examples/basic          minimal component demo, with its tests in tests/
examples/blog           the integration testbed and de-facto documentation
benches/                Deno.bench and Chrome.bench files; results stay on your machine
scripts/                build, dev server, release, package verification
test/                   entry points (index.html, index.ts, node.ts, setup-dom.js), the blog's
                        E2E tests in e2e/ and their setup in helpers.ts; the package suites
                        live in packages/@emberx/*/test/
```

## How the build works

`scripts/build.js` bundles each package to a single ESM file with esbuild, leaving every
bare specifier external — so `@emberx/router` still _imports_ `@emberx/component` at
runtime instead of inlining a copy. `tsc --emitDeclarationOnly` then emits the `.d.ts`
files, which is the only thing esbuild cannot do.

There is no Babel and no webpack. Relative imports name the file they import, `.ts`
included (`import Route from './route.ts'`), as in qunitx and qunitx-cli, so node and
Deno can load a module without a bundler. `deno lint`'s `no-sloppy-imports` rule enforces
it. The build rewrites those specifiers to `.js` in the emitted declarations, the files a
consumer has.

`scripts/lib/glimmer-compat.js` holds the one upstream workaround that survives:
`@glimmer/compiler` evaluates a bare `require` at import time to build a sha1 template id,
which throws `ReferenceError` in browsers and native ESM. An esbuild plugin replaces that
IIFE in memory with a counter. emberx never uses the upstream id — `create-template.ts`
supplies its own — and the plugin throws loudly if upstream's shape changes rather than
silently shipping a half-patched compiler.

Previously this and three sibling problems were solved by scripts that **rewrote files
inside `node_modules`** before every build. Those are gone. If you find yourself wanting
to patch a dependency on disk, add an esbuild plugin or an `overrides` entry instead.

## Invariants worth knowing

**The Glimmer packages are one version-locked set.** `@glimmer/core@2.0.0-beta.21` pins
its `@glimmer/*` siblings to exactly `0.84.0`. If any of them drifts, npm nests a second
copy of `@glimmer/validator` — and two validator copies means two autotracking registries,
so `@tracked` updates made through one are invisible to the renderer using the other.
Reactivity then breaks in ways that look like random staleness. Dependabot groups these
under `glimmer` and never auto-merges them. Verify a bump with:

```sh
find node_modules -type d -path '*@glimmer/validator'   # expect exactly one
```

**`pretender` is pinned to 3.4.3** via `overrides`. `@memserver/server` — the API mock used
by tests — calls `Pretender.prototype.passthrough`, which pretender moved from the
prototype to the instance in 3.4.4, _inside_ memserver's own `^3.4.3` range. Any unpinned
install therefore fails every memserver-using test in `beforeEach` with "The function you
tried passing to Pretender ... is undefined or missing". Removing the pin requires updating
or replacing memserver first.

**Debug assertions are off by default.** `@glimmer/env` ships `DEBUG = false` and expects a
build plugin to flip it; emberx has no such plugin, so Glimmer's development assertions
have never run here. `packages/@emberx/component/src/glimmer-component.ts` preserves that
default. Turn them on either way, before `@emberx/component` is first imported:

- in an app's own bundler, define `EMBERX_DEBUG` as `true` (esbuild:
  `--define:EMBERX_DEBUG=true`), which also lets it drop the checks when `false`;
- or at runtime, `globalThis.EMBERX_DEBUG = true` in a module imported ahead of
  emberx. It has to be its own module: imports run before the importing file's body.

This repo's build and dev scripts take no such flag. Expect failures when it is on, since
`@emberx/router` constructs `new Route()` with no arguments.

**The component base class is vendored,** in
`packages/@emberx/component/src/glimmer-component.ts`. `@glimmer/component` is published as
an ember-addon, so depending on it also pulls `ember-cli-babel`, `broccoli-*` and
`ember-cli-typescript` — 394 of 423 packages — none of which emberx can use, because it
deliberately has no ember-cli pipeline. The vendored copy is ~60 lines of real code and is
behaviourally identical apart from one documented change: it accepts a function as an
owner, because `@emberx/router`'s `Owner` is a static class.

## Tests

| Suite   | Command              | Covers                                          |
| ------- | -------------------- | ----------------------------------------------- |
| node    | `make test-node`     | string, helper and component under node + jsdom |
| deno    | `make test-deno`     | the same suite under Deno                       |
| browser | `make test-browser`  | everything: routing, rendering, the examples    |
| docs    | `make test-doctests` | the code examples in the READMEs and JSDoc      |

The browser suite is the real one — the router, the renderer and `@emberx/test-helpers`
only run there. Both must pass before a change lands.

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
drift from the code. Write them self-contained: import what they use, and render into
`document.getElementById('app')`, which each example gets fresh. End a statement with
`// => value` to assert what it returns, as `String(statement)`. A multi-file sketch that
imports files a reader would write themselves is marked ` ```ts ignore `.

This is qunitx's `deno test --doc` in spirit, but the examples run under node: Deno compiles
decorators with standard class-field semantics, under which a legacy `@tracked` field is
overwritten by its initializer, and nearly every emberx example uses `@tracked`.

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
the minimum, before it fails. The packages are built first and each file is bundled by
esbuild, so the numbers are for the `dist/` users get.

Timings only compare on one machine, so no baseline is committed. `make bench-check` checks
the base commit out into a temporary worktree, installs and measures it, then measures your
tree (uncommitted changes included), and fails on a regression beyond
`REGRESSION_THRESHOLD` (default 26%). CI's `bench` job does the same against the PR's base,
and `make release` compares against the previous release tag. For a quick manual
before/after, `make bench-update` saves this machine's numbers to `benches/results.json`,
which is gitignored, and `npm run bench:check` compares against it.

Files named `*.chrome.bench.ts` run in Chrome instead, through `Chrome.bench`
(`scripts/lib/chrome-bench.js`): the same signature as `Deno.bench` and the same JSON out, so
they are checked and compared the same way. Neither Chrome nor the DevTools Protocol has a
benchmark harness of its own, so this one warms up, sizes batches, samples and reports, on a
cross-origin-isolated page for 5µs timer precision. They need Chrome: `CHROME_BIN`, or
Playwright's. `CHROME_BENCH_CPU_THROTTLE=4` slows the CPU down 4× through CDP, roughly a
mid-range phone. On this branch they are observational, for the reason in
`benches/render.chrome.bench.ts`.

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
`main` never contained. It then runs `make check` and `make bench-check`, stamps all six
packages to one version (rewriting their intra-`@emberx` ranges to match), publishes them
leaf-first, prepends the new section to `CHANGELOG.md` with [git-cliff](https://git-cliff.org),
commits, tags and pushes. CI creates the GitHub release from the tag.

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
