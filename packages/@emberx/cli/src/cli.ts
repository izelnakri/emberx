#!/usr/bin/env node
/**
 * emberx: create, develop, build and test emberx apps. `emberx help` lists the commands.
 */
import { existsSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import process from 'node:process';
import { UsageError } from './args.ts';
import { VERSION } from './version.ts';

/** Each command's module, imported only when it runs: `emberx --version` loads no esbuild. */
const COMMANDS: Record<string, () => Promise<{ run(args: string[]): Promise<number> }>> = {
  new: () => import('./commands/new.ts'),
  generate: () => import('./commands/generate.ts'),
  dev: () => import('./commands/dev.ts'),
  build: () => import('./commands/build.ts'),
  test: () => import('./commands/test.ts'),
  upgrade: () => import('./commands/upgrade.ts'),
  help: () => import('./commands/help.ts'),
};
const ALIASES: Record<string, string> = { g: 'generate', s: 'dev', serve: 'dev', b: 'build', t: 'test' };

useSidecarEsbuild();

const [given = 'help', ...args] = process.argv.slice(2);
const command = ['-h', '--help'].includes(given) ? 'help' : (ALIASES[given] ?? given);

if (['-v', '--version', 'version'].includes(command)) {
  console.log(VERSION);
} else if (!COMMANDS[command]) {
  console.error(`emberx: there is no "${given}" command. \`emberx help\` lists them.`);
  process.exitCode = 2;
} else {
  try {
    process.exitCode = await (await COMMANDS[command]()).run(args);
  } catch (error) {
    if (!(error instanceof UsageError)) throw error;

    console.error(`emberx ${command}: ${error.message}\n\`emberx help ${command}\` shows how it is used.`);
    process.exitCode = 2;
  }
}

/**
 * The standalone binary (`deno compile`) cannot run the esbuild binary inside it, so its release
 * ships one beside it, as qunitx-cli's does: esbuild runs that one, unless ESBUILD_BINARY_PATH
 * names another.
 */
function useSidecarEsbuild(): void {
  const runtime = (globalThis as { Deno?: { execPath(): string } }).Deno;
  if (!runtime || process.env.ESBUILD_BINARY_PATH) return;

  const executable = runtime.execPath();
  const sidecar = join(dirname(executable), process.platform === 'win32' ? 'esbuild.exe' : 'esbuild');
  if (!/^deno(\.exe)?$/.test(basename(executable)) && existsSync(sidecar)) {
    process.env.ESBUILD_BINARY_PATH = sidecar;
  }
}
