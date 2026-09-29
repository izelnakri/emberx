#!/usr/bin/env node
/**
 * Development server for the example apps.
 *
 * Replaces webpack-dev-server. esbuild rebuilds the example bundles on change;
 * a small static server in front of it serves `public/` and falls back to the
 * SPA shell so client-side routes deep-link correctly on refresh.
 *
 *   npm run dev              -> http://localhost:1234        (blog example)
 *   npm run dev -- --basic   -> serves the basic example shell instead
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import * as esbuild from 'esbuild';

import { glimmerCompilerCryptoPlugin, emberxWorkspacePlugin } from './lib/glimmer-compat.js';
import { PACKAGES } from './build.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 1234);
const shell = process.argv.includes('--basic') ? 'index.html' : 'blog.html';

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const context = await esbuild.context({
  entryPoints: {
    'examples/basic.bundle': `${ROOT}/examples/basic/index.ts`,
    'examples/blog.bundle': `${ROOT}/examples/blog/index.ts`,
  },
  outdir: `${ROOT}/dist`,
  bundle: true,
  format: 'esm',
  splitting: false,
  platform: 'browser',
  target: 'es2022',
  sourcemap: 'inline',
  logLevel: 'info',
  // Examples import @emberx/* by package name; resolve those to the workspace
  // sources so editing the framework is picked up without an intermediate build.
  plugins: [emberxWorkspacePlugin(ROOT, PACKAGES), glimmerCompilerCryptoPlugin()],
});

await context.watch();

/** Resolves a URL path to a file on disk, refusing to escape the served roots. */
async function readStatic(urlPath) {
  for (const base of [`${ROOT}/public`, `${ROOT}/dist`]) {
    const candidate = join(base, normalize(urlPath));
    if (!candidate.startsWith(base)) continue;

    try {
      return { body: await readFile(candidate), path: candidate };
    } catch {
      // Try the next root.
    }
  }

  return null;
}

const server = createServer(async (request, response) => {
  const urlPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const found = (await readStatic(urlPath)) ?? (await readStatic(`/${shell}`));

  if (!found) {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    return response.end('Not found');
  }

  response.writeHead(200, {
    'Content-Type': MIME_TYPES[extname(found.path)] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  response.end(found.body);
});

server.listen(PORT, () => {
  process.stdout.write(`\nemberx dev server -> http://localhost:${PORT} (serving ${shell})\n`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await context.dispose();
    server.close();
    process.exit(0);
  });
}
