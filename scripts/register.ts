/**
 * Lets node run emberx's sources as they are:
 *
 *   node --import ./scripts/register.ts <file.ts>
 *
 * In the repo each @emberx/* package's exports point at its src/, and node
 * strips their types. What it cannot do is run decorators (@tracked, @action,
 * @service), which no JavaScript engine does yet, node 26's included; this hook
 * has esbuild compile a file that has them, as the build does. Every other
 * file is left to node.
 *
 * EMBERX_PACKAGES_FROM=<dir> resolves @emberx/* from <dir>'s node_modules
 * instead, as scripts/test-release.sh does to test the packed tarballs.
 */
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { transformSync } from 'esbuild';

const packagesFrom = process.env.EMBERX_PACKAGES_FROM
  ? pathToFileURL(`${resolve(process.env.EMBERX_PACKAGES_FROM)}/package.json`).href
  : null;

registerHooks({
  resolve(specifier, context, nextResolve) {
    return packagesFrom && specifier.startsWith('@emberx/')
      ? nextResolve(specifier, { ...context, parentURL: packagesFrom })
      : nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (!url.startsWith('file:') || !url.endsWith('.ts') || url.includes('/node_modules/')) {
      return nextLoad(url, context);
    }
    const source = readFileSync(fileURLToPath(url), 'utf8');
    if (!/^\s*@\w/m.test(source)) return nextLoad(url, context);

    const { code } = transformSync(source, {
      loader: 'ts',
      format: 'esm',
      target: 'es2022',
      sourcemap: 'inline',
      sourcefile: fileURLToPath(url),
      tsconfigRaw: {},
    });
    return { format: 'module', source: code, shortCircuit: true };
  },
});
