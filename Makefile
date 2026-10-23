.DEFAULT_GOAL := help

LEVEL ?= patch
REGRESSION_THRESHOLD ?= 26
BENCH_BASE ?=

.PHONY: bench bench-check bench-print bench-update build check check-static clean coverage \
        dev docs jsr-check site docker-build docker-test fix fmt format help install lint release setup test test-all-browsers \
        test-browser test-browser-dev test-chrome test-firefox test-deno test-doctests test-node test-release test-webkit typecheck \
        vendor vendor-check

# ── Build ─────────────────────────────────────────────────────────────────────

# Bundles each @emberx package to dist/ with esbuild, then emits .d.ts with tsc.
# Only publishing needs it (make test-release, make release): everything else
# runs from the sources.
build:
	npm run build

clean:
	npm run clean

# ── Develop ───────────────────────────────────────────────────────────────────

# Serves examples/blog at http://localhost:1234, esbuild rebuilding on change, from the
# sources: no build first. `npm run dev -- --serve=4000` picks another port.
# The basic example is at http://localhost:1234/basic.html.
dev:
	npm run dev

# One-time setup for a fresh checkout.
install setup:
	npm ci

# ── Verify ────────────────────────────────────────────────────────────────────

# The gate that CI runs and that `make release` requires. Everything a
# reviewer needs to trust a change.
check: check-static test test-doctests

# What needs no build and no browser, so it fails in seconds. `make release` runs it
# before the benchmarks and the suites, the order qunitx and qunitx-cli release in.
check-static: format lint jsr-check typecheck vendor-check

# Formatting is prettier, configured by the "prettier" key in package.json; the
# files it skips are negated patterns in the npm scripts, so there is no
# .prettierignore. packages/@emberx/vendor/ is written by scripts/build-emberx-vendor.ts and
# is never reformatted or linted, so it stays byte for byte what the script writes. README.md says why this is not
# `deno fmt`.
format:
	npm run format

fix fmt:
	npm run format:fix

# `deno lint`, from your installed Deno (CONTRIBUTING.md), configured by flags in
# package.json's lint script. Its recommended rules, minus five that don't fit:
#   no-window, no-window-prefix   these are browser packages
#   require-await          `async` is semantic here: @action detects AsyncFunction to track settledness
#   no-explicit-any, ban-ts-comment   existing type debt, tightened separately
lint:
	npm run lint

# What `deno publish` would refuse in the JSR packages: an export without an
# explicit type, or a module augmenting another.
jsr-check:
	npm run publish:jsr -- --dry-run

typecheck:
	npm run typecheck

# Rewrites packages/@emberx/vendor/ from the versions package.json pins
# (ember-source, @glimmer/component, location-bar). After bumping one: `make vendor`, commit.
vendor:
	npm run vendor

# Fails if packages/@emberx/vendor/ differs from what `make vendor` would write.
vendor-check:
	npm run vendor -- --check

# The node suite, the Deno suite and the browser suite, from the sources.
test:
	npm test

# @emberx/string, helper and component under plain node + jsdom. Proves the
# packages resolve, render and run outside a browser. Fast, no browser required.
test-node:
	npm run test:node

# The same suite under Deno (needs Deno installed; see CONTRIBUTING.md).
test-deno:
	npm run test:deno

# Runs every ```ts/```js example in the READMEs and in JSDoc comments with
# `deno test --doc`, assertions included. ```ts ignore skips a multi-file sketch.
test-doctests:
	npm run test:doctests

# The full suite in a real browser — the only place @emberx/router,
# @emberx/component rendering and @emberx/test-helpers are actually exercised.
test-browser test-chrome:
	npm run test:browser

test-browser-dev:
	npm run test:browser:dev

test-firefox:
	QUNITX_BROWSER=firefox npm run test:browser

test-webkit:
	QUNITX_BROWSER=webkit npm run test:browser

# Chromium, then Firefox, then WebKit. Requires:
#   npx playwright install firefox webkit
test-all-browsers: test-browser test-firefox test-webkit

# Packs all seven packages, installs the tarballs into a throwaway directory, and
# runs a consumer smoke test plus the node suite against what got installed, not
# the checkout. Catches what source tests cannot: a missing `files` entry, a
# wrong `exports` path, a dependency only declared at the root.
test-release:
	npm run test:release

