/**
 * An esbuild plugin that compiles the `hbs` templates of an app's modules at build time, with
 * @emberx/component/precompile. A package in node_modules is left alone: the @emberx ones ship
 * theirs compiled. So is @emberx/vendor, Ember's own code, which has none.
 */
import { readFile } from 'node:fs/promises';
import type * as esbuild from 'esbuild';
import { precompileTemplates } from '@emberx/component/precompile';

/** The modules a template can be in: every JavaScript and TypeScript module. */
export const TEMPLATE_MODULES: RegExp = /\.[cm]?[jt]sx?$/;

/** The modules left as they are: esbuild's filters have no lookahead, so they are checked here. */
const SKIPPED = /[\\/](node_modules|@emberx[\\/]vendor)[\\/]/;

export default function precompilePlugin(
  filter: RegExp = TEMPLATE_MODULES,
  moduleName: (path: string) => string = (path) => path,
): esbuild.Plugin {
  return {
    name: 'emberx:precompile-templates',
    setup(build) {
      build.onLoad({ filter }, async ({ path }) => {
        if (SKIPPED.test(path)) return undefined;

        return {
          contents: precompileTemplates(await readFile(path, 'utf8'), { moduleName: moduleName(path) }),
          loader: /\.[cm]?jsx?$/.test(path) ? 'js' : 'ts',
        };
      });
    },
  };
}
