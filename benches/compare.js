#!/usr/bin/env node
/**
 * Compares this tree's benchmarks against a base commit, measured on this
 * machine in the same run.
 *
 *   node benches/compare.js            base: where HEAD left origin/main
 *   node benches/compare.js v0.1.0     base: any commit-ish
 *
 * A baseline recorded on another machine says nothing about this one, and a
 * shared CI runner can be 2-3x slower than a laptop. So nothing is committed:
 * the base commit is checked out into a temporary worktree, installed, built and
 * measured, then this tree is measured right after, and the two are compared
 * with benches/index.js --check. Uncommitted changes in this tree are included.
 *
 * When the base has no benchmark suite there is nothing to compare against, so
 * this tree's numbers are printed and the run passes. The same happens when the
 * base resolves to HEAD itself, which is where it lands on main; there the
 * previous commit is used instead.
 */
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WORKTREE = resolve(ROOT, 'tmp', 'bench-base');
const BASE_RESULTS = resolve(WORKTREE, 'benches', 'results.json');

function git(...args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

/** Runs a command with output streamed, and throws its exit status if it fails. */
function run(command, args, options = {}) {
  const { status } = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });
  if (status !== 0) throw Object.assign(new Error(`${command} ${args.join(' ')} failed`), { status: status ?? 1 });
}

function resolveBase() {
  const head = git('rev-parse', 'HEAD');
  const requested = process.argv[2];

  if (requested) return git('rev-parse', '--verify', `${requested}^{commit}`);

  const mergeBase = git('merge-base', 'HEAD', 'origin/main');
  return mergeBase === head ? git('rev-parse', 'HEAD~1') : mergeBase;
}

async function removeWorktree() {
  if (existsSync(WORKTREE)) spawnSync('git', ['worktree', 'remove', '--force', WORKTREE], { cwd: ROOT });
  await rm(WORKTREE, { recursive: true, force: true });
  spawnSync('git', ['worktree', 'prune'], { cwd: ROOT });
}

const base = resolveBase();
const label = `${base.slice(0, 7)} (${git('log', '-1', '--format=%s', base)})`;

if (spawnSync('git', ['cat-file', '-e', `${base}:benches/index.js`], { cwd: ROOT }).status !== 0) {
  process.stdout.write(`Base ${label} has no benchmark suite; printing this tree's numbers only.\n\n`);
  run('npm', ['run', 'build:dev'], { cwd: ROOT });
  run('node', ['benches/index.js'], { cwd: ROOT });
  process.exit(0);
}

process.stdout.write(`Measuring base ${label}, then this tree.\n\n`);

// A failed command ends the run with its exit status, after the worktree is removed.
let exitCode = 0;
await removeWorktree();
try {
  run('git', ['worktree', 'add', '--detach', '--quiet', WORKTREE, base], { cwd: ROOT });
  run('npm', ['ci', '--no-audit', '--no-fund', '--loglevel=error'], { cwd: WORKTREE });
  run('npm', ['run', 'build:dev'], { cwd: WORKTREE });

  process.stdout.write(`\n── base ${label}\n`);
  run('node', ['benches/index.js', '--save'], { cwd: WORKTREE });

  run('npm', ['run', 'build:dev'], { cwd: ROOT });

  process.stdout.write('\n── this tree\n');
  run('node', ['benches/index.js', '--check'], {
    cwd: ROOT,
    env: { ...process.env, BENCH_RESULTS: BASE_RESULTS },
  });
} catch (error) {
  exitCode = error.status ?? 1;
} finally {
  await removeWorktree();
}
process.exit(exitCode);
