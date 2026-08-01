.DEFAULT_GOAL := help

LEVEL ?= patch
REGRESSION_THRESHOLD ?= 25

.PHONY: bench bench-check bench-print bench-update build build-dev check clean coverage \
        dev docker-build docker-test fix fmt format help install lint release setup test test-all-browsers \
        test-browser test-browser-dev test-chrome test-firefox test-node test-webkit typecheck

# ── Build ─────────────────────────────────────────────────────────────────────

# Bundles each @emberx package to dist/ with esbuild, then emits .d.ts with tsc.
build:
	npm run build

# Same, but skips declaration emit — the fast loop used by `make test`.
build-dev:
	npm run build:dev

clean:
	npm run clean

# ── Develop ───────────────────────────────────────────────────────────────────

# Serves examples/blog at http://localhost:1234 with esbuild watch.
# `npm run dev -- --basic` serves the basic example shell instead.
dev:
	npm run dev

# One-time setup for a fresh checkout.
install setup:
	npm ci

# ── Verify ────────────────────────────────────────────────────────────────────

# The gate that CI runs and that `make release` requires. Everything a
# reviewer needs to trust a change.
check: format lint typecheck test

format:
	npm run format

fix fmt:
	npm run format:fix

lint:
	npm run lint

typecheck:
	npm run typecheck

# Builds, then runs the node suite followed by the browser suite.
test:
	npm test

# Pure-JS packages (@emberx/string, @emberx/helper) under node + jsdom.
# Fast, no browser required.
test-node:
	npm run test:node

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

# V8 line coverage of the browser suite, mapped back to package sources:
# a terminal summary plus tmp/coverage/lcov.info and tmp/coverage/index.html.
# Chromium only. The figure includes the test modules themselves, since
# qunitx-cli only excludes the entry file (test/index.ts).
coverage: build-dev
	npm run test:coverage

# ── Benchmarks ────────────────────────────────────────────────────────────────

# Runs the suite and compares against benches/results.json, failing if anything
# regresses by more than REGRESSION_THRESHOLD%. Run `make bench-update` once to
# establish a baseline. SKIP_BENCHMARK=true bypasses the gate entirely, which is
# what you want on a loaded laptop where timings are noise.
bench-check:
	@if echo "$(SKIP_BENCHMARK)" | grep -qiE '^(true|1|all)$$'; then \
		echo "SKIP_BENCHMARK=$(SKIP_BENCHMARK) -> skipping bench-check"; \
	else \
		REGRESSION_THRESHOLD=$(REGRESSION_THRESHOLD) npm run bench:check; \
	fi

# Runs the suite and prints results without touching the baseline.
bench bench-print:
	npm run bench

# Runs the suite and saves the results as the new baseline.
bench-update:
	npm run bench:update

# ── Docker ────────────────────────────────────────────────────────────────────

docker-build:
	docker build -t emberx:local .

docker-test: docker-build
	docker run --rm emberx:local make check

# ── Release ───────────────────────────────────────────────────────────────────

# Full check, bump, publish all six packages, changelog, commit, tag, push.
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
	@npm whoami > /dev/null 2>&1 || npm login
	$(MAKE) check
	$(MAKE) bench-check
	node scripts/release.js $(LEVEL)
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
	@echo "Usage: make <target> [LEVEL=patch|minor|major|x.y.z] [REGRESSION_THRESHOLD=25]"
	@echo ""
	@echo "Build"
	@echo "  build             Bundle all packages to dist/ + emit .d.ts"
	@echo "  build-dev         Bundle only (skip declarations) — fast loop"
	@echo "  clean             Remove every build artefact"
	@echo ""
	@echo "Develop"
	@echo "  dev               Serve examples/blog on :1234 with watch rebuilds"
	@echo "  install / setup   npm ci for a fresh checkout"
	@echo ""
	@echo "Verify"
	@echo "  check             format + lint + typecheck + test (what CI runs)"
	@echo "  format            Check formatting (prettier)"
	@echo "  fix / fmt         Auto-fix formatting"
	@echo "  lint              Lint sources (oxlint)"
	@echo "  typecheck         tsc --noEmit over all package sources"
	@echo "  test              Build, then node suite, then browser suite"
	@echo "  test-node         @emberx/string + @emberx/helper under node+jsdom"
	@echo "  test-browser      Full suite in chromium (alias: test-chrome)"
	@echo "  test-browser-dev  Full suite in chromium, watching for changes"
	@echo "  test-firefox      Full suite in firefox"
	@echo "  test-webkit       Full suite in webkit"
	@echo "  test-all-browsers chromium, then firefox, then webkit"
	@echo "  coverage          Browser-suite line coverage -> tmp/coverage/"
	@echo ""
	@echo "Benchmarks"
	@echo "  bench             Run benchmarks and print results"
	@echo "  bench-check       Fail if any benchmark regressed > REGRESSION_THRESHOLD%"
	@echo "  bench-update      Run benchmarks and save as the new baseline"
	@echo ""
	@echo "Docker"
	@echo "  docker-build      Build the local image"
	@echo "  docker-test       Build the image and run make check inside it"
	@echo ""
	@echo "Release"
	@echo "  release           check + bench + bump + changelog + publish + tag + push"
	@echo ""
	@echo "Escape hatches"
	@echo "  SKIP_BENCHMARK=true    skip bench-check (noisy machine)"
	@echo "  QUNITX_BROWSER=<name>  override the browser for test-browser"
	@echo "  PORT=<n>               dev server port (default 1234)"
