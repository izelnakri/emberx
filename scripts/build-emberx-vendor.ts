#!/usr/bin/env -S deno run -A
/**
 * Writes @emberx/vendor (packages/@emberx/vendor/), the code emberx uses from
 * other packages, from the versions package.json pins as exact devDependencies.
 * Updating one is a version bump (which Dependabot opens) and one command:
 *
 *   npm run vendor              empties packages/@emberx/vendor/ (its package.json and
 *                               README.md aside) and writes it from node_modules
 *   npm run vendor -- --check   fails if it differs (`make check-static` runs it)
 *
 * The other packages import it by path, `@emberx/vendor/@ember/owner`, and
 * their manifests depend on it instead of on the packages it comes from:
 *
 *   ember-source        -> @ember/*, @glimmer/*, shared-chunks/
 *     The modules emberx imports, found by reading every `@emberx/vendor/...`
 *     import under packages/@emberx/*\/src and benches/, and every file they reach, as
 *     ember-source's dist/prod/packages has them; with the type declarations
 *     ember-source has for them (types/, ambient, as ember-source's own), and a
 *     declaration per module (`@ember/owner/index.d.ts`) that re-exports them.
 *     None of ember-source's 17 dependencies, which only its ember-cli hooks and
 *     blueprints use, is needed.
 *   @glimmer/component  -> @glimmer/component/
 *     The component base class Ember apps use, published from ember.js. Its
 *     imports point at the ember-source modules above. Two changes, each marked
 *     `emberx:` in the file: its development checks follow EMBERX_DEBUG
 *     (CONTRIBUTING.md), since @glimmer/env's DEBUG is false in every
 *     ember-source build, and an owner may be a function, as @emberx/router's
 *     static Owner is.
 *   location-bar        -> location-bar/location-bar.js
 *     Backbone's history handling, last published in 2016 as a UMD script, as
 *     an ES module, with a declaration of the API it has: location-bar ships
 *     none, and TypeScript 7 infers no class from its prototype assignments.
 *
 * Each transform checks the upstream shape it expects and fails loudly when an
 * update changes it, rather than writing a half-converted file.
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VENDOR = 'packages/@emberx/vendor';
const EMBER = `${ROOT}/node_modules/ember-source`;
const EMBER_PACKAGES = `${EMBER}/dist/prod/packages`;
const EMBER_TYPES = `${EMBER}/types/stable`;
/** What outlives a run: the README, and package.json, whose fields a run keeps and whose exports it rewrites. */
const KEPT = new Set(['package.json', 'README.md']);
/** location-bar's API, which it declares nowhere: Backbone.History's, plus its own update, onChange and hasPushState. */
const LOCATION_BAR_TYPES = `export interface StartOptions {
  /** Use the History API rather than the URL's hash: false by default. */
  pushState?: boolean;
  /** Fall back to the hash where pushState is missing: true by default. */
  hashChange?: boolean;
  /** The path the app lives under: \`/\` by default. */
  root?: string;
  /** Whether the URL the app starts on is not reported to the onChange callbacks. */
  silent?: boolean;
  location?: Location;
  history?: History;
}

export interface NavigateOptions {
  /** Report the new URL to the onChange callbacks too. */
  trigger?: boolean;
  /** Replace the current history entry rather than adding one. */
  replace?: boolean;
}

/** Follows the browser's URL, through the History API or the URL's hash. */
export default class LocationBar {
  start(options?: StartOptions): boolean | undefined;
  stop(): void;
  /** Calls \`callback\` with the URL's path, its fragment, each time the browser changes it. */
  onChange(callback: (fragment: string) => void): void;
  route(route: RegExp, callback: (fragment: string) => void): void;
  /** Changes the URL to \`fragment\`. */
  update(fragment: string, options?: NavigateOptions | boolean): boolean | undefined;
  navigate(fragment: string, options?: NavigateOptions | boolean): boolean | undefined;
  checkUrl(): boolean | undefined;
  loadUrl(fragment?: string): boolean;
  getFragment(fragment?: string, forcePushState?: boolean): string;
  hasPushState(): boolean;
}
`;
const isCheck = process.argv.includes('--check');

