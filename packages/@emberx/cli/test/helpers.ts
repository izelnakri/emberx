import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('../../../../', import.meta.url)));
const CLI = join(ROOT, 'packages/@emberx/cli/src/cli.ts');
/** Under the repository, so an app's imports resolve to the workspace's @emberx packages, as if installed. */
const SANDBOX = join(ROOT, 'tmp/cli-test');

export interface Result {
  status: number | null;
  stdout: string;
  stderr: string;
}

/** Runs `emberx ...args` in `cwd`, as a user does. */
export function emberx(
  args: string[],
  { cwd = SANDBOX, env = {} }: { cwd?: string; env?: Record<string, string> } = {},
): Result {
  mkdirSync(SANDBOX, { recursive: true });
  const { status, stdout, stderr } = spawnSync(process.execPath, [CLI, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1', ...env },
  });
  return { status, stdout, stderr };
}

/**
 * Starts `emberx ...args`, a server, `emberx dev` or `emberx serve`, on a port of its own:
 * resolves with its origin once it listens, and stop(), which stops it.
 */
export async function startEmberx(args: string[], cwd: string): Promise<{ origin: string; stop(): void }> {
  const port = 4800 + Math.floor(Math.random() * 1000);
  const child = spawn(process.execPath, [CLI, ...args, '--port', String(port)], {
    cwd,
    env: { ...process.env, NO_COLOR: '1' },
  });
  const origin = `http://localhost:${port}`;
  let output = '';
  await new Promise<void>((resolve, reject) => {
    child.stdout.on('data', (chunk) => (output += chunk) && output.includes(origin) && resolve());
    child.stderr.on('data', (chunk) => (output += chunk));
    child.on('exit', () => reject(new Error(`emberx ${args.join(' ')} exited:\n${output}`)));
  });
  return { origin, stop: () => child.kill('SIGINT') };
}

/** A new directory for one test, under the repository. */
export function sandbox(): string {
  mkdirSync(SANDBOX, { recursive: true });
  return mkdtempSync(join(SANDBOX, 'app-'));
}

/** An app `emberx new` made, in a sandbox: its directory. */
export function newApp(...flags: string[]): string {
  const directory = join(sandbox(), 'my-app');
  const { status, stderr } = emberx(['new', directory, '--skip-install', '--skip-git', ...flags]);
  if (status !== 0) throw new Error(stderr);
  return directory;
}

export function removeSandbox(): void {
  rmSync(SANDBOX, { recursive: true, force: true });
}
