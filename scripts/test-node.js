#!/usr/bin/env node
/**
 * Runs the node test suite.
 *
 * qunitx-cli is a browser runner — it drives chromium/firefox/webkit and has no
 * node mode — so it cannot run this suite. Node cannot run it directly either:
 * the test modules use extensionless relative imports, which node's ESM
 * resolver rejects.
 *
 * So we bundle the entry with esbuild (resolving those imports the way the rest
 * of the build does) and import the result, after installing jsdom globals.
 * qunitx's node build reports TAP itself and sets a non-zero exit code on
 * failure.
 */
import { rm, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import * as esbuild from 'esbuild';

import { glimmerCompilerCryptoPlugin, emberxWorkspacePlugin } from './lib/glimmer-compat.js';
import { PACKAGES } from './build.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTFILE = `${ROOT}/tmp/node-tests.mjs`;

await mkdir(`${ROOT}/tmp`, { recursive: true });

await esbuild.build({
  entryPoints: [`${ROOT}/test/node.ts`],
  outfile: OUTFILE,
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node24',
  sourcemap: 'inline',
  logLevel: 'warning',
  // Prefer each dependency's ESM build. esbuild defaults to `main` (CommonJS)
  // for platform: 'node', but the Glimmer packages ship untranspiled ESM under
  // `module`, which is what every other emberx bundle consumes — and what the
  // @glimmer/compiler patch in glimmer-compat.js targets.
  mainFields: ['module', 'main'],
  // Everything is inlined. The bundle is written under tmp/, so anything left
  // external would be resolved by node relative to tmp/ rather than the repo
  // root. esbuild picks each dependency's `node` export condition here, which
  // is what qunitx needs to load its node build rather than its browser one.
  conditions: ['node'],
  plugins: [emberxWorkspacePlugin(ROOT, PACKAGES), glimmerCompilerCryptoPlugin()],
});

// Must happen before the bundle is imported: @emberx/component reads `window`
// and `document` while its module body evaluates.
await import(pathToFileURL(`${ROOT}/test/setup-dom.js`).href);
await import(pathToFileURL(OUTFILE).href);

process.on('exit', () => {
  rm(OUTFILE, { force: true }).catch(() => {});
});
