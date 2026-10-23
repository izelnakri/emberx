#!/usr/bin/env -S deno run -A
/**
 * Version-bumps and publishes every @emberx package.
 *
 *   deno run -A scripts/publish-emberx-packages.ts patch            # or minor / major
 *   deno run -A scripts/publish-emberx-packages.ts 0.1.0
 *   deno run -A scripts/publish-emberx-packages.ts patch --dry-run
 *
 * Replaces release-it plus the old scripts/release-libraries.js. Driven by
 * `make release LEVEL=<patch|minor|major|x.y.z>`, which runs the checks first,
 * then commits, tags and pushes what this script stamped.
 *
 * All seven packages share one version, and their intra-@emberx dependency ranges
 * are rewritten to that exact version, so a published set is always internally
 * consistent.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

import { PUBLISHED, publishedDirectory } from '../build.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
/** How long the registry may take to serve a version it accepted: @emberx/vendor, the largest, took two minutes. */
const REGISTRY_TIMEOUT = 10 * 60 * 1000;
const REGISTRY_POLL_INTERVAL = 5000;

const level = process.argv[2];
const isDryRun = process.argv.includes('--dry-run');

const rootManifest = JSON.parse(await readFile(`${ROOT}/package.json`, 'utf8'));
const version = nextVersion(rootManifest.version, level);

// Checked before anything is stamped: npm rejects a version that already
// exists, and finding that out after the first package has gone out leaves a
// half-published set.
for (const name of PUBLISHED) {
  if (isPublished(name, version)) {
    process.stderr.write(`@emberx/${name}@${version} is already published — pick the next free version.\n`);
    process.exit(1);
  }
}

rootManifest.version = version;
await writeFile(`${ROOT}/package.json`, `${JSON.stringify(rootManifest, null, 2)}\n`);

const names = await Promise.all(PUBLISHED.map((name) => stampPackage(name, version)));
process.stdout.write(`stamped ${names.length} packages at ${version}\n`);

// dist/package.json is written from each package's manifest, so the build runs
// after the stamp, for the published manifests to carry the new version.
if (npm(['run', 'build']).status !== 0) {
  process.stderr.write('the build failed; nothing was published.\n');
  process.exit(1);
}

if (isDryRun) {
  process.stdout.write(`[dry run] would publish: ${names.join(', ')}\n`);
  process.exit(0);
}

// Each package after its @emberx dependencies (PUBLISHED is ordered that way), and only once the
// registry serves them: npm publish returns before it does, and in 0.5.0 @emberx/vendor appeared two
// minutes after the packages that depend on it, so an install in between failed.
for (const name of PUBLISHED) {
  const { status } = npm(['publish', publishedDirectory(name), '--access', 'public']);
  if (status !== 0) {
    process.stderr.write(`publishing @emberx/${name}@${version} failed; nothing after it was published.\n`);
    process.exit(status ?? 1);
  }
  if (!(await waitUntilPublished(name, version))) {
    process.stderr.write(
      `the registry does not serve @emberx/${name}@${version} after ${REGISTRY_TIMEOUT / 60000} minutes; nothing after it was published.\n`,
    );
    process.exit(1);
  }
  process.stdout.write(`published @emberx/${name}@${version}\n`);
}

/** Asks the registry for `@emberx/<name>@<version>` until it serves it; false after REGISTRY_TIMEOUT. */
async function waitUntilPublished(name: string, version: string): Promise<boolean> {
  const deadline = Date.now() + REGISTRY_TIMEOUT;
  while (Date.now() < deadline) {
    if (isPublished(name, version)) return true;

    await new Promise((resolve) => setTimeout(resolve, REGISTRY_POLL_INTERVAL));
  }

  return false;
}

/** Whether the registry serves `@emberx/<name>@<version>`, asked past npm's cache. */
function isPublished(name: string, version: string): boolean {
  const { stdout } = spawnSync('npm', ['view', `@emberx/${name}@${version}`, 'version', '--prefer-online'], {
    cwd: ROOT,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  return stdout.trim() === version;
}

/** `patch`/`minor`/`major` relative to `current`, or an explicit version passed through. */
function nextVersion(current: string, level: string | undefined): string {
  const [major, minor, patch] = current.split('.').map(Number);
  if (level === 'major') return `${major + 1}.0.0`;
  if (level === 'minor') return `${major}.${minor + 1}.0`;
  if (level === 'patch') return `${major}.${minor}.${patch + 1}`;
  if (/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(level ?? '')) return level;

  process.stderr.write(
    'Usage: deno run -A scripts/publish-emberx-packages.ts <patch|minor|major|x.y.z> [--dry-run]\n' +
      'Example: deno run -A scripts/publish-emberx-packages.ts patch\n',
  );
  process.exit(1);
}

/** Runs npm with the terminal attached, so publish output streams and an OTP prompt can be answered. */
function npm(args: string[]) {
  // npm is npm.cmd on Windows, which only resolves through a shell.
  return spawnSync('npm', args, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
}

/** Rewrites a package's own version and any @emberx dependency ranges to `version`. */
async function stampPackage(name: string, version: string) {
  const path = `${ROOT}/packages/@emberx/${name}/package.json`;
  const manifest = JSON.parse(await readFile(path, 'utf8'));

  manifest.version = version;

  for (const dependency of Object.keys(manifest.dependencies ?? {})) {
    if (dependency.startsWith('@emberx/')) {
      manifest.dependencies[dependency] = version;
    }
  }

  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);

  return manifest.name;
}
