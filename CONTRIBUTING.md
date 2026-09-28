# Contributing to emberx

## Getting set up

```sh
npm ci
make build
make check     # format + lint + typecheck + node suite + browser suite
```

Node 24 or newer is required (`engines.node`, and `volta.node` pins the exact version
used in CI). [Deno](https://docs.deno.com/runtime/getting_started/installation/) 2.9 or newer
is required for `make lint` (`engines.deno`). It is not an npm dependency: installed once, it
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
examples/basic          minimal component demo
examples/blog           the integration testbed and de-facto documentation
benches/                benchmark suite + committed baseline
scripts/                build, dev server, release, package verification
test/                   entry points only (index.html, index.ts, node.ts, setup-dom.js); the suites
                        themselves live in packages/@emberx/*/test/
```

## How the build works

`scripts/build.js` bundles each package to a single ESM file with esbuild, leaving every
bare specifier external — so `@emberx/router` still _imports_ `@emberx/component` at
runtime instead of inlining a copy. `tsc --emitDeclarationOnly` then emits the `.d.ts`
files, which is the only thing esbuild cannot do.

There is no Babel and no webpack. Relative imports do not need `.js` extensions because
bundling resolves them, which is what `babel-plugin-module-extension-resolver` used to be
for.

`scripts/lib/esbuild-plugins.js` resolves Ember's modules. The Glimmer VM and Ember's
public API ship inside `ember-source` as `ember-source/@glimmer/manager/index.js` and so on,
while its type declarations use the bare names (`@glimmer/manager`, `@ember/renderer`),
which only resolve inside an Embroider build. So the source imports the bare names, which
typecheck, and the plugin rewrites them to the `ember-source/...` paths. The package build
leaves the rewritten path in `dist/`, so consumers need no aliases. The browser suite loads
the same plugin through `package.json#qunitx.plugins`.

Previously this and three sibling problems were solved by scripts that **rewrote files
inside `node_modules`** before every build. Those are gone. If you find yourself wanting
to patch a dependency on disk, add an esbuild plugin or an `overrides` entry instead.

## Invariants worth knowing

**There must be one `ember-source`.** The renderer, the autotracking registry and every
manager live inside it. Two copies mean two registries, and `@tracked` updates made through
one are invisible to the renderer using the other. Every package that needs it declares the
same range, and Dependabot's `ember` group is never auto-merged. Verify a bump with:

```sh
npm ls ember-source   # every entry should be one version, deduped
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
default. Turn them on with `--define:EMBERX_DEBUG=true` — expect failures, since
`@emberx/router` constructs `new Route()` with no arguments.

**The component base class is vendored,** in
`packages/@emberx/component/src/glimmer-component.ts`. `@glimmer/component` is published as
an ember-addon, so depending on it also pulls `ember-cli-babel`, `broccoli-*` and
`ember-cli-typescript` — 394 of 423 packages — none of which emberx can use, because it
deliberately has no ember-cli pipeline. The vendored copy is ~60 lines of real code and is
behaviourally identical apart from one documented change: it accepts a function as an
owner, because `@emberx/router`'s `Owner` is a static class.

## Tests

| Suite   | Command             | Covers                                          |
| ------- | ------------------- | ----------------------------------------------- |
| node    | `make test-node`    | string, helper and component under node + jsdom |
| browser | `make test-browser` | everything, including routing and rendering     |

The browser suite is the real one — the router, the renderer and `@emberx/test-helpers`
only run there. Both must pass before a change lands.

Tests use [qunitx](https://github.com/izelnakri/qunitx) for assertions and
[qunitx-cli](https://github.com/izelnakri/qunitx-cli) as the runner; qunitx-cli bundles
each entry point with esbuild, so TypeScript runs directly with no build step.

There is no runloop. `settled()` awaits the promise queue that `@action` populates, so a
test helper automatically waits for any promise an action returned. If you add an async
path that tests need to wait on, it must flow through that queue.

## Benchmarks

```sh
make bench                          # run and print
make bench-check                    # compare against where this branch left main
make bench-check BENCH_BASE=v0.1.0  # compare against any commit
```

The headline numbers are runtime template compilation: emberx compiles templates in the
browser on first render rather than at build time, so that cost is paid by users on page
load.

Timings only compare on one machine, so no baseline is committed. `make bench-check` checks
the base commit out into a temporary worktree, installs, builds and measures it, then
measures your tree (uncommitted changes included), and fails on a regression beyond
`REGRESSION_THRESHOLD` (default 25%). CI's `bench` job does the same against the PR's
base, and `make release` compares against the previous release tag. For a quick manual
before/after, `make bench-update` saves this machine's numbers to `benches/results.json`,
which is gitignored, and `npm run bench:check` compares against it.

Cases whose sample spread exceeds 25% are reported but never fail the build; at
sub-microsecond scale the harness is measuring the scheduler, not your change.

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
- If you change what ships, `node scripts/verify-package.js` packs every workspace, installs
  the tarballs into a throwaway project and imports them. It catches missing `files`
  entries, wrong `exports` paths and undeclared dependencies — the last of which is how
  `@emberx/router` came to depend on a package that never existed.
