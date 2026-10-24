# @emberx/cli: create, develop, build and test emberx apps

`emberx` makes an [emberx](https://github.com/izelnakri/emberx) app, serves it while you work on
it, builds it for production and runs its tests. It needs no configuration: an app it creates
already follows the conventions it reads.

```sh
emberx new my-app && cd my-app
npm run dev       # http://localhost:4200, rebuilt and reloaded on every change
npm test          # the tests in tests/, in Chrome, with QUnitX
npm run build     # dist/, for production, and its size
npm run serve     # dist/, served as in production
```

## Installation

### Standalone binary

No Node or Deno needed: one binary, with esbuild beside it.

```sh
curl -fsSL https://raw.githubusercontent.com/izelnakri/emberx/main/install.sh | sh
export PATH="$HOME/.emberx/bin:$PATH"   # add this to your shell profile
```

In an Alpine container, which has wget but no curl:

```dockerfile
FROM alpine:3.22
RUN wget -qO- https://raw.githubusercontent.com/izelnakri/emberx/main/install.sh | sh
ENV PATH="/root/.emberx/bin:$PATH"
```

| Platform | Architecture | Notes                                                  |
| -------- | ------------ | ------------------------------------------------------ |
| Linux    | x64, arm64   | glibc, and musl: Alpine and the containers built on it |
| macOS    | arm64, x64   |                                                        |
| Windows  | x64          | from Git Bash or MSYS2                                 |

Pin a version, or install somewhere else:

```sh
curl -fsSL https://raw.githubusercontent.com/izelnakri/emberx/main/install.sh \
  | VERSION=v0.6.0 INSTALL_DIR=$HOME/.local/bin sh
```

The installer checks each download against the release's SHA256SUMS. On musl, `emberx` is
node's musl build with the CLI and the two libraries node links that bare Alpine lacks, in
`emberx-musl/`, which `emberx` links to.

### npm

Node.js 24 or newer. An app `emberx new` creates has it as a devDependency already, so
`npx emberx` and the npm scripts run that version:

```sh
npm install --save-dev @emberx/cli
npx emberx help
```

Or once, without installing: `npx @emberx/cli new my-app`.

### Deno

Deno 2.9 or newer, from [JSR](https://jsr.io/@izelnakri/emberx-cli):

```sh
deno install --global --allow-all --name emberx jsr:@izelnakri/emberx-cli/cli
```

## Commands

`emberx help` lists them, and `emberx help <command>`, or `emberx <command> --help`, shows one's
options. An unknown command or option exits with 2 and says so. `dev` works on the source, as you
edit it; `serve` serves what `build` built, as production does.

| Command                  | Alias         | What it does                                                     |
| ------------------------ | ------------- | ---------------------------------------------------------------- |
| `new <directory>`        | `n`           | creates an app: routes, a component, their tests                 |
| `generate <kind> <name>` | `g`           | adds a component, route, helper or service, with its test        |
| `dev [entry]`            | `d`           | develops the app: served, rebuilt and reloaded on every change   |
| `build [entry]`          | `b`           | builds the app for production into `dist/`, and reports its size |
| `serve`                  | `s`, `server` | serves the build in `dist/`, as in production                    |
| `test [qunitx options]`  | `t`           | runs the tests in `tests/` with QUnitX                           |
| `upgrade [version]`      | `up`          | upgrades emberx itself                                           |

### `emberx new <directory>`

Creates an app in a new or empty directory, runs `git init`, and installs its dependencies with
the package manager that ran emberx (npm, pnpm, yarn or bun), or npm:

```
my-app/
  index.html                  the page, which loads src/app.ts
  src/app.ts                  starts the router, and renders, or hydrates, the page
  src/router.ts               the routes: / and /about, the second imported on its first visit
  src/routes/index.ts         a page: its title and its template
  src/routes/about.ts
  src/components/counter.ts   a component with tracked state and an action
  tests/components/counter-test.ts
  tests/routes/index-test.ts
  tsconfig.json, .gitignore, README.md, package.json
```

| Option                     | What it does                                                            |
| -------------------------- | ----------------------------------------------------------------------- |
| `--ssr`                    | also `src/server.ts`, which renders each page that the browser hydrates |
| `--package-manager <name>` | npm, pnpm, yarn or bun                                                  |
| `--skip-install`           | does not install the dependencies                                       |
| `--skip-git`               | does not run `git init`                                                 |

### `emberx generate <kind> <name>`

Adds a module and its test, from wherever in the app you run it:

| Kind        | Writes                                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| `component` | `src/components/<name>.ts`, and a rendering test                                                           |
| `route`     | `src/routes/<name>.ts`, an application test, and the route in `src/router.ts`, imported on its first visit |
| `helper`    | `src/helpers/<name>.ts`, and a rendering test                                                              |
| `service`   | `src/services/<name>.ts`, and a unit test                                                                  |

A name is lowercase words with dashes, with a folder before a slash: `user-card`,
`forms/text-input`. `--path` gives a route its URL, `/<name>` otherwise, and `--force` writes
over files that exist, which it refuses to otherwise.

```sh
emberx g component user-card
emberx g route posts/post --path /posts/:post_id
```

### `emberx dev [entry]`

Serves the app on http://localhost:4200, rebuilt as you edit it, and reloads the browser after each
rebuild; a build that fails is reported in the terminal and the browser's console, and the last one
that did not keeps being served. Templates compile in the browser, as they do with no build, and
the development checks (`EMBERX_DEBUG`) are on. Every path without a file extension gets
`index.html`, so the router routes it, and `public/` and the app's own files are served as they are.

`--ssr` renders each page on the server too, as production does, with `src/server.ts`'s
`render()`, which is rebuilt with the browser's bundle: the browser hydrates the page, as it does
in production. `--port` (or `PORT`) and `--host` change where it listens.

### `emberx build [entry]`

Builds the app for production into `dist/`:

```
dist/
  index.html                 the page, loading the bundle, its chunks preloaded
  assets/app-[hash].js       the bundle: hashed names, to cache forever
  assets/chunks/*-[hash].js  what it shares, each route imported on its first visit, the template compiler
  ...                        public/, copied as it is
```

and prints what it wrote, and what a first page load downloads of it:

```
                                                  minified      gzip    brotli
  dist/assets/chunks/chunk-TX3HWC54.js            116.2 kB   37.8 kB   33.7 kB
  dist/assets/chunks/chunk-YZQEVLCN.js             56.7 kB   19.2 kB   16.9 kB
  dist/assets/app-IFEDA4OP.js                       1.6 kB    0.8 kB    0.7 kB
  (lazy) dist/assets/chunks/runtime-F4K5BRHB.js   187.9 kB   53.8 kB   46.6 kB
  (lazy) dist/assets/chunks/about-Q2WPNJMZ.js       0.5 kB    0.4 kB    0.3 kB
first page load                                   174.5 kB   57.8 kB   51.3 kB
```

By default each template is compiled at build time, so the browser never downloads Ember's
template compiler, nor evaluates template code (no `'unsafe-eval'` in a Content Security Policy);
the code is split, so each route given as `() => import(...)` is a chunk of its own; it is minified;
and router_js gets native promises rather than rsvp. An app of one component downloads 36 kB
gzip on its first load.

| Option            | What it does                                                        |
| ----------------- | ------------------------------------------------------------------- |
| `-o, --outdir`    | where to build, `dist` otherwise                                    |
| `--base <path>`   | the path the app is served under: `--base /admin/`                  |
| `--ssr`           | also bundles `src/server.ts` into `dist/server/server.js`, for node |
| `--analyze`       | lists the largest modules of the first page load                    |
| `--sourcemap`     | writes source maps                                                  |
| `--no-precompile` | compiles templates in the browser, as `emberx dev` does             |
| `--no-split`      | one bundle, with the template compiler and every route in it        |
| `--no-minify`     | leaves the code readable                                            |
| `--rsvp`          | bundles rsvp for router_js, rather than native promises             |

### `emberx serve`

Serves the build on http://localhost:4300 as production serves it: `dist/`'s files, those in
`dist/assets/` cached forever as their names change with their contents, and `index.html` for
every other path without a file extension. A build with `--ssr` renders each page with
`dist/server/server.js`'s `render()`, and its status; `dist/server/` itself is never served.
`--port`, `--host`, `--outdir` and `--base` take what they do for `dev` and `build`.

### `emberx test [qunitx options]`

Runs the tests with [qunitx-cli](https://github.com/izelnakri/qunitx-cli): the files and folders
given, or `tests/`. Every option is qunitx-cli's, passed on as it is:

```sh
emberx test --watch
emberx test tests/routes --browser=firefox
```

### `emberx upgrade [version]`

Upgrades emberx to the version given, or the latest. The standalone binary downloads the release,
checks its sha256, and replaces itself; installed with Deno, it reinstalls from JSR; installed with
npm, it prints the `npm install` that moves the project's `@emberx` packages together, as they
share a version. `--check` only reports, and exits 1 when a newer version exists.

## Server-side rendering

`emberx new my-app --ssr` adds `src/server.ts`, which exports `render(url, baseHTML)`: the
document for a URL, the page rendered with `@emberx/ssr` into `index.html`, with the status it
should answer with, a 404 for a URL no route matches. The browser hydrates the page, and takes the
models the server left in it rather than fetching them again.

`emberx dev --ssr` and `emberx serve` render each page with it. Run on its own, the file is a
node server too, which serves `dist/` and renders every other URL: yours to change, or to replace
with another server that calls `render()`.

```sh
npm run dev       # emberx dev --ssr
npm run build     # emberx build --ssr
npm run serve     # emberx serve, rendering with dist/server/server.js
npm start         # node dist/server/server.js, on PORT or 3000, without emberx
```

## Configuration

Nothing needs configuring. Where an app differs from what `emberx new` creates, its package.json
says so, under `"emberx"`; each field is optional:

```json
{
  "emberx": {
    "entry": "src/app.ts",
    "html": "index.html",
    "public": "public",
    "outdir": "dist",
    "server": "src/server.ts",
    "port": 4200
  }
}
```

Without an `entry`, `emberx` takes the first of `src/app.ts`, `src/main.ts` and `src/index.ts`
that exists.

| Environment variable  | What it does                                                        |
| --------------------- | ------------------------------------------------------------------- |
| `PORT`                | the port of `emberx dev`, `emberx serve` and the `--ssr` server     |
| `ESBUILD_BINARY_PATH` | the esbuild binary to run, instead of the one installed with emberx |
| `EMBERX_RELEASES_URL` | a mirror of the GitHub releases, for `emberx upgrade`               |

## A build of your own

What `emberx build` runs is a module of its own, for a build script:

```ts ignore
import { buildApp, formatReport } from '@emberx/cli';

const { files } = await buildApp({ entryPoints: { app: 'src/app.ts' }, outdir: 'dist/assets' });
console.log(formatReport(files));
```

`precompilePlugin()` is the esbuild plugin that compiles templates at build time, for an esbuild
build that is not `emberx build`.
