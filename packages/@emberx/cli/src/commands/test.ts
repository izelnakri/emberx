/**
 * `emberx test [qunitx options…]`: the app's tests, run by qunitx-cli. See `emberx help test`.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { delimiter, dirname, join } from 'node:path';
import process from 'node:process';
import { findProject } from '../project.ts';

export async function run(args: string[]): Promise<number> {
  if (args[0] === '--help' || args[0] === '-h') return (await import('./help.ts')).run(['test']);

  const project = findProject();
  const name = process.platform === 'win32' ? 'qunitx.cmd' : 'qunitx';
  // The project's, a workspace's above it, or one on PATH: found here, as a shell that cannot find it fails alike.
  const qunitx =
    findBin(project.root, name) ??
    (process.env.PATH ?? '')
      .split(delimiter)
      .map((directory) => join(directory, name))
      .find(existsSync);
  if (!qunitx) {
    console.error(
      'emberx test runs your tests with qunitx-cli, which this project does not have:\n  npm install --save-dev qunitx qunitx-cli',
    );
    return 1;
  }
  // Its own files and folders, or tests/: every option is qunitx-cli's, passed on as it is.
  const given = args.some((arg) => !arg.startsWith('-')) ? args : ['tests/', ...args];

  return await new Promise<number>((resolve) => {
    const child = spawn(qunitx, given, { cwd: project.root, stdio: 'inherit', shell: process.platform === 'win32' });
    child.on('error', (error) => {
      console.error(`emberx test: ${qunitx} did not start: ${error.message}`);
      resolve(1);
    });
    child.on('exit', (code, signal) => resolve(code ?? (signal ? 1 : 0)));
  });
}

/** `name` in node_modules/.bin, from `directory` up, as a workspace's hoisted dependencies are: or undefined. */
function findBin(directory: string, name: string): string | undefined {
  for (let current = directory; ; current = dirname(current)) {
    const bin = join(current, 'node_modules', '.bin', name);
    if (existsSync(bin)) return bin;
    if (dirname(current) === current) return undefined;
  }
}