const { vendored: component, imports: componentImports } = await glimmerComponent();
const ember = await emberSource([...new Set([...(await importedEmberModules()), ...componentImports])].sort());
const vendored = new Map([...(await locationBar()), ...component, ...ember.vendored]);

const packageJSON = JSON.parse(await readFile(`${ROOT}/${VENDOR}/package.json`, 'utf8'));
packageJSON.exports = {
  ...ember.exports,
  './@glimmer/component': { types: './@glimmer/component/index.d.ts', default: './@glimmer/component/index.js' },
  './location-bar': { types: './location-bar/location-bar.d.ts', default: './location-bar/location-bar.js' },
};
vendored.set('package.json', `${JSON.stringify(packageJSON, null, 2)}\n`);
vendored.set('LICENSE', await licenses());

const present = (await files(`${ROOT}/${VENDOR}`)).filter((path) => !KEPT.has(path));

if (isCheck) {
  const stale: string[] = [];
  for (const [path, content] of vendored) {
    if ((await readFile(`${ROOT}/${VENDOR}/${path}`, 'utf8').catch(() => null)) !== content) stale.push(path);
  }
  for (const path of present) {
    if (!vendored.has(path)) stale.push(`${path} (from no vendored package)`);
  }
  if (stale.length > 0) {
    process.stderr.write(`${VENDOR} differs from package.json's versions; run \`npm run vendor\`:\n`);
    for (const path of stale) process.stderr.write(`  ${path}\n`);
    process.exit(1);
  }
  process.stdout.write(`${VENDOR} matches package.json: ${vendored.size} files\n`);
} else {
  // Everything else goes first, directories included, so nothing a run wrote outlives the next.
  for (const entry of await readdir(`${ROOT}/${VENDOR}`)) {
    if (!KEPT.has(entry)) await rm(`${ROOT}/${VENDOR}/${entry}`, { recursive: true, force: true });
  }
  for (const [path, content] of vendored) {
    await mkdir(dirname(`${ROOT}/${VENDOR}/${path}`), { recursive: true });
    await writeFile(`${ROOT}/${VENDOR}/${path}`, content);
  }
  process.stdout.write(`vendored ${vendored.size} files into ${VENDOR}\n`);
}

async function manifest(
  name: string,
): Promise<{ version: string; license: string; repository?: string | { url: string } }> {
  return JSON.parse(await readFile(`${ROOT}/node_modules/${name}/package.json`, 'utf8'));
}

function header(name: string, version: string, license: string): string {
  return (
    `// Vendored from ${name}@${version} (${license}) by scripts/build-emberx-vendor.ts. Do not edit:\n` +
    `// bump ${name} in package.json and run \`npm run vendor\`.\n`
  );
}

/** Replaces `from` in `source` exactly `count` times, or fails: upstream changed shape. */
function patch(source: string, from: string, to: string, count: number, where: string): string {
  const found = source.split(from).length - 1;
  if (found !== count) {
    throw new Error(
      `${where}: expected ${count} of ${JSON.stringify(from)}, found ${found}; update scripts/build-emberx-vendor.ts.`,
    );
  }
  return source.replaceAll(from, to);
}

/** The files under `directory`, relative to it; ember-source has a directory named backburner.js. */
async function files(directory: string): Promise<string[]> {
  if (!existsSync(directory)) return [];
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => relative(directory, join(entry.parentPath, entry.name)));
}

/** location-bar's UMD wrapper, dropped, with the factory's body dedented and exported. */
async function locationBar(): Promise<Map<string, string>> {
  const { version, license } = await manifest('location-bar');
  const source = await readFile(`${ROOT}/node_modules/location-bar/location-bar.js`, 'utf8');
  const lines = source.trimEnd().split('\n');

  const start = lines.indexOf('define(function() {');
  const end = lines.lastIndexOf('  return History;');
  if (
    lines[start - 1] !== '(function(define) {' ||
    start === -1 ||
    end === -1 ||
    !lines.at(-1)!.includes('define.amd')
  ) {
    throw new Error(`location-bar@${version} is no longer the UMD wrapper scripts/build-emberx-vendor.ts expects.`);
  }

  const comment = lines.slice(0, start - 1);
  const body = lines.slice(start + 1, end).map((line) => line.replace(/^ {2}/, ''));
  while (body.at(-1)?.trim() === '' || body.at(-1)?.trim() === '// export') body.pop();

  const file = [header('location-bar', version, license), ...comment, ...body, '', 'export default History;', ''];
  return new Map([
    ['location-bar/location-bar.js', file.join('\n')],
    ['location-bar/location-bar.d.ts', `${header('location-bar', version, license)}\n${LOCATION_BAR_TYPES}`],
  ]);
}

