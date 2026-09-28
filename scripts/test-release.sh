#!/usr/bin/env bash
# Packs every @emberx package, installs the tarballs into a throwaway consumer
# directory, and tests what got installed rather than the checkout.
#
# Two checks run against the installed packages:
#   - scripts/release-consumer-test.ts, what an npm user does first: import each
#     package, render a component, render one to a string;
#   - the node suite (test/node.ts), bundled with @emberx/* and ember-source
#     resolved from the consumer's node_modules instead of the workspace.
# Both run under node, then under Deno.
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

PACKAGES=(string helper component router test-helpers ssr)

# ── Build and pack ──────────────────────────────────────────────────────────
cd "$ROOT"
npm run build
for package in "${PACKAGES[@]}"; do
  npm pack --workspace="@emberx/$package" --pack-destination "$CONSUMER" --quiet > /dev/null
done

# ── Install into a clean consumer ───────────────────────────────────────────
# All six tarballs in one install, so their exact @emberx/* ranges resolve to
# each other rather than to older versions on the registry. jsdom gives the
# consumer test a DOM; it is the version the repo itself tests with.
cd "$CONSUMER"
printf '{"name":"emberx-consumer","private":true,"type":"module"}' > package.json
JSDOM_VERSION=$(node -p "require('$ROOT/node_modules/jsdom/package.json').version")
npm install --no-audit --no-fund --loglevel=error ./*.tgz "jsdom@$JSDOM_VERSION"
cp "$ROOT/scripts/release-consumer-test.ts" .

# ── Node ────────────────────────────────────────────────────────────────────
echo "test-release: node (consumer)"
node --test release-consumer-test.ts
echo "test-release: node (full suite against the installed packages)"
node "$ROOT/scripts/test-node.ts" --packages-from="$CONSUMER"

# ── Deno ────────────────────────────────────────────────────────────────────
echo "test-release: deno (consumer)"
deno test --no-check --allow-read --allow-env release-consumer-test.ts
echo "test-release: deno (full suite against the installed packages)"
deno run -A "$ROOT/scripts/test-deno.ts" --packages-from="$CONSUMER"
