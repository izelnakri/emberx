/**
 * `emberx new <directory>`: an app, ready to run. See `emberx help new`.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import process from 'node:process';
import { readArgs, UsageError } from '../args.ts';
import { appFiles } from '../templates/app.ts';

const PACKAGE_MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'];

export async function run(args: string[]): Promise<number> {
  const { values, positionals } = readArgs(args, {
    ssr: { type: 'boolean' },
    'skip-install': { type: 'boolean' },
    'skip-git': { type: 'boolean' },
    'package-manager': { type: 'string' },
  });
  if (values.help) return (await import('./help.ts')).run(['new']);
  if (positionals.length !== 1) {
    throw new UsageError('give the directory to create the app in: `emberx new my-app`.');
  }

  const directory = resolve(positionals[0]);
  if (existsSync(directory) && readdirSync(directory).length > 0) {
    throw new UsageError(`${positionals[0]} is not empty: give a new directory, or an empty one.`);
  }
  // A package name: lowercase, and of the characters npm takes.
  const name =
    basename(directory)
      .toLowerCase()
      .replace(/[^a-z0-9-._~]+/g, '-')
      .replace(/^[-._]+/, '') || 'app';
  const packageManager = (values['package-manager'] as string | undefined) ?? invokedBy();
  if (!PACKAGE_MANAGERS.includes(packageManager)) {
    throw new UsageError(`--package-manager is one of ${PACKAGE_MANAGERS.join(', ')}, not ${packageManager}.`);
  }

  const where = relative(process.cwd(), directory) || '.';
  console.log(`creating ${name} in ${where}/`);
  for (const [path, contents] of Object.entries(appFiles(name, { ssr: Boolean(values.ssr) }))) {
    mkdirSync(dirname(join(directory, path)), { recursive: true });
    writeFileSync(join(directory, path), contents);
    console.log(`  create ${path}`);
  }

  if (!values['skip-git'] && spawnSync('git', ['--version']).status === 0 && !insideGitRepository(directory)) {
    spawnSync('git', ['init', '--quiet'], { cwd: directory });
    console.log('  git init');
  }
  if (!values['skip-install']) {
    console.log(`\n${packageManager} install`);
    const { status } = spawnSync(packageManager, ['install'], {
      cwd: directory,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    if (status !== 0)
      console.error(`\n${packageManager} install failed: run it in ${where}/ once the problem is fixed.`);
  }

  const script = (name: string) => (packageManager === 'npm' ? `npm run ${name}` : `${packageManager} ${name}`);
  console.log(`
${name} is ready:

  cd ${where}${values['skip-install'] ? `\n  ${packageManager} install` : ''}
  ${script('dev').padEnd(18)}serve it on http://localhost:4200, reloaded on every change
  ${(packageManager === 'npm' ? 'npm test' : script('test')).padEnd(18)}run its tests
  ${script('build').padEnd(18)}build it for production, into dist/${values.ssr ? `\n  ${script('start').padEnd(18)}serve dist/, each page rendered on the server` : ''}
`);
  return 0;
}

/** The package manager `npm create`, `pnpm dlx` and the like ran emberx with, or npm. */
function invokedBy(): string {
  const agent = process.env.npm_config_user_agent?.split('/')[0] ?? '';
  return PACKAGE_MANAGERS.includes(agent) ? agent : 'npm';
}

function insideGitRepository(directory: string): boolean {
  return spawnSync('git', ['rev-parse', '--is-inside-work-tree'], { cwd: directory }).status === 0;
}
