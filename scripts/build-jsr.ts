#!/usr/bin/env -S deno run -A
/**
 * Builds tmp/jsr/: every @emberx package as JSR publishes it, in a Deno
 * workspace that `deno publish` publishes whole (`npm run publish:jsr`).
 *
 * A JSR name is `@scope/name`, so @emberx/router is @izelnakri/emberx-router.
 * Each package gets a deno.json written from its package.json, whose import map
 * sends @emberx imports to those JSR packages and the rest to npm.
 *
 * @emberx/vendor goes without its declarations, ember-source's ambient
 * `declare module` blocks, which Deno does not read; hence `deno publish
 * --no-check`. JSR export names hold no `@`: ./@ember/renderer is ./ember/renderer.
 */
import { cp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PUBLISHED } from '../build.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const JSR = `${ROOT}/tmp/jsr`;
const VENDOR_EXPORTS: Record<string, unknown> = JSON.parse(
  await readFile(`${ROOT}/packages/@emberx/vendor/package.json`, 'utf8'),
).exports;

await rm(JSR, { recursive: true, force: true });

for (const name of PUBLISHED) {
  await buildPackage(name);
}
// A module augmentation, which JSR does not publish: there a test types its assert with test-helpers' Assert.
await writeFile(`${JSR}/test-helpers/src/qunitx-assert.ts`, 'export {};\n');
await writeFile(
  `${JSR}/deno.json`,
  `${JSON.stringify({ workspace: PUBLISHED.map((name) => `./${name}`) }, null, 2)}\n`,
);

async function buildPackage(name: string) {
  const source = `${ROOT}/packages/@emberx/${name}`;
  const target = `${JSR}/${name}`;
  const manifest = JSON.parse(await readFile(`${source}/package.json`, 'utf8'));

  if (name === 'vendor') {
    await cp(source, target, {
      recursive: true,
      filter: (path) => !path.endsWith('/package.json') && !path.endsWith('.d.ts') && path !== `${source}/types`,
    });
  } else {
    await cp(`${source}/src`, `${target}/src`, { recursive: true });
    await cp(`${source}/README.md`, `${target}/README.md`);
    await cp(`${source}/LICENSE`, `${target}/LICENSE`);
  }

  const denoJSON = {
    name: jsrName(name),
    version: manifest.version,
    description: manifest.description,
    // @emberx/vendor's LICENSE is ember-source's and @glimmer/component's: MIT too.
    license: 'MIT',
    exports: Object.fromEntries(
      Object.entries(manifest.exports).map(([path, entry]: [string, any]) => [
        jsrExport(path),
        typeof entry === 'string' ? entry : entry.default,
      ]),
    ),
    imports: importMap({ ...manifest.peerDependencies, ...manifest.dependencies }),
  };
  await writeFile(`${target}/deno.json`, `${JSON.stringify(denoJSON, null, 2)}\n`);
}

function jsrName(name: string): string {
  return `@izelnakri/emberx-${name}`;
}

function jsrExport(path: string): string {
  return path.replaceAll('@', '');
}

/** Each dependency, and its subpaths, mapped to JSR (@emberx packages and qunitx) or to npm. */
function importMap(dependencies: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(dependencies).flatMap(([dependency, range]) => {
      if (dependency === '@emberx/vendor') {
        // One entry per module, as their JSR export names differ: @emberx/vendor/@ember/renderer → …/ember/renderer.
        return Object.keys(VENDOR_EXPORTS).map((path) => [
          `${dependency}${path.slice(1)}`,
          `jsr:${jsrName('vendor')}@^${range}${jsrExport(path).slice(1)}`,
        ]);
      }

      const specifier = dependency.startsWith('@emberx/')
        ? `jsr:${jsrName(dependency.slice('@emberx/'.length))}@^${range}`
        : dependency === 'qunitx'
          ? `jsr:@izelnakri/qunitx@${range}`
          : `npm:${dependency}@${range}`;

      // A prefix maps only to the hierarchical form, `jsr:/@scope/name@range/`.
      return [
        [dependency, specifier],
        [`${dependency}/`, `${specifier.replace(/^(jsr|npm):/, '$1:/')}/`],
      ];
    }),
  );
}
