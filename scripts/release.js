#!/usr/bin/env node
/**
 * Version-bumps and publishes every @emberx package.
 *
 *   node scripts/release.js patch            # or minor / major
 *   node scripts/release.js 0.1.0
 *   node scripts/release.js patch --dry-run
 *
 * Replaces release-it plus the old scripts/release-libraries.js. Driven by
 * `make release LEVEL=<patch|minor|major|x.y.z>`, which runs the checks first,
 * then commits, tags and pushes what this script stamped.
 *
 * All six packages share one version, and their intra-@emberx dependency ranges
 * are rewritten to that exact version, so a published set is always internally
 * consistent.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

import { PACKAGES } from './build.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const level = process.argv[2];
const isDryRun = process.argv.includes('--dry-run');

async function readJSON(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJSON(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

/** `patch`/`minor`/`major` relative to `current`, or an explicit version passed through. */
function nextVersion(current, level) {
  const [major, minor, patch] = current.split('.').map(Number);
  if (level === 'major') return `${major + 1}.0.0`;
  if (level === 'minor') return `${major}.${minor + 1}.0`;
  if (level === 'patch') return `${major}.${minor}.${patch + 1}`;
  if (/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(level ?? '')) return level;

  process.stderr.write(
    'Usage: node scripts/release.js <patch|minor|major|x.y.z> [--dry-run]\n' +
      'Example: node scripts/release.js patch\n',
  );
  process.exit(1);
}

/** Runs npm with the terminal attached, so publish output streams and an OTP prompt can be answered. */
function npm(args) {
  // npm is npm.cmd on Windows, which only resolves through a shell.
  return spawnSync('npm', args, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
}

/** Rewrites a package's own version and any @emberx dependency ranges to `version`. */
async function stampPackage(name, version) {
  const path = `${ROOT}/packages/@emberx/${name}/package.json`;
  const manifest = await readJSON(path);

  manifest.version = version;

  for (const dependency of Object.keys(manifest.dependencies ?? {})) {
    if (dependency.startsWith('@emberx/')) {
      manifest.dependencies[dependency] = version;
    }
  }

  await writeJSON(path, manifest);

  return manifest.name;
}

const rootManifest = await readJSON(`${ROOT}/package.json`);
const version = nextVersion(rootManifest.version, level);

// Checked before anything is stamped: npm rejects a version that already
// exists, and finding that out after the first package has gone out leaves a
// half-published set.
for (const name of PACKAGES) {
  const probe = spawnSync('npm', ['view', `@emberx/${name}@${version}`, 'version'], {
    cwd: ROOT,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  if (probe.stdout.trim() === version) {
    process.stderr.write(`@emberx/${name}@${version} is already published — pick the next free version.\n`);
    process.exit(1);
  }
}

rootManifest.version = version;
await writeJSON(`${ROOT}/package.json`, rootManifest);

const names = await Promise.all(PACKAGES.map((name) => stampPackage(name, version)));
process.stdout.write(`stamped ${names.length} packages at ${version}\n`);

if (isDryRun) {
  process.stdout.write(`[dry run] would publish: ${names.join(', ')}\n`);
  process.exit(0);
}

// Published leaf-first (PACKAGES is ordered that way), so at no point does the
// registry hold an @emberx package whose @emberx dependencies are missing.
for (const name of PACKAGES) {
  const { status } = npm(['publish', `--workspace=@emberx/${name}`, '--access', 'public']);
  if (status !== 0) {
    process.stderr.write(`publishing @emberx/${name}@${version} failed; nothing after it was published.\n`);
    process.exit(status ?? 1);
  }
  process.stdout.write(`published @emberx/${name}@${version}\n`);
}
