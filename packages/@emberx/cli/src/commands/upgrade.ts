/**
 * `emberx upgrade [version]`: emberx at [version], or the latest. See `emberx help upgrade`.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { readArgs, UsageError } from '../args.ts';
import { findProject } from '../project.ts';
import { STANDALONE } from '../standalone.ts';
import { VERSION } from '../version.ts';

/** Where the releases are: GitHub's, or a mirror of them laid out the same way, as install.sh's RELEASES_URL. */
const RELEASES = process.env.EMBERX_RELEASES_URL ?? 'https://github.com/izelnakri/emberx/releases';
const REGISTRY = 'https://registry.npmjs.org/@emberx/cli';

export async function run(args: string[]): Promise<number> {
  const { values, positionals } = readArgs(args, { check: { type: 'boolean' } });
  if (values.help) return (await import('./help.ts')).run(['upgrade']);

  const requested = positionals[0]?.replace(/^v/, '');
  if (requested && !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(requested)) {
    throw new UsageError(`${positionals[0]} is no version: give one as 0.6.0.`);
  }
  const version = requested ?? (await latestVersion());
  const newer = compareVersions(version, VERSION) > 0;

  if (values.check) {
    console.log(
      newer
        ? `emberx ${version} is out: you have ${VERSION}. \`emberx upgrade\` installs it.`
        : `emberx ${VERSION} is the latest.`,
    );
    return newer ? 1 : 0;
  } else if (version === VERSION) {
    console.log(`emberx ${VERSION} is the version you have.`);
    return 0;
  }

  const runtime = (globalThis as { Deno?: { execPath(): string } }).Deno;
  if (STANDALONE) {
    return await replaceBinary(version);
  } else if (runtime) {
    const command = [
      'install',
      '--global',
      '--allow-all',
      '--force',
      '--name',
      'emberx',
      `jsr:@izelnakri/emberx-cli@${version}/cli`,
    ];
    console.log(`deno ${command.join(' ')}`);
    return spawnSync(runtime.execPath(), command, { stdio: 'inherit' }).status ?? 1;
  }

  // npm owns the project's node_modules: the @emberx packages share a version, so all of them move.
  const manifest = JSON.parse(readFileSync(join(findProject().root, 'package.json'), 'utf8'));
  const packages = Object.keys({ ...manifest.dependencies, ...manifest.devDependencies }).filter((name) =>
    name.startsWith('@emberx/'),
  );
  const names = packages.length > 0 ? packages : ['@emberx/cli'];
  console.log(
    `emberx ${version} is out. Upgrade the project's @emberx packages together:\n\n  npm install ${names.map((name) => `${name}@${version}`).join(' ')}`,
  );
  return 0;
}

async function latestVersion(): Promise<string> {
  const response = await fetch(`${REGISTRY}/latest`);
  if (!response.ok) throw new Error(`the npm registry answered ${response.status} for @emberx/cli.`);
  return (await response.json()).version;
}

/** -1, 0 or 1 as `a` is older than, the same as, or newer than `b`. */
function compareVersions(a: string, b: string): number {
  const [left, right] = [a, b].map((version) => version.split(/[.-]/).slice(0, 3).map(Number));
  for (let index = 0; index < 3; index++) {
    if (left[index] !== right[index]) return left[index] > right[index] ? 1 : -1;
  }
  return 0;
}

/**
 * Downloads the release's binary for this platform, checks its sha256, and puts it in place of
 * this one: the binary and its esbuild, or for musl, the directory with node and the libraries.
 */
async function replaceBinary(version: string): Promise<number> {
  const os = { darwin: 'macos', linux: 'linux', win32: 'windows' }[process.platform as string];
  const arch = { x64: 'x64', arm64: 'arm64' }[process.arch as string];
  if (!os || !arch) throw new Error(`no emberx binary is published for ${process.platform} ${process.arch}.`);

  const asset = `emberx-${os}-${arch}${STANDALONE === 'musl' ? '-musl' : ''}.tar.gz`;
  console.log(`downloading ${RELEASES}/download/v${version}/${asset}`);
  const [archive, sums] = await Promise.all([
    download(`${RELEASES}/download/v${version}/${asset}`),
    download(`${RELEASES}/download/v${version}/SHA256SUMS`),
  ]);
  const expected = new TextDecoder()
    .decode(sums)
    .split('\n')
    .find((line) => line.trim().endsWith(asset))
    ?.split(/\s+/)[0];
  const actual = createHash('sha256').update(archive).digest('hex');
  if (!expected || expected !== actual) {
    throw new Error(
      `${asset}'s sha256 is ${actual}, not the release's ${expected ?? '(missing)'}: nothing was replaced.`,
    );
  }

  // musl's process.execPath is lib/node, in the directory install.sh made, which is replaced whole.
  const musl = STANDALONE === 'musl';
  const installed = musl ? dirname(dirname(process.execPath)) : dirname(process.execPath);
  // Unpacked beside what it replaces, as a file is renamed only within its filesystem, which /tmp often is not.
  const directory = mkdtempSync(join(musl ? dirname(installed) : installed, '.emberx-upgrade-'));
  try {
    writeFileSync(join(directory, asset), archive);
    const unpacked = join(directory, 'emberx');
    mkdirSync(unpacked);
    // Windows 10 and later have tar too.
    if (spawnSync('tar', ['-xzf', join(directory, asset), '-C', unpacked], { stdio: 'inherit' }).status !== 0) {
      throw new Error(`could not unpack ${asset}.`);
    }
    const replaced = musl
      ? [[unpacked, installed]]
      : (os === 'windows' ? ['emberx.exe', 'esbuild.exe'] : ['emberx', 'esbuild']).map((file) => [
          join(unpacked, file),
          join(installed, file),
        ]);
    for (const [source, target] of replaced) {
      // A running executable can be renamed, not written over, on Windows.
      if (existsSync(target)) renameSync(target, `${target}.old`);
      renameSync(source, target);
      try {
        rmSync(`${target}.old`, { recursive: true, force: true });
      } catch {
        // Windows keeps a running executable's file until it exits: the next upgrade removes it.
      }
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }

  console.log(`emberx ${VERSION} is now ${version}.`);
  return 0;
}

async function download(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} answered ${response.status}.`);
  return new Uint8Array(await response.arrayBuffer());
}
