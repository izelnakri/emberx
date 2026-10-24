/**
 * The app emberx works on: the nearest package.json from where it runs, and its `"emberx"` key,
 * whose every field is optional:
 *
 *   "emberx": {
 *     "entry": "src/app.ts",     the browser's entry module
 *     "html": "index.html",      the page that loads it
 *     "public": "public",        files copied into the build as they are
 *     "outdir": "dist",          where `emberx build` writes
 *     "server": "src/server.ts", the server `emberx build --ssr` bundles
 *     "port": 4200               where `emberx dev` serves
 *   }
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';

export interface Project {
  root: string;
  name: string;
  /** The entry module, absolute, or undefined when there is none to be found. */
  entry: string | undefined;
  html: string;
  publicDir: string;
  outdir: string;
  server: string;
  port: number;
}

/** Where an app's entry module usually is, when its package.json names none. */
const ENTRIES = ['src/app.ts', 'src/main.ts', 'src/index.ts', 'src/app.js', 'src/main.js', 'src/index.js', 'app.ts'];

export function findProject(cwd: string = process.cwd()): Project {
  let root = resolve(cwd);
  while (!existsSync(join(root, 'package.json')) && dirname(root) !== root) root = dirname(root);
  const manifest = existsSync(join(root, 'package.json'))
    ? JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
    : {};
  const config = manifest.emberx ?? {};
  const entry = config.entry ? resolve(root, config.entry) : ENTRIES.map((path) => join(root, path)).find(existsSync);

  return {
    root,
    name: manifest.name ?? 'app',
    entry,
    html: resolve(root, config.html ?? 'index.html'),
    publicDir: resolve(root, config.public ?? 'public'),
    outdir: resolve(root, config.outdir ?? 'dist'),
    server: resolve(root, config.server ?? 'src/server.ts'),
    port: Number(config.port ?? 4200),
  };
}
