#!/usr/bin/env node
/** Removes every build artefact. Safe to run at any time; recreated by `make build`. */
import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { PACKAGES } from './build.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const targets = [
  ...PACKAGES.map((name) => `packages/@emberx/${name}/dist`),
  'dist',
  'tmp',
  '.tmp',
  'coverage',
  '.eslintcache',
];

await Promise.all(targets.map((target) => rm(`${ROOT}/${target}`, { recursive: true, force: true })));

process.stdout.write(`cleaned ${targets.length} paths\n`);
