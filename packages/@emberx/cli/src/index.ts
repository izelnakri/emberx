/**
 * @emberx/cli's build, for a script of its own: what `emberx build` runs.
 *
 *   import { buildApp, formatReport } from '@emberx/cli';
 *
 *   const { files } = await buildApp({ entryPoints: { app: 'src/app.ts' }, outdir: 'dist/assets' });
 *   console.log(formatReport(files));
 */
export { buildApp, formatReport } from './build/app.ts';
export type { AppBuild, AppBuildOptions, BuiltFile, BundledModule } from './build/app.ts';
export { default as precompilePlugin, TEMPLATE_MODULES } from './build/precompile-plugin.ts';
export { VERSION } from './version.ts';
