#!/usr/bin/env node
/**
 * Verifies what actually ships, rather than what is in the checkout.
 *
 * `npm pack`s every workspace, installs the tarballs into a throwaway consumer
 * project, and imports each one. This catches the class of mistake that source
 * tests are blind to:
 *
 *   - a `files` entry that omits dist/
 *   - an `exports`/`types` path that does not exist
 *   - a dependency used at runtime but only declared at the root
 *
 * The last one is exactly how this repo drifted before: @emberx/router imported
 * @emberx/component for years while declaring a dependency on a package
 * (@emberx/route) that has never existed.
 */
import { mkdtemp, rm, writeFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { PACKAGES } from './build.js';

const exec = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const workspace = await mkdtemp(join(tmpdir(), 'emberx-verify-'));
let failed = false;

try {
  process.stdout.write(`packing ${PACKAGES.length} packages into ${workspace}\n`);

  for (const name of PACKAGES) {
    await exec('npm', ['pack', `--workspace=@emberx/${name}`, '--pack-destination', workspace], {
      cwd: ROOT,
    });
  }

  const tarballs = (await readdir(workspace)).filter((file) => file.endsWith('.tgz'));

  if (tarballs.length !== PACKAGES.length) {
    throw new Error(`Expected ${PACKAGES.length} tarballs, got ${tarballs.length}: ${tarballs.join(', ')}`);
  }

  await writeFile(
    join(workspace, 'package.json'),
    JSON.stringify({ name: 'emberx-consumer', version: '1.0.0', type: 'module', private: true }, null, 2),
  );

  // Installing the tarballs resolves each package's declared dependencies from
  // the real registry, so a missing declaration fails here.
  await exec('npm', ['install', '--no-audit', '--no-fund', ...tarballs.map((file) => `./${file}`)], {
    cwd: workspace,
  });

  for (const name of PACKAGES) {
    const specifier = `@emberx/${name}`;

    try {
      await exec(
        process.execPath,
        ['--input-type=module', '-e', `await import(${JSON.stringify(specifier)});`],
        { cwd: workspace },
      );
      process.stdout.write(`  ok   ${specifier}\n`);
    } catch (error) {
      failed = true;
      process.stdout.write(`  FAIL ${specifier}\n${error.stderr || error.message}\n`);
    }
  }
} finally {
  await rm(workspace, { recursive: true, force: true });
}

if (failed) {
  process.stderr.write('\nOne or more packages could not be imported from their published form.\n');
  process.exit(1);
}

process.stdout.write('\nall packages import cleanly from their packed tarballs\n');
