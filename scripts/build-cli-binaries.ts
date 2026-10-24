#!/usr/bin/env -S deno run -A
/**
 * The standalone `emberx` binaries a release attaches, as qunitx-cli's: for each platform an
 * archive of the binary, `deno compile`d, and the esbuild binary it runs, with SHA256SUMS,
 * which install.sh and `emberx upgrade` check, in dist/cli-binaries/.
 *
 *   deno run -A scripts/build-cli-binaries.ts               # every platform
 *   deno run -A scripts/build-cli-binaries.ts linux-x64     # some
 *   deno run -A scripts/build-cli-binaries.ts --host        # this machine's, for a smoke test
 *
 * The CLI is bundled first, everything but esbuild, in cli.js and its chunks: compiled from the repository,
 * the binary would embed its whole node_modules. esbuild's JavaScript is imported from npm, at
 * the version installed here, and its binary is shipped beside the CLI's, as the one inside a
 * compiled binary cannot be run.
 */
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const STAGE = `${ROOT}/tmp/cli-binary`;
const OUT = `${ROOT}/dist/cli-binaries`;
const ESBUILD_VERSION: string = JSON.parse(readFileSync(`${ROOT}/node_modules/esbuild/package.json`, 'utf8')).version;
/** Each platform: Deno's target for it, and esbuild's package with its binary. */
const TARGETS: Record<string, { deno: string; esbuild: string }> = {
  'linux-x64': { deno: 'x86_64-unknown-linux-gnu', esbuild: 'linux-x64' },
  'linux-arm64': { deno: 'aarch64-unknown-linux-gnu', esbuild: 'linux-arm64' },
  'macos-x64': { deno: 'x86_64-apple-darwin', esbuild: 'darwin-x64' },
  'macos-arm64': { deno: 'aarch64-apple-darwin', esbuild: 'darwin-arm64' },
  'windows-x64': { deno: 'x86_64-pc-windows-msvc', esbuild: 'win32-x64' },
};

const args = Deno.args.filter((arg) => arg !== '--host');
const host = `${{ darwin: 'macos', linux: 'linux', windows: 'windows' }[Deno.build.os as string]}-${Deno.build.arch === 'aarch64' ? 'arm64' : 'x64'}`;
const targets = Deno.args.includes('--host') ? [host] : args.length > 0 ? args : Object.keys(TARGETS);
for (const target of targets) {
  if (!TARGETS[target]) throw new Error(`no binary for "${target}": ${Object.keys(TARGETS).join(', ')}`);
}

rmSync(STAGE, { recursive: true, force: true });
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

await esbuild.build({
  entryPoints: [`${ROOT}/packages/@emberx/cli/src/cli.ts`],
  outdir: STAGE,
  bundle: true,
  // Each command a chunk cli.js imports when it runs, as in the source: esbuild reads
  // ESBUILD_BINARY_PATH when it is imported, which must come after cli.js sets it.
  splitting: true,
  platform: 'node',
  format: 'esm',
  target: 'es2022',
  external: ['esbuild'],
  logLevel: 'warning',
});
await esbuild.stop();
writeFileSync(`${STAGE}/deno.json`, JSON.stringify({ imports: { esbuild: `npm:esbuild@${ESBUILD_VERSION}` } }));

const sums: string[] = [];
for (const target of targets) {
  const { deno, esbuild: platform } = TARGETS[target];
  const windows = target.startsWith('windows');
  const directory = `${STAGE}/${target}`;
  mkdirSync(directory, { recursive: true });

  run(Deno.execPath(), [
    'compile',
    '--allow-all',
    '--no-check',
    '--quiet',
    '--target',
    deno,
    '--config',
    `${STAGE}/deno.json`,
    '--output',
    `${directory}/${windows ? 'emberx.exe' : 'emberx'}`,
    `${STAGE}/cli.js`,
  ]);
  await sidecarEsbuild(platform, `${directory}/${windows ? 'esbuild.exe' : 'esbuild'}`);

  const archive = `emberx-${target}.tar.gz`;
  run('tar', [
    '-czf',
    `${OUT}/${archive}`,
    '-C',
    directory,
    ...(windows ? ['emberx.exe', 'esbuild.exe'] : ['emberx', 'esbuild']),
  ]);
  sums.push(
    `${createHash('sha256')
      .update(readFileSync(`${OUT}/${archive}`))
      .digest('hex')}  ${archive}`,
  );
  console.log(`built ${archive}`);
}
writeFileSync(`${OUT}/SHA256SUMS`, `${sums.join('\n')}\n`);

/** esbuild's binary for `platform`, from its npm package at the version the CLI imports, at `path`. */
async function sidecarEsbuild(platform: string, path: string): Promise<void> {
  const name = `@esbuild/${platform}`;
  const response = await fetch(`https://registry.npmjs.org/${name}/-/${platform}-${ESBUILD_VERSION}.tgz`);
  if (!response.ok) throw new Error(`${name}@${ESBUILD_VERSION}: the npm registry answered ${response.status}`);

  const tarball = `${dirname(path)}/esbuild.tgz`;
  writeFileSync(tarball, new Uint8Array(await response.arrayBuffer()));
  const inside = platform.startsWith('win32') ? 'package/esbuild.exe' : 'package/bin/esbuild';
  run('tar', ['-xzf', tarball, '-C', dirname(path), inside]);
  Deno.renameSync(`${dirname(path)}/${inside}`, path);
  rmSync(tarball);
  rmSync(`${dirname(path)}/package`, { recursive: true, force: true });
}

function run(command: string, args: string[]): void {
  const { status } = spawnSync(command, args, { stdio: 'inherit' });
  if (status !== 0) throw new Error(`${command} ${args.join(' ')} exited with ${status}`);
}
