#!/usr/bin/env -S deno run -A
/**
 * The standalone `emberx` binaries a release attaches, as qunitx-cli's: an archive per platform,
 * with SHA256SUMS, which install.sh and `emberx upgrade` check, in dist/cli-binaries/.
 *
 *   deno run -A scripts/build-cli-binaries.ts                   # every platform
 *   deno run -A scripts/build-cli-binaries.ts linux-x64-musl    # some
 *   deno run -A scripts/build-cli-binaries.ts --host            # this machine's, for a smoke test
 *
 * The CLI is bundled first, in cli.js and its chunks: compiled from the repository, a binary
 * would embed its whole node_modules. Each archive has esbuild's binary beside the CLI's, which
 * the CLI runs, as no node_modules has it.
 *
 * Most platforms get the bundle `deno compile`d, with esbuild's JavaScript imported from npm at
 * the version installed here. Deno links glibc, so Alpine and the other musl systems get node
 * instead, musl's build of it, with the bundle, esbuild's JavaScript in it, and the two libraries
 * node links that bare Alpine lacks, which node finds beside it, patchelf'd:
 *
 *   emberx              the launcher: lib/node lib/cli.js
 *   lib/node, lib/cli.js and its chunks, lib/esbuild, lib/libstdc++.so.6, lib/libgcc_s.so.1
 *
 * Any machine builds every one of them: the musl ones need patchelf.
 */
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { chmodSync, cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const STAGE = `${ROOT}/tmp/cli-binary`;
const OUT = `${ROOT}/dist/cli-binaries`;
const ESBUILD_VERSION: string = JSON.parse(readFileSync(`${ROOT}/node_modules/esbuild/package.json`, 'utf8')).version;
/** The node the musl binaries run: the one the repository is tested with. */
const NODE_VERSION = run('node', ['--version']).trim();
/** Where libstdc++ and libgcc_s come from for musl: Alpine's own packages. */
const ALPINE = 'https://dl-cdn.alpinelinux.org/alpine/v3.22/main';
/** Each platform: esbuild's package with its binary, and Deno's target for it, or Alpine's architecture. */
const TARGETS: Record<string, { esbuild: string; deno?: string; alpine?: string }> = {
  'linux-x64': { esbuild: 'linux-x64', deno: 'x86_64-unknown-linux-gnu' },
  'linux-arm64': { esbuild: 'linux-arm64', deno: 'aarch64-unknown-linux-gnu' },
  'linux-x64-musl': { esbuild: 'linux-x64', alpine: 'x86_64' },
  'linux-arm64-musl': { esbuild: 'linux-arm64', alpine: 'aarch64' },
  'macos-x64': { esbuild: 'darwin-x64', deno: 'x86_64-apple-darwin' },
  'macos-arm64': { esbuild: 'darwin-arm64', deno: 'aarch64-apple-darwin' },
  'windows-x64': { esbuild: 'win32-x64', deno: 'x86_64-pc-windows-msvc' },
};
const LAUNCHER = `#!/bin/sh
# emberx for musl systems: node, and the libraries it links, are in lib/ beside this file.
root="$(dirname "$(readlink -f "$0")")"
exec "$root/lib/node" "$root/lib/cli.js" "$@"
`;

const args = Deno.args.filter((arg) => arg !== '--host');
const targets = Deno.args.includes('--host') ? [hostTarget()] : args.length > 0 ? args : Object.keys(TARGETS);
for (const target of targets) {
  if (!TARGETS[target]) throw new Error(`no binary for "${target}": ${Object.keys(TARGETS).join(', ')}`);
}

rmSync(STAGE, { recursive: true, force: true });
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

if (targets.some((target) => TARGETS[target].deno)) {
  await bundle('deno');
  writeFileSync(`${STAGE}/deno/deno.json`, JSON.stringify({ imports: { esbuild: `npm:esbuild@${ESBUILD_VERSION}` } }));
}
if (targets.some((target) => TARGETS[target].alpine)) await bundle('musl');
await esbuild.stop();

const sums: string[] = [];
for (const target of targets) {
  const { esbuild: platform, deno, alpine } = TARGETS[target];
  const windows = target.startsWith('windows');
  const directory = `${STAGE}/${target}`;
  mkdirSync(directory, { recursive: true });

  if (deno) {
    run(Deno.execPath(), [
      'compile',
      '--allow-all',
      '--no-check',
      '--quiet',
      '--target',
      deno,
      '--config',
      `${STAGE}/deno/deno.json`,
      '--output',
      `${directory}/${windows ? 'emberx.exe' : 'emberx'}`,
      `${STAGE}/deno/cli.js`,
    ]);
    await sidecarEsbuild(platform, `${directory}/${windows ? 'esbuild.exe' : 'esbuild'}`);
  } else {
    cpSync(`${STAGE}/musl`, `${directory}/lib`, { recursive: true });
    await muslNode(target.replace(/-musl$/, ''), `${directory}/lib`);
    await alpineLibraries(alpine!, `${directory}/lib`);
    await sidecarEsbuild(platform, `${directory}/lib/esbuild`);
    writeFileSync(`${directory}/emberx`, LAUNCHER);
    chmodSync(`${directory}/emberx`, 0o755);
  }

  const archive = `emberx-${target}.tar.gz`;
  run('tar', ['-czf', `${OUT}/${archive}`, '-C', directory, ...readdirSync(directory)]);
  sums.push(`${sha256(readFileSync(`${OUT}/${archive}`))}  ${archive}`);
  console.log(`built ${archive}`);
}
writeFileSync(`${OUT}/SHA256SUMS`, `${sums.join('\n')}\n`);

/**
 * The CLI, bundled for `deno compile`, with esbuild imported, or for node on musl, with esbuild
 * in it: in each, a command is a chunk cli.js imports when it runs, as in the source, as esbuild
 * reads ESBUILD_BINARY_PATH, which cli.js sets, when it is loaded.
 */
async function bundle(kind: 'deno' | 'musl'): Promise<void> {
  await esbuild.build({
    entryPoints: [`${ROOT}/packages/@emberx/cli/src/cli.ts`],
    outdir: `${STAGE}/${kind}`,
    bundle: true,
    splitting: true,
    platform: 'node',
    format: 'esm',
    target: 'es2022',
    external: kind === 'deno' ? ['esbuild'] : [],
    define: { EMBERX_STANDALONE: JSON.stringify(kind) },
    // esbuild's JavaScript is CommonJS, which require()s node's modules.
    banner:
      kind === 'musl'
        ? { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" }
        : {},
    logLevel: 'warning',
  });
  if (kind === 'musl') writeFileSync(`${STAGE}/musl/package.json`, '{ "type": "module" }\n');
}

/** musl's node, from the Node.js build team's unofficial builds, checked against their SHASUMS256.txt, in `directory`. */
async function muslNode(platform: string, directory: string): Promise<void> {
  const base = `https://unofficial-builds.nodejs.org/download/release/${NODE_VERSION}`;
  const name = `node-${NODE_VERSION}-${platform}-musl`;
  const sums = new TextDecoder().decode(await download(`${base}/SHASUMS256.txt`));
  const tarball = await download(`${base}/${name}.tar.gz`);
  if (!sums.split('\n').includes(`${sha256(tarball)}  ${name}.tar.gz`)) {
    throw new Error(`${name}.tar.gz's sha256 is not the one its SHASUMS256.txt gives`);
  }

  writeFileSync(`${directory}/node.tar.gz`, tarball);
  run('tar', ['-xzf', `${directory}/node.tar.gz`, '-C', directory, `${name}/bin/node`]);
  Deno.renameSync(`${directory}/${name}/bin/node`, `${directory}/node`);
  rmSync(`${directory}/${name}`, { recursive: true });
  rmSync(`${directory}/node.tar.gz`);
  // Its libraries are beside it, not in /usr/lib, which bare Alpine has not got them in.
  run('patchelf', ['--set-rpath', '$ORIGIN', `${directory}/node`]);
}

/** libstdc++ and libgcc_s, which node links and bare Alpine lacks, from Alpine's packages, in `directory`. */
async function alpineLibraries(arch: string, directory: string): Promise<void> {
  const index = `${directory}/APKINDEX.tar.gz`;
  writeFileSync(index, await download(`${ALPINE}/${arch}/APKINDEX.tar.gz`));
  const packages = run('tar', ['-xzOf', index, 'APKINDEX']);
  rmSync(index);

  for (const [name, library] of [
    ['libstdc++', 'libstdc++.so.6'],
    ['libgcc', 'libgcc_s.so.1'],
  ]) {
    const version = new RegExp(`^P:${name.replace(/\+/g, '\\+')}\\nV:(.+)$`, 'm').exec(packages)?.[1];
    if (!version) throw new Error(`Alpine's ${arch} index has no ${name}`);

    const apk = `${directory}/${name}.apk`;
    writeFileSync(apk, await download(`${ALPINE}/${arch}/${name}-${version}.apk`));
    // An .apk is gzipped tarballs, one after the other, which tar reads as one: the library is a link to its file.
    const unpacked = `${directory}/${name}`;
    mkdirSync(unpacked);
    run('tar', ['-xzf', apk, '-C', unpacked]);
    cpSync(Deno.realPathSync(`${unpacked}/usr/lib/${library}`), `${directory}/${library}`);
    rmSync(unpacked, { recursive: true });
    rmSync(apk);
  }
}

/** esbuild's binary for `platform`, from its npm package at the version the CLI imports, at `path`. */
async function sidecarEsbuild(platform: string, path: string): Promise<void> {
  const tarball = `${dirname(path)}/esbuild.tgz`;
  writeFileSync(
    tarball,
    await download(`https://registry.npmjs.org/@esbuild/${platform}/-/${platform}-${ESBUILD_VERSION}.tgz`),
  );
  const inside = platform.startsWith('win32') ? 'package/esbuild.exe' : 'package/bin/esbuild';
  run('tar', ['-xzf', tarball, '-C', dirname(path), inside]);
  Deno.renameSync(`${dirname(path)}/${inside}`, path);
  rmSync(tarball);
  rmSync(`${dirname(path)}/package`, { recursive: true, force: true });
}

/** This machine's target. */
function hostTarget(): string {
  const os = { darwin: 'macos', linux: 'linux', windows: 'windows' }[Deno.build.os as string];
  return `${os}-${Deno.build.arch === 'aarch64' ? 'arm64' : 'x64'}`;
}

async function download(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

function sha256(contents: Uint8Array): string {
  return createHash('sha256').update(contents).digest('hex');
}

/** Runs `command`, and returns what it printed: it throws when it fails. */
function run(command: string, args: string[]): string {
  const { status, stdout, stderr } = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (status !== 0) throw new Error(`${command} ${args.join(' ')} exited with ${status}\n${stderr}`);
  return stdout;
}
