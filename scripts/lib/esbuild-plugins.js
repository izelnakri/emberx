/**
 * The esbuild plugin the node suite, the dev server and the doctests share.
 */
/**
 * Every emberx package is consumed by the others through its bare specifier
 * (`@emberx/component`, not a relative path). When building or testing from a
 * checkout we want those to resolve to the workspace *sources*, so a change in
 * one package is picked up without an intermediate publish or build step.
 *
 * @param {string} rootDir absolute path to the repository root
 * @param {string[]} packageNames e.g. ['component', 'router']
 */
export function emberxWorkspacePlugin(rootDir, packageNames) {
  const filter = new RegExp(`^@emberx/(${packageNames.join('|')})(/.*)?$`);

  return {
    name: 'emberx:workspace-sources',
    setup(build) {
      build.onResolve({ filter }, async (args) => {
        const { stat } = await import('node:fs/promises');
        const [, name, subpath] = args.path.match(filter);
        const base = `${rootDir}/packages/@emberx/${name}`;

        // Bare package specifier -> the package's own entry point.
        if (!subpath) return { path: `${base}/src/index.ts` };

        // Subpath import. `@emberx/component/test` is a directory of test
        // modules with an index; `@emberx/helper/object/assign` is a file.
        // Try each candidate in the order node/TypeScript would.
        const target = `${base}${subpath}`;
        const candidates = [`${target}.ts`, `${target}.js`, `${target}/index.ts`, `${target}/index.js`, target];

        for (const candidate of candidates) {
          try {
            const stats = await stat(candidate);
            if (stats.isFile()) return { path: candidate };
          } catch {
            // Not this one; keep looking.
          }
        }

        return {
          errors: [
            {
              text: `Cannot resolve "${args.path}" to a file under ${base}. ` + `Tried: ${candidates.join(', ')}`,
            },
          ],
        };
      });
    },
  };
}
