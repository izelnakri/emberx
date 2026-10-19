#!/usr/bin/env bash
# Packs every @emberx package, installs the tarballs into a throwaway consumer
# directory, and tests what got installed rather than the checkout.
#
# Three checks run against the installed packages:
#   - TypeScript, on a consumer file that uses each package's types: the
#     declarations in dist/ resolve, vendored ones included, and none of them
#     silently degrades to `any`;
#   - scripts/release-consumer-test.ts, what an npm user does first: import each
#     package, render a component, render one to a string;
#   - the node suite (test/node.ts), with @emberx/* and ember-source resolved
#     from the consumer's node_modules instead of the workspace.
# The last two run under node, then under Deno.
#
# Source tests cannot see packaging mistakes: a `files` entry that omits dist/,
# an `exports` path that does not exist, or a dependency used at runtime but only
# declared at the root. That last one is how @emberx/router imported
# @emberx/component for years while depending on @emberx/route, a package that
# never existed.
#
# Usage: bash scripts/test-release.sh   (from the repo root; builds dist/ first)
set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
CONSUMER=$(mktemp -d)
trap 'rm -rf "$CONSUMER"' EXIT

PACKAGES=(vendor string helper component router test-helpers ssr)

# ── Build and pack ──────────────────────────────────────────────────────────
cd "$ROOT"
npm run build
# What a release publishes: each package's dist/, which the build gives its own
# package.json, and @emberx/vendor as it is (build.ts, publishedDirectory).
# One npm pack for all of them: npm's startup is most of what each pack costs.
DIRECTORIES=()
for package in "${PACKAGES[@]}"; do
  directory="$ROOT/packages/@emberx/$package/dist"
  [ "$package" = vendor ] && directory="$ROOT/packages/@emberx/vendor"
  DIRECTORIES+=("$directory")
done
npm pack "${DIRECTORIES[@]}" --pack-destination "$CONSUMER" --quiet > /dev/null

# ── Install into a clean consumer ───────────────────────────────────────────
# All six tarballs in one install, so their exact @emberx/* ranges resolve to
# each other rather than to older versions on the registry. jsdom gives the
# consumer test a DOM; it is the version the repo itself tests with.
cd "$CONSUMER"
printf '{"name":"emberx-consumer","private":true,"type":"module"}' > package.json
JSDOM_VERSION=$(node -p "require('$ROOT/node_modules/jsdom/package.json').version")
TYPESCRIPT_VERSION=$(node -p "require('$ROOT/node_modules/typescript/package.json').version")
npm install --no-audit --no-fund --loglevel=error ./*.tgz "jsdom@$JSDOM_VERSION" "typescript@$TYPESCRIPT_VERSION"
cp "$ROOT/scripts/release-consumer-test.ts" .

# ── Types ───────────────────────────────────────────────────────────────────
# skipLibCheck, as consumers have it, turns an unresolved import inside a
# declaration into `any` rather than an error. So each @ts-expect-error below
# also fails the check if the type it tests has become `any`.
echo "test-release: types"
cat > consumer-types.ts <<'TS'
import Component, { hbs, tracked } from '@emberx/component';
import Router, { Route } from '@emberx/router';
import { camelize } from '@emberx/string';
import { eq } from '@emberx/helper';
import { renderToString } from '@emberx/ssr';
import { render, settled } from '@emberx/test-helpers';
import { precompileTemplates } from '@emberx/component/precompile';

class Greeting extends Component<{ name: string }> {
  static template = hbs`<p>{{this.shout}}</p>`;
  @tracked accessor count = 0;
  get shout(): string {
    return this.args.name.toUpperCase();
  }
}
class HomeRoute extends Route {}

const shout: string = new Greeting({}, { name: 'emberx' }).shout;
// @ts-expect-error: args.name is a string
const notANumber: number = new Greeting({}, { name: 'emberx' }).args.name;
// @ts-expect-error: camelize returns a string
const alsoNotANumber: number = camelize('ember-x');
const html: Promise<string> = renderToString(Greeting, { args: { name: 'emberx' } });
// @ts-expect-error: Router.start takes route definitions
Router.start(42);
const precompiled: string = precompileTemplates('static template = hbs`<p></p>`;');

export { shout, notANumber, alsoNotANumber, html, eq, render, settled, HomeRoute, precompiled };
TS
npx tsc --noEmit --strict --skipLibCheck --target es2022 \
  --module nodenext --moduleResolution nodenext consumer-types.ts

# ── Node ────────────────────────────────────────────────────────────────────
echo "test-release: node (consumer)"
node --test release-consumer-test.ts
echo "test-release: node (full suite against the installed packages)"
EMBERX_PACKAGES_FROM="$CONSUMER" node --import "$ROOT/scripts/register.ts" --import "$ROOT/test/setup-dom.js" \
  --test "$ROOT/test/node.ts"

# ── Deno ────────────────────────────────────────────────────────────────────
echo "test-release: deno (consumer)"
deno test --no-check --allow-read --allow-env release-consumer-test.ts
echo "test-release: deno (full suite against the installed packages)"
# Each @emberx/* entry point the suite imports, `@emberx/component/precompile`
# included, maps to its installed copy, by that package's exports; inside them,
# @emberx/* resolves from the consumer's node_modules as it would for a user.
node -e '
  const { readFileSync, writeFileSync } = require("fs");
  const imports = process.argv.slice(2).flatMap((name) =>
    Object.entries(JSON.parse(readFileSync(`node_modules/@emberx/${name}/package.json`, "utf8")).exports).map(
      ([subpath, { default: file }]) => [`@emberx/${name}${subpath.slice(1)}`, `./node_modules/@emberx/${name}/${file.slice(2)}`],
    ),
  );
  writeFileSync("import-map.json", JSON.stringify({ imports: Object.fromEntries(imports) }));
' string helper component router test-helpers ssr
(cd "$ROOT" && deno test --no-check --allow-read --allow-env --import-map="$CONSUMER/import-map.json" \
  --preload test/setup-dom.js test/node.ts)
