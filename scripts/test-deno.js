#!/usr/bin/env node
/**
 * Runs the node test suite (test/node.ts) under Deno: the same 65 tests, bundled
 * by scripts/lib/test-bundle.js with qunitx's Deno build, which reports through
 * Deno.test.
 *
 * Deno does not run most test modules directly: it compiles decorators with
 * standard class-field semantics, under which a legacy `@tracked` field is
 * overwritten by its own initializer. esbuild compiles them as the rest of
 * emberx does.
 *
 *   node scripts/test-deno.js                      against the workspace sources
 *   node scripts/test-deno.js --packages-from=DIR  against packages installed in DIR
 */
import { writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

import { ROOT, bundleTestSuite, packagesFromArgv } from './lib/test-bundle.js';

await bundleTestSuite({ runtime: 'deno', outfile: `${ROOT}/tmp/deno-tests.mjs`, packagesFrom: packagesFromArgv() });

// jsdom globals have to exist before the bundle evaluates, as in the node runner.
// Static imports would evaluate both modules eagerly, hence the awaited imports.
const entry = `${ROOT}/tmp/deno-entry.mjs`;
await writeFile(entry, "await import('../test/setup-dom.js');\nawait import('./deno-tests.mjs');\n");

const { status } = spawnSync('deno', ['test', '--no-check', '--allow-read', '--allow-env', entry], {
  cwd: ROOT,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
process.exit(status ?? 1);