/**
 * @glimmer/component's published dist/: its module with emberx's two changes
 * and its Ember imports pointed at the vendored modules, and its declarations,
 * which reference the vendored types.
 */
async function glimmerComponent(): Promise<{ vendored: Map<string, string>; imports: string[] }> {
  const { version, license } = await manifest('@glimmer/component');
  const from = `${ROOT}/node_modules/@glimmer/component/dist`;
  const sources = (await files(from)).filter((path) => /\.(js|d\.ts)$/.test(path)).sort();
  if (!sources.includes('index.js') || !sources.includes('index.d.ts')) {
    throw new Error(`@glimmer/component@${version} no longer publishes dist/index.js and dist/index.d.ts.`);
  }

  const vendored = new Map<string, string>();
  const imports = new Set<string>();
  for (const path of sources) {
    let source = await readFile(`${from}/${path}`, 'utf8');
    const where = `@glimmer/component@${version} dist/${path}`;

    if (path === 'index.js') {
      source = patch(
        source,
        "import { DEBUG } from '@glimmer/env';",
        "// emberx: development checks follow EMBERX_DEBUG; @glimmer/env's DEBUG is false in every ember-source build.\n" +
          "const DEBUG = typeof EMBERX_DEBUG !== 'undefined' && Boolean(EMBERX_DEBUG);",
        1,
        where,
      );
      source = patch(
        source,
        "owner !== null && typeof owner === 'object'",
        "owner !== null && (typeof owner === 'object' || typeof owner === 'function') /* emberx: a static Owner class */",
        2,
        where,
      );
      source = source.replace(/^(import .* from ')(@ember\/[^']+)(';)$/gm, (_line, start, name, end) => {
        imports.add(name);
        return `${start}../../${emberFile(name)}${end}`;
      });
    } else {
      // Extensionless relative imports resolve only for bundlers; node's ESM
      // resolution, which a consumer's compiler applies here, needs the extension.
      source = source.replace(/(from\s*['"])(\.{1,2}\/[^'"]+?)(?<!\.js)(['"])/g, '$1$2.js$3');
      const depth = path.split('/').length - 1;
      source = `/// <reference path="${'../'.repeat(depth + 2)}types/index.d.ts" />\n` + source;
    }
    vendored.set(`@glimmer/component/${path}`, header('@glimmer/component', version, license) + source);
  }

  return { vendored, imports: [...imports] };
}

/** The file ember-source's dist/prod/packages has for a module name, relative to it. */
function emberFile(name: string): string | null {
  if (existsSync(`${EMBER_PACKAGES}/${name}.js`)) return `${name}.js`;
  if (existsSync(`${EMBER_PACKAGES}/${name}/index.js`)) return `${name}/index.js`;
  return null;
}

/**
 * Every ember-source module imported through @emberx/vendor, by the packages'
 * sources or by the benchmarks, which measure Ember's compiler through the copy
 * the packages use.
 */
async function importedEmberModules(): Promise<string[]> {
  const directories = [
    ...(await readdir(`${ROOT}/packages/@emberx`)).map((name) => `${ROOT}/packages/@emberx/${name}/src`),
    `${ROOT}/benches`,
  ];
  const names = new Set<string>();
  for (const directory of directories) {
    for (const path of (await files(directory)).filter((path) => /\.[jt]s$/.test(path))) {
      const source = await readFile(`${directory}/${path}`, 'utf8');
      for (const [, module] of source.matchAll(/['"]@emberx\/vendor\/([^'"]+)['"]/g)) names.add(module);
    }
  }
  return [...names].filter((name) => name !== '@glimmer/component' && name !== 'location-bar');
}

/**
 * The ember-source modules `names`: every file their JavaScript reaches, the
 * ambient declarations of every module their declarations reach, and a
 * declaration per module that re-exports the ambient one. Also their exports.
 */
