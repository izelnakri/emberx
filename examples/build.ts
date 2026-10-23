/**
 * Bundles an example app for examples/serve.ts: its server.ts and its browser script, with
 * templates compiled at runtime (tmp/examples/<app>/) and at build time (…/precompiled/).
 *
 *   node examples/build.ts blog
 *
 * Run by node rather than Deno: esbuild spawns its binary with the whole environment, which
 * Deno would need --allow-run and --allow-env for, and the server then needs neither.
 */
import * as esbuild from 'esbuild';
import precompilePlugin, { TEMPLATE_MODULES } from '../scripts/lib/precompile-plugin.ts';

const BROWSER_ENTRIES: Record<string, string> = { basic: 'examples/basic/index.ts', blog: 'examples/blog/app.ts' };

const app = process.argv[2];
if (!BROWSER_ENTRIES[app]) {
  console.error('Usage: node examples/build.ts <basic|blog>');
  process.exit(1);
}

for (const precompiled of [false, true]) {
  const options = {
    outdir: precompiled ? `tmp/examples/${app}/precompiled` : `tmp/examples/${app}`,
    bundle: true,
    format: 'esm' as const,
    target: 'es2022',
    logLevel: 'warning' as const,
    plugins: precompiled ? [precompilePlugin(TEMPLATE_MODULES)] : [],
  };
  await esbuild.build({ ...options, entryPoints: { server: `examples/${app}/server.ts` }, platform: 'node' });
  await esbuild.build({ ...options, entryPoints: { browser: BROWSER_ENTRIES[app] }, platform: 'browser' });
}
