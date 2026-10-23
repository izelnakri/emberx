/**
 * An esbuild plugin that compiles the `hbs` templates of the modules `filter`
 * matches at build time, with @emberx/component/precompile: the package build,
 * the precompiled benchmarks and the example servers use it.
 */
import { readFile } from 'node:fs/promises';
import type * as esbuild from 'esbuild';
import { precompileTemplates } from '../../packages/@emberx/component/src/precompile.ts';

/** The modules with templates: the examples', and the @emberx packages' sources. */
export const TEMPLATE_MODULES = /\/(examples|packages\/@emberx\/[a-z-]+\/src)\/.+\.(ts|js)$/;

export default function precompilePlugin(filter: RegExp, moduleName = (path: string) => path): esbuild.Plugin {
  return {
    name: 'emberx:precompile-templates',
    setup(build) {
      build.onLoad({ filter }, async ({ path }) => ({
        contents: precompileTemplates(await readFile(path, 'utf8'), { moduleName: moduleName(path) }),
        loader: path.endsWith('.js') ? 'js' : 'ts',
      }));
    },
  };
}
