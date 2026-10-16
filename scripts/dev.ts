#!/usr/bin/env -S deno run -A
/**
 * Serves the example apps and rebuilds them on change.
 *
 *   npm run dev   -> http://localhost:1234             the blog example
 *                    http://localhost:1234/basic.html  the basic example
 *
 * esbuild bundles each example from the package sources and serves the bundles
 * from memory, with the files in public/. A URL that matches no file gets
 * public/index.html, so the blog's routes deep-link on refresh. A plain esbuild
 * command does all of this too, except load the plugins below.
 */
import * as esbuild from 'esbuild';
import { emberxWorkspacePlugin } from './lib/esbuild-plugins.js';
import { PACKAGES, ROOT } from '../build.ts';

const context = await esbuild.context({
  entryPoints: {
    'examples/basic.bundle': `${ROOT}/examples/basic/index.ts`,
    'examples/blog.bundle': `${ROOT}/examples/blog/index.ts`,
  },
  outdir: `${ROOT}/public`,
  write: false, // served from memory, never written to public/
  bundle: true,
  format: 'esm',
  target: 'es2022',
  sourcemap: 'inline',
  logLevel: 'info',
  plugins: [emberxWorkspacePlugin(ROOT, PACKAGES)],
});

await context.watch();

const { port } = await context.serve({
  servedir: `${ROOT}/public`,
  fallback: `${ROOT}/public/index.html`,
  port: Number(process.env.PORT || 1234),
});

process.stdout.write(`\nemberx dev server -> http://localhost:${port}\n`);