# Coverage of packages/@emberx/*/src from the Deno suite, the browser suite plus
# @emberx/ssr: a summary, tmp/coverage/lcov.info for Codecov, tmp/coverage/html/.
coverage:
	npm run test:coverage

# ── Site ──────────────────────────────────────────────────────────────────────

# Each package's API docs, from its sources' JSDoc, into tmp/site/api/<package>/:
# deno doc over the entries its package.json exports.
docs:
	@mkdir -p tmp/site/api
	@for package in component helper router ssr string test-helpers; do \
		entries=$$(node -p "Object.values(require('./packages/@emberx/$$package/package.json').exports).join(' ')"); \
		(cd packages/@emberx/$$package && deno doc --quiet --html --name=@emberx/$$package --output=../../../tmp/site/api/$$package $$entries) || exit 1; \
	done

# What https://izelnakri.github.io/emberx/ serves, in tmp/site/: docs/index.html with
# the version, the line coverage and the commit filled in, the API docs, and the
# coverage report. The Pages workflow deploys it; `npx serve tmp/site` previews it.
site: docs coverage
	cp -r tmp/coverage/html tmp/site/coverage
	sed -e "s/{{VERSION}}/$$(node -p "require('./package.json').version")/g" \
		-e "s/{{COVERAGE}}/$$(awk -F: '/^LF:/ { found += $$2 } /^LH:/ { hit += $$2 } END { printf "%.1f", 100 * hit / found }' tmp/coverage/lcov.info)/g" \
		-e "s/{{COMMIT}}/$$(git rev-parse --short HEAD)/g" \
		docs/index.html > tmp/site/index.html

# ── Benchmarks ────────────────────────────────────────────────────────────────

# Benchmarks are Deno.bench files in benches/, run and checked by
# scripts/check-benchmarks.ts, as in qunitx-cli.
#
# Measures BENCH_BASE (default: where this branch left origin/main) in a
# temporary worktree, then this tree, on this machine, and fails if anything
# regressed by more than REGRESSION_THRESHOLD%. Nothing is committed: timings
# only compare on one machine. SKIP_BENCHMARK=true bypasses the gate entirely,
# which is what you want on a loaded laptop where timings are noise.
bench-check:
	@if echo "$(SKIP_BENCHMARK)" | grep -qiE '^(true|1|all)$$'; then \
		echo "SKIP_BENCHMARK=$(SKIP_BENCHMARK) -> skipping bench-check"; \
	else \
		REGRESSION_THRESHOLD=$(REGRESSION_THRESHOLD) npm run bench:compare -- $(BENCH_BASE); \
	fi

# Runs the suite and prints results without touching the baseline.
bench bench-print:
	npm run bench

# Saves this machine's results to benches/results.json (gitignored), for a
# manual before/after with `npm run bench:check`.
bench-update:
	npm run bench:update

# ── Docker ────────────────────────────────────────────────────────────────────

docker-build:
	docker build -t emberx:local .

docker-test: docker-build
	docker run --rm emberx:local make check

# ── Release ───────────────────────────────────────────────────────────────────

