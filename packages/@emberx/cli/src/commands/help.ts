/**
 * `emberx help [command]`: what each command does, and its options.
 */
import { VERSION } from '../version.ts';

const OVERVIEW = `emberx ${VERSION}: create, develop, build and test emberx apps

Usage: emberx <command> [options]

Commands:
  new <directory>            Create an app: routes, a component, their tests
  generate <kind> <name>     Add a component, route, helper or service, with its test   (g)
  dev [entry]                Serve the app, rebuilt and reloaded on every change      (serve, s)
  build [entry]              Build the app for production into dist/, and its size    (b)
  test [qunitx options]      Run the tests in tests/ with QUnitX                      (t)
  upgrade [version]          Upgrade emberx itself
  help [command]             Show a command's options

Options:
  -h, --help                 Show help
  -v, --version              Show emberx's version

Get started:
  emberx new my-app && cd my-app && npm run dev

https://github.com/izelnakri/emberx/tree/main/packages/@emberx/cli`;

const COMMANDS: Record<string, string> = {
  new: `Usage: emberx new <directory> [options]

Creates an app in <directory>, which must be new or empty: a router with two routes, a component,
tests for them, a tsconfig.json and a README. Then runs git init and installs its dependencies.

Options:
  --ssr                      Also a server, src/server.ts, that renders each page, which the
                             browser hydrates: \`npm run build && npm start\`
  --package-manager <name>   npm, pnpm, yarn or bun (default: the one running emberx, or npm)
  --skip-install             Do not install the dependencies
  --skip-git                 Do not run git init

Examples:
  emberx new my-app
  emberx new blog --ssr --package-manager pnpm`,

  generate: `Usage: emberx generate <kind> <name> [options]       (alias: g)

Adds a module to the app, and its test:

  component <name>           src/components/<name>.ts, and a rendering test
  route <name>               src/routes/<name>.ts, an application test, and the route in
                             src/router.ts, imported when it is first visited
  helper <name>              src/helpers/<name>.ts, and a rendering test
  service <name>             src/services/<name>.ts, and a unit test

<name> is lowercase words with dashes, a folder before a slash: user-card, forms/text-input.

Options:
  --path <url>               A route's URL (default: /<name>): /posts/:post_id
  -f, --force                Write over files that exist

Examples:
  emberx g component user-card
  emberx g route posts/post --path /posts/:post_id`,

  dev: `Usage: emberx dev [entry] [options]                  (aliases: serve, s)

Serves the app, rebuilt as you edit it, and reloads the browser after each rebuild. Templates
compile in the browser and the development checks (EMBERX_DEBUG) are on. Every path without a
file extension gets index.html, so the router routes it.

[entry] is the browser's entry module (default: package.json's "emberx": { "entry" }, or
src/app.ts). public/ and the app's own files are served as they are.

Options:
  -p, --port <number>        The port (default: PORT, package.json's "emberx": { "port" }, or 4200)
  --host <name>              The host to listen on (default: localhost)`,

  build: `Usage: emberx build [entry] [options]                (alias: b)

Builds the app for production into dist/: index.html loading the bundle, the bundle in
dist/assets/ with content-hashed names to cache forever, and public/ copied as it is. Prints each
file's size, minified, gzip and brotli, and what the first page load downloads.

By default, each template is compiled at build time, so Ember's template compiler is never
downloaded; the code is split, so each route imported when it is first visited is a chunk of
its own; and router_js gets native promises rather than rsvp.

Options:
  -o, --outdir <dir>         Where to build (default: package.json's "emberx": { "outdir" }, or dist)
  --base <path>              The path the app is served under (default: /): /admin/
  --ssr                      Also bundle src/server.ts into dist/server/server.js, for node
  --analyze                  List the largest modules of the first page load
  --sourcemap                Write source maps
  --no-precompile            Compile templates in the browser, as \`emberx dev\` does
  --no-split                 One bundle, the template compiler and every route in it
  --no-minify                Leave the code readable
  --rsvp                     Bundle rsvp for router_js, rather than native promises`,

  test: `Usage: emberx test [qunitx options]                  (alias: t)

Runs the tests with qunitx-cli: the files and folders given, or tests/. Every option is
qunitx-cli's, passed on as it is: \`npx qunitx --help\` lists them.

Examples:
  emberx test
  emberx test --watch
  emberx test tests/routes --browser=firefox`,

  upgrade: `Usage: emberx upgrade [version] [options]

Upgrades emberx to [version], or the latest. The standalone binary replaces itself, its sha256
checked; installed with Deno, it reinstalls from JSR; installed with npm, it prints the command
that upgrades the project's @emberx packages together.

Options:
  --check                    Only report whether a newer version exists: exits 1 when it does`,
};

export async function run([command]: string[] = []): Promise<number> {
  const aliases: Record<string, string> = { g: 'generate', s: 'dev', serve: 'dev', b: 'build', t: 'test' };
  const text = command ? COMMANDS[aliases[command] ?? command] : OVERVIEW;
  if (!text) {
    console.error(`emberx: there is no "${command}" command.\n\n${OVERVIEW}`);
    return 2;
  }

  console.log(text);
  return 0;
}
