#!/usr/bin/env -S deno test -A --no-check
/**
 * Runs the code examples in the docs, so they cannot drift from the code.
 *
 *   - ```ts and ```js blocks in README.md and every package README;
 *   - the same blocks inside JSDoc comments in packages/@emberx/{pkg}/src.
 *
 *   deno test -A --no-check scripts/test-doctests.ts
 *
 * This is qunitx's `deno test --doc`, with one difference: esbuild bundles the
 * examples first, and they run against jsdom. `deno test --doc` would compile
 * them itself, with standard decorator semantics, under which a legacy
 * `@tracked` field is replaced by its own initializer and stops tracking, and
 * nearly every emberx example uses `@tracked`. The node:test cases below run as
 * Deno tests.
 *
 * Conventions, both visible in the docs themselves:
 *   - ```ts ignore skips a block, for multi-file sketches that import files a
 *     reader would write themselves;
 *   - a statement ending in `// => value` asserts that String(statement) is
 *     value, so `camelize('Green house'); // => greenHouse` is checked.
 *
 * Each block runs once, with a fresh `<div id="app">` in the body.
 */
import { existsSync } from 'node:fs';
import { readFile, readdir, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { test } from 'node:test';
import * as esbuild from 'esbuild';

import { emberxWorkspacePlugin } from './lib/esbuild-plugins.js';
import { PACKAGES } from '../build.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WORK = `${ROOT}/tmp/doctests`;
const FENCE = /^([ \t]*(?:\*[ \t]?)?)```(ts|js|typescript|javascript)([^\n]*)\n([\s\S]*?)^\1```/gm;

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? sourceFiles(path) : /\.(ts|js)$/.test(entry.name) ? [path] : [];
    }),
  );
  return files.flat();
}

/** Every runnable block in `file`, with the line it starts on. */
function extractBlocks(file: string, text: string) {
  const blocks: Array<{ name: string; code: string }> = [];
  for (const match of text.matchAll(FENCE)) {
    const [, prefix, , info] = match;
    if (/\bignore\b/.test(info)) continue;

    // Inside JSDoc every line starts with ` * `; strip it the way the fence did.
    const margin = new RegExp(`^${prefix.replace(/[*]/g, '\\*')}`, 'gm');
    const code = match[4].replace(margin, '');
    const line = text.slice(0, match.index).split('\n').length;
    blocks.push({ name: `${relative(ROOT, file)}:${line}`, code });
  }
  return blocks;
}

/** `expression; // => value` becomes an assertion that String(expression) is value. */
function addAssertions(code: string) {
  let asserted = false;
  const transformed = code.replace(/^(\s*)(.+?);?[ \t]*\/\/ => (.+)$/gm, (_line, indent, expression, expected) => {
    asserted = true;
    return `${indent}__assert.equal(String(${expression}), ${JSON.stringify(expected.trim())});`;
  });
  return asserted ? `import __assert from 'node:assert/strict';\n${transformed}` : transformed;
}

const docs = [`${ROOT}/README.md`, ...PACKAGES.map((name) => `${ROOT}/packages/@emberx/${name}/README.md`)].filter(
  (file) => existsSync(file),
);
const sources = (await Promise.all(PACKAGES.map((name) => sourceFiles(`${ROOT}/packages/@emberx/${name}/src`)))).flat();

const blocks: Array<{ name: string; code: string }> = [];
for (const file of [...docs, ...sources]) {
  blocks.push(...extractBlocks(file, await readFile(file, 'utf8')));
}

await rm(WORK, { recursive: true, force: true });
await mkdir(WORK, { recursive: true });

const entries = await Promise.all(
  blocks.map(async (block, index) => {
    const path = `${WORK}/example-${index}.ts`;
    await writeFile(path, `// ${block.name}\n${addAssertions(block.code)}`);
    return path;
  }),
);

// One build with code splitting, so the examples share one copy of each
// package, the way modules in one app would.
await esbuild.build({
  entryPoints: entries,
  outdir: `${WORK}/out`,
  bundle: true,
  splitting: true,
  format: 'esm',
  platform: 'node',
  target: 'esnext',
  sourcemap: 'inline',
  logLevel: 'warning',
  mainFields: ['module', 'main'],
  conditions: ['node'],
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
  plugins: [emberxWorkspacePlugin(ROOT, PACKAGES)],
});

await import(pathToFileURL(`${ROOT}/test/setup-dom.js`).href);

for (const [index, block] of blocks.entries()) {
  test(block.name, async () => {
    document.body.innerHTML = '<div id="app"></div>';
    await import(pathToFileURL(`${WORK}/out/example-${index}.js`).href);
  });
}
