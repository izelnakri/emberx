/**
 * Builds an example app for examples/serve.ts with scripts/build-app.ts, as an app's production
 * build: its server.ts, and its browser script, which public/*.html loads as
 * /examples/<app>.bundle.js. Once with templates compiled at runtime (tmp/examples/<app>/runtime/),
 * and once at build time (…/precompiled/).
 *
 *   node examples/build.ts blog
 *
 * Run by node rather than Deno: esbuild spawns its binary with the whole environment, which
 * Deno would need --allow-run and --allow-env for, and the server then needs neither.
 */
import { buildApp } from '../scripts/build-app.ts';

const BROWSER_ENTRIES: Record<string, string> = { basic: 'examples/basic/index.ts', blog: 'examples/blog/app.ts' };

const app = process.argv[2];
if (!BROWSER_ENTRIES[app]) {
  console.error('Usage: node examples/build.ts <basic|blog>');
  process.exit(1);
}

for (const precompile of [false, true]) {
  const outdir = `tmp/examples/${app}/${precompile ? 'precompiled' : 'runtime'}`;

  await buildApp({
    entryPoints: { server: `examples/${app}/server.ts` },
    outdir: `${outdir}/server`,
    platform: 'node',
    precompile,
  });
  await buildApp({ entryPoints: { [`${app}.bundle`]: BROWSER_ENTRIES[app] }, outdir: `${outdir}/browser`, precompile });
}