# Checks, cheapest first, then bump, publish all seven packages, changelog, commit, tag, push.
# CI creates the GitHub release from the tag.
#
# Usage: make release LEVEL=patch|minor|major|x.y.z
#
# npm publish happens BEFORE the release commit and tag, so a release started on
# a topic branch would publish that branch's code under a version main never
# contained. Hence the main-only and in-sync-with-origin gates, which run first.
release:
	@test -n "$(LEVEL)" || (echo "Usage: make release LEVEL=patch|minor|major|x.y.z" && exit 1)
	@branch=$$(git rev-parse --abbrev-ref HEAD); \
	if [ "$$branch" != "main" ]; then \
		echo "make release must run on main — you are on '$$branch'."; \
		exit 1; \
	fi
	@git fetch -q origin main; \
	if [ "$$(git rev-parse HEAD)" != "$$(git rev-parse origin/main)" ]; then \
		echo "main and origin/main differ — pull or push first, then release."; \
		exit 1; \
	fi
	@if [ -n "$$(git status --porcelain)" ]; then \
		echo "Refusing to release with a dirty working tree:"; \
		git status --short; \
		exit 1; \
	fi
	@npm ls --all > /dev/null 2>&1 || { \
		echo "node_modules does not match package.json and package-lock.json: run npm ci, then release."; \
		exit 1; \
	}
	@npm whoami > /dev/null 2>&1 || npm login
	$(MAKE) check-static
	$(MAKE) bench-check BENCH_BASE=$$(git describe --tags --abbrev=0 2>/dev/null)
	$(MAKE) test
	$(MAKE) test-doctests
	$(MAKE) test-release
	deno run -A scripts/publish-emberx-packages.ts $(LEVEL)
	@VERSION=$$(node -p "require('./package.json').version"); \
	npm install --package-lock-only --ignore-scripts && \
	npm run changelog:update -- --tag "v$$VERSION" && \
	git add package.json package-lock.json CHANGELOG.md packages/@emberx/*/package.json && \
	git commit -m "Release $$VERSION" && \
	git tag "v$$VERSION" && \
	git push origin main "v$$VERSION"

# ── Help ──────────────────────────────────────────────────────────────────────

help:
	@echo "emberx — make targets"
	@echo ""
	@echo "Usage: make <target> [LEVEL=patch|minor|major|x.y.z] [REGRESSION_THRESHOLD=26]"
	@echo ""
	@echo "Build"
	@echo "  build             Bundle all packages to dist/ + emit .d.ts (for publishing)"
	@echo "  clean             Remove every build artefact"
	@echo ""
	@echo "Develop"
	@echo "  dev               Serve examples/blog on :1234 with watch rebuilds"
	@echo "  install / setup   npm ci for a fresh checkout"
	@echo ""
	@echo "Verify"
	@echo "  check             check-static + test + test-doctests"
	@echo "  check-static      format + lint + jsr-check + typecheck + vendor-check: no build, no browser"
	@echo "  format            Check formatting (prettier)"
	@echo "  fix / fmt         Auto-fix formatting"
	@echo "  lint              Lint sources (deno lint)"
	@echo "  jsr-check         What deno publish would refuse in the JSR packages"
	@echo "  typecheck         tsc --noEmit over all package sources and test/types.ts"
	@echo "  vendor            Rewrite @emberx/vendor from the pinned packages"
	@echo "  vendor-check      Fail if @emberx/vendor differs from them"
	@echo "  test              Node, Deno and browser suites, from the sources"
	@echo "  test-node         string, helper and component under node + jsdom"
	@echo "  test-deno         The same suite under Deno"
	@echo "  test-doctests     Run the code examples in the docs"
	@echo "  test-browser      Full suite in chromium (alias: test-chrome)"
	@echo "  test-browser-dev  Full suite in chromium, watching for changes"
	@echo "  test-firefox      Full suite in firefox"
	@echo "  test-webkit       Full suite in webkit"
	@echo "  test-all-browsers chromium, then firefox, then webkit"
	@echo "  test-release      Test the packed tarballs, not the checkout"
	@echo "  coverage          Coverage of the packages' sources -> tmp/coverage/"
	@echo ""
	@echo "Site"
	@echo "  docs              API docs of each package -> tmp/site/api/"
	@echo "  site              docs + coverage + the landing page -> tmp/site/, as Pages serves it"
	@echo ""
	@echo "Benchmarks"
	@echo "  bench             Run benchmarks and print results"
	@echo "  bench-check       Measure BENCH_BASE and this tree; fail on a regression"
	@echo "  bench-update      Save this machine's results as a local baseline"
	@echo ""
	@echo "Docker"
	@echo "  docker-build      Build the local image"
	@echo "  docker-test       Build the image and run make check inside it"
	@echo ""
	@echo "Release"
	@echo "  release           check-static + bench-check + test + test-release + bump + publish + tag + push"
	@echo ""
	@echo "Escape hatches"
	@echo "  SKIP_BENCHMARK=true    skip bench-check (noisy machine)"
	@echo "  BENCH_BASE=<ref>       commit bench-check compares against"
	@echo "  QUNITX_BROWSER=<name>  override the browser for test-browser"