async function emberSource(names: string[]) {
  const { version } = await manifest('ember-source');
  const vendored = new Map<string, string>();

  const withCode = names.filter((name) => emberFile(name));
  const { metafile } = await esbuild.build({
    stdin: {
      contents: withCode.map((name, index) => `export * as m${index} from './${emberFile(name)}';`).join('\n'),
      resolveDir: EMBER_PACKAGES,
    },
    bundle: true,
    write: false,
    metafile: true,
    format: 'esm',
    logLevel: 'error',
  });
  for (const input of Object.keys(metafile.inputs).filter((path) => path.includes('/dist/prod/packages/'))) {
    const path = input.slice(input.indexOf('/dist/prod/packages/') + '/dist/prod/packages/'.length);
    vendored.set(path, await readFile(`${EMBER_PACKAGES}/${path}`, 'utf8'));
  }

  const declaredIn = new Map<string, string[]>();
  for (const path of (await files(EMBER_TYPES)).filter((path) => path.endsWith('.d.ts') && path !== 'index.d.ts')) {
    for (const [, module] of (await readFile(`${EMBER_TYPES}/${path}`, 'utf8')).matchAll(/declare module '([^']+)'/g)) {
      declaredIn.set(module, [...(declaredIn.get(module) ?? []), path]);
    }
  }
  const typeFiles = new Set<string>();
  const queue = [...names];
  const seen = new Set<string>();
  while (queue.length > 0) {
    const module = queue.pop()!;
    if (seen.has(module)) continue;
    seen.add(module);
    if (!declaredIn.has(module)) {
      if (names.includes(module)) throw new Error(`ember-source@${version} declares no types for ${module}.`);
      continue;
    }
    for (const path of declaredIn.get(module)!) {
      typeFiles.add(path);
      const source = await readFile(`${EMBER_TYPES}/${path}`, 'utf8');
      for (const [, imported] of source.matchAll(/(?:from|import\()\s*['"]([^'"]+)['"]/g)) queue.push(imported);
    }
  }
  const sortedTypeFiles = [...typeFiles].sort();
  for (const path of sortedTypeFiles) vendored.set(`types/${path}`, await readFile(`${EMBER_TYPES}/${path}`, 'utf8'));
  vendored.set('types/index.d.ts', sortedTypeFiles.map((path) => `/// <reference path="./${path}" />\n`).join(''));

  const exports: Record<string, unknown> = {};
  for (const name of names) {
    const file = emberFile(name);
    const declaration = file ? file.replace(/\.js$/, '.d.ts') : `${name}/index.d.ts`;
    // A module can be declared in more than one file; any of them may give it a default.
    const bodies = await Promise.all(
      declaredIn
        .get(name)!
        .map(
          async (path) =>
            (await readFile(`${EMBER_TYPES}/${path}`, 'utf8'))
              .split(`declare module '${name}'`)[1]
              .split(/\ndeclare module '/)[0],
        ),
    );
    const hasDefault = bodies.some((body) => /export default|as default\b|\{\s*default\s*[,}]/.test(body));
    vendored.set(
      declaration,
      `/// <reference path="${'../'.repeat(declaration.split('/').length - 1)}types/index.d.ts" />\n` +
        `export * from '${name}';\n` +
        (hasDefault ? `export { default } from '${name}';\n` : ''),
    );
    exports[`./${name}`] = file ? { types: `./${declaration}`, default: `./${file}` } : { types: `./${declaration}` };
  }

  return { vendored, exports };
}

/** The licenses of the code vendored here, from each package. */
async function licenses(): Promise<string> {
  const notices = await Promise.all(
    ['ember-source', '@glimmer/component', 'location-bar'].map(async (name) => {
      const { version, license, repository } = await manifest(name);
      const text = await readFile(`${ROOT}/node_modules/${name}/LICENSE`, 'utf8').catch(() => null);
      const url = typeof repository === 'string' ? repository : repository?.url;
      return text
        ? `${name}@${version} (${license})\n\n${text.trim()}\n`
        : `${name}@${version} (${license}, from its package.json; it ships no license file)\n${url}\n`;
    }),
  );
  return `@emberx/vendor redistributes code from these packages, under their licenses.\n\n${notices.join('\n---\n\n')}`;
}
