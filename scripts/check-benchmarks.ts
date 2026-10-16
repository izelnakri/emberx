#!/usr/bin/env -S deno run --allow-all
/**
 * Benchmark regression checker for emberx, adapted from qunitx-cli's
 * scripts/check-benchmarks.ts: same modes, environment variables, retry logic
 * and table. What differs is marked "emberx:" below.
 *
 * Modes
 * -----
 * Default
 *   Runs each bench file in an isolated `deno bench --json` subprocess (so GC
 *   pressure from one group cannot inflate another) and compares each
 *   benchmark's average against the baseline in benches/results.json. A result
 *   is a regression only when BOTH conditions hold:
 *     1. percentage increase > effective threshold
 *     2. absolute delta > MIN_ABS_DELTA_NS (guards sub-µs JIT/GC noise)
 *
 * --base [ref]
 *   Measures the baseline instead of reading it: checks `ref` out into a
 *   temporary worktree, installs it, runs its own suite there with --save,
 *   then checks this tree against those numbers. Both are measured on this
 *   machine in the same run, so the comparison is like for like and nothing is
 *   committed. Without a ref: where HEAD left origin/main, or HEAD~1 on main.
 *
 *   A regression that is the point of a change is accepted by a trailer in the
 *   commit that makes it, one per benchmark name or `group/` prefix:
 *
 *     Benchmark-Regression: template-compilation/createTemplate
 *     Benchmark-Regression: render/
 *
 *   Only the commits between the base and HEAD count, so the trailer accepts the
 *   regression on its own PR and in the release that ships it, and nowhere after.
 *
 * --save    Saves the measured values to benches/results.json (gitignored).
 * --print   Prints the measured values without checking or saving.
 * --files <file> [file…]   Bench files to run (default: benches/*.bench.ts).
 *
 * emberx: `*.chrome.bench.ts` files use Chrome.bench, Deno.bench's shape in a
 * real Chrome (scripts/lib/chrome-bench.js), and produce the same JSON, so they
 * are checked, retried and compared exactly like the Deno ones.
 *
 * Environment variables
 * ---------------------
 *   REGRESSION_THRESHOLD  percent threshold (default 26)
 *   MIN_ABS_DELTA_NS      absolute delta floor in nanoseconds (default 1000 = 1µs)
 *   SKIP_BENCHMARK        comma-separated bench-file basenames to skip (without
 *                         `.bench.ts`). `true|1|all` skips the whole gate.
 *
 * emberx: the packages are built first (`npm run build:dev`), so the benchmarks
 * measure the dist/ users get, and each bench file is bundled by esbuild before
 * it runs: a page in Chrome cannot resolve bare imports, and bundling the Deno
 * files the same way keeps both measuring the same code.
 */
import * as esbuild from 'esbuild';

const paint =
  (open: number, close: number) =>
  (text: string): string =>
    Deno.noColor ? text : `\x1b[${open}m${text}\x1b[${close}m`;

const bold = paint(1, 22);
const dim = paint(2, 22);
const red = paint(31, 39);
const green = paint(32, 39);
const yellow = paint(33, 39);
const gray = paint(90, 39);

const ROOT = new URL('..', import.meta.url).pathname;
const BASELINE_FILE = `${ROOT}benches/results.json`;
const BUNDLE_DIR = `${ROOT}tmp/benches`;
const BASE_WORKTREE = `${ROOT}tmp/bench-base`;

interface BenchResult {
  name: string;
  avg: number; // nanoseconds
}

interface DenoJsonOutput {
  version: number;
  benches: Array<{
    name: string;
    results: Array<{ ok?: { avg: number } }>;
    [key: string]: unknown;
  }>;
}

interface Baseline {
  savedAt: string;
  results: Record<string, number>; // bench name → avg nanoseconds
}

// ─── I/O helpers ─────────────────────────────────────────────────────────────

async function run(command: string, args: string[], cwd = ROOT, quiet = false): Promise<string> {
  const { code, stdout } = await new Deno.Command(command, {
    args,
    cwd,
    stdout: 'piped',
    stderr: quiet ? 'piped' : 'inherit',
  }).output();
  if (code !== 0) throw Object.assign(new Error(`${command} ${args.join(' ')} failed`), { code });
  return new TextDecoder().decode(stdout).trim();
}

/** emberx: `*.chrome.bench.ts` files run in Chrome, through scripts/lib/chrome-bench.js. */
const isChromeBench = (file: string): boolean => file.endsWith('.chrome.bench.ts');

/** emberx: builds the packages, then bundles every bench file once into tmp/benches/. */
async function bundle(files: string[]): Promise<void> {
  await run('npm', ['run', 'build:dev', '--silent'], ROOT, true);
  const common = {
    outdir: BUNDLE_DIR,
    outbase: `${ROOT}benches`,
    bundle: true,
    format: 'esm' as const,
    target: 'esnext',
    logLevel: 'warning' as const,
    mainFields: ['module', 'main'],
  };
  const denoFiles = files.filter((file) => !isChromeBench(file));
  const chromeFiles = files.filter(isChromeBench);
  if (denoFiles.length > 0) {
    await esbuild.build({ ...common, entryPoints: denoFiles, platform: 'node', conditions: ['node'] });
  }
  if (chromeFiles.length > 0) {
    await esbuild.build({ ...common, entryPoints: chromeFiles, platform: 'browser' });
  }
  esbuild.stop();
}

/**
 * emberx: Chrome benches are observational, gated only at the hard ceiling like
 * sub-10µs ones. A browser's GC and scheduling still move a render benchmark
 * by 30% between runs now and then, past the threshold with no code change.
 */
const observational = new Set<string>();

/** Runs a single bundled bench file in an isolated subprocess and returns its parsed results. */
async function runBenchFile(file: string): Promise<BenchResult[]> {
  const bundled = `${BUNDLE_DIR}/${file.replace(/^.*\//, '').replace(/\.ts$/, '.js')}`;
  if (!isChromeBench(file)) {
    return parseResults(
      await run(Deno.execPath(), ['bench', '--json', '--no-check', '--allow-read', '--allow-env', bundled]),
    );
  }
  const results = parseResults(await run('node', ['scripts/lib/chrome-bench.js', bundled]));
  for (const { name } of results) observational.add(name);
  return results;
}

/**
 * Merges two result sets by per-benchmark min — system noise only ever inflates
 * timings, so the minimum across runs is the most deterministic measurement of
 * intrinsic cost. Names present in only one side are kept as-is.
 */
function mergeMin(a: BenchResult[], b: BenchResult[]): BenchResult[] {
  const byName = new Map(a.map((r) => [r.name, r.avg]));
  for (const { name, avg } of b) {
    const prev = byName.get(name);
    byName.set(name, prev !== undefined ? Math.min(prev, avg) : avg);
  }
  return Array.from(byName, ([name, avg]) => ({ name, avg }));
}

/**
 * Best-of-2 across files. Used when establishing a baseline (--save) or when no
 * baseline exists yet, so the saved numbers are not biased by a single spike.
 */
async function collectBestOf2(files: string[]): Promise<BenchResult[]> {
  const all: BenchResult[] = [];
  for (const file of files) {
    const runA = await runBenchFile(file);
    const runB = await runBenchFile(file);
    all.push(...mergeMin(runA, runB));
  }
  return all;
}

/**
 * Adaptive collection for checking: each file runs once, and only files whose
 * benchmarks would regress against the baseline are retried (up to MAX_ATTEMPTS
 * total runs, taking the per-benchmark min).
 */
async function collectAdaptive(
  files: string[],
  baseline: Baseline,
  thresholdPct: number,
  minAbsDeltaNs: number,
): Promise<BenchResult[]> {
  const MAX_ATTEMPTS = 3;
  const threshold = thresholdPct / 100;
  const all: BenchResult[] = [];
  for (const file of files) {
    let results = await runBenchFile(file);
    for (let attempt = 1; attempt < MAX_ATTEMPTS; attempt++) {
      const stillRegressing = results.some(({ name, avg }) => {
        const saved = baseline.results[name];
        return saved !== undefined && isRegression(name, avg, saved, threshold, minAbsDeltaNs);
      });
      if (!stillRegressing) break;
      results = mergeMin(results, await runBenchFile(file));
    }
    all.push(...results);
  }
  return all;
}

/**
 * Resolve and apply SKIP_BENCHMARK. Returns the file list to run; exits 0 if
 * the user asked to skip everything. File matching is by basename minus the
 * `.bench.ts` suffix, so SKIP_BENCHMARK=string picks `benches/string.bench.ts`.
 */
function applySkipBenchmark(files: string[]): string[] {
  const raw = (Deno.env.get('SKIP_BENCHMARK') ?? '').trim();
  if (!raw) return files;

  if (['true', '1', 'all'].includes(raw.toLowerCase())) {
    console.log(yellow(`SKIP_BENCHMARK=${raw} → skipping all benchmark checks`));
    Deno.exit(0);
  }

  const skipNames = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const remaining = files.filter(
    (f) => !skipNames.includes(f.replace(/^.*\//, '').replace(/(\.chrome)?\.bench\.ts$/, '')),
  );
  const skipped = files.filter((f) => !remaining.includes(f));
  if (skipped.length > 0) {
    console.log(
      dim(`Skipping bench files via SKIP_BENCHMARK: ${skipped.map((f) => f.replace(/^.*\//, '')).join(', ')}`),
    );
  }
  return remaining;
}

// ─── Parsing ─────────────────────────────────────────────────────────────────

function parseResults(raw: string): BenchResult[] {
  let parsed: DenoJsonOutput;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error('check-benchmarks: failed to parse the JSON from `deno bench --json`.');
    Deno.exit(1);
  }

  if (!Array.isArray(parsed.benches)) {
    console.error('check-benchmarks: unexpected JSON shape (missing .benches array).');
    Deno.exit(1);
  }

  return parsed.benches.flatMap((b) => {
    const avg = b.results?.[0]?.ok?.avg;
    if (avg === undefined) return [];
    return [{ name: b.name, avg }];
  });
}

// ─── Threshold logic ─────────────────────────────────────────────────────────

// Two-tier model: the *gate* (whether a regression fails the build) and the *colouring*
// (whether a row prints in red/yellow). Benches below the gate floor are observational:
// GC pauses and scheduler interference swing them 100–300% on commodity hardware. They
// still print and are coloured, but only fail when the regression is so large it cannot
// plausibly be noise (HARD_CEILING_MULTIPLIER).
//
// emberx: the floor is 10µs, where qunitx-cli's is 1ms. emberx's headline cost is
// runtime template compilation, CPU-bound work of 40µs–10ms per template, which a 1ms
// floor would leave ungated. Below 10µs sit the string transforms and helpers, measured
// in nanoseconds, which stay observational as they are in qunitx-cli.
const GATE_FLOOR_NS = 10_000; //  10 µs — below this, regressions are non-gating except at the hard ceiling
const SPAWN_NS = 100_000_000; // 100 ms — at or above this, work involves a process spawn

// Even non-gated benches fail when their regression exceeds the effective threshold by
// this multiple: an accidental O(n²) or a 10× hot-path slowdown still fires.
const HARD_CEILING_MULTIPLIER = 10;

function isGated(saved: number, name: string): boolean {
  return saved >= GATE_FLOOR_NS && !observational.has(name);
}

/**
 * Threshold multipliers by size class, applied on top of REGRESSION_THRESHOLD:
 *   < 10 µs      2×    observational; non-gating except at HARD_CEILING_MULTIPLIER.
 *   10µs–100ms   1×    pure CPU work (template compilation) — stable.
 *   ≥ 100 ms     2.5×  spawn-or-larger, OS-bound and load-sensitive.
 */
function effectiveThreshold(saved: number, threshold: number): number {
  if (saved < GATE_FLOOR_NS) return threshold * 2;
  if (saved >= SPAWN_NS) return threshold * 2.5;
  return threshold;
}

function isRegression(name: string, avg: number, saved: number, threshold: number, minAbsDeltaNs: number): boolean {
  if (avg - saved <= minAbsDeltaNs) return false; // absolute floor: ignore JIT/GC noise
  const change = (avg - saved) / saved;
  const t = effectiveThreshold(saved, threshold);
  return isGated(saved, name) ? change > t : change > t * HARD_CEILING_MULTIPLIER;
}

// ─── Formatting ──────────────────────────────────────────────────────────────

function fmtNs(ns: number): string {
  if (ns >= 1_000_000_000) return `${(ns / 1_000_000_000).toFixed(2)}s`;
  if (ns >= 1_000_000) return `${(ns / 1_000_000).toFixed(2)}ms`;
  if (ns >= 1_000) return `${(ns / 1_000).toFixed(2)}µs`;
  return `${ns.toFixed(0)}ns`;
}

function fmtChange(change: number, threshold: number): string {
  const arrow = change > 0 ? '▲' : '▼';
  const pct = `${arrow}${(Math.abs(change) * 100).toFixed(1)}%`;
  if (change > threshold) return bold(red(pct));
  if (change > threshold / 2) return yellow(pct);
  if (change < 0) return green(pct);
  return dim(pct);
}

function printTable(
  results: BenchResult[],
  baseline: Baseline | null,
  threshold: number,
  minAbsDeltaNs: number,
  isAccepted: (name: string) => boolean = () => false,
): void {
  const hasBaseline = baseline !== null;
  const header =
    '  ' +
    bold('Name'.padEnd(66)) +
    bold('avg'.padStart(12)) +
    (hasBaseline ? bold('Baseline'.padStart(12)) + bold('Change'.padStart(10)) : '');
  console.log('\n' + header);
  console.log(gray('  ' + '─'.repeat(hasBaseline ? 100 : 78)));

  for (const { name, avg } of results) {
    const saved = baseline?.results[name];
    if (!hasBaseline || saved === undefined) {
      console.log(`  ${hasBaseline ? yellow('NEW ') : '    '} ${name.padEnd(66)}${fmtNs(avg).padStart(12)}`);
      continue;
    }
    const change = (avg - saved) / saved;
    const t = effectiveThreshold(saved, threshold);
    const fail = isRegression(name, avg, saved, threshold, minAbsDeltaNs);
    const drift = !fail && !isGated(saved, name) && change > t;
    // ACPT: a regression its commit accepts with a Benchmark-Regression trailer.
    const flag = fail ? (isAccepted(name) ? yellow(' ACPT') : bold(red(' FAIL'))) : drift ? dim(' INFO') : '     ';
    console.log(
      `${flag} ${name.padEnd(66)}${fmtNs(avg).padStart(12)}${dim(fmtNs(saved).padStart(12))}${fmtChange(change, t).padStart(10)}`,
    );
  }
  console.log();
}

// ─── Baselines ───────────────────────────────────────────────────────────────

async function loadBaseline(file = BASELINE_FILE): Promise<Baseline | null> {
  try {
    return JSON.parse(await Deno.readTextFile(file));
  } catch {
    return null;
  }
}

async function removeBaseWorktree(): Promise<void> {
  await run('git', ['worktree', 'remove', '--force', BASE_WORKTREE], ROOT, true).catch(() => {});
  await Deno.remove(BASE_WORKTREE, { recursive: true }).catch(() => {});
  await run('git', ['worktree', 'prune'], ROOT, true).catch(() => {});
}

/** The commit --base measured, whose descendants' Benchmark-Regression trailers count. */
let comparedBase: string | null = null;

/**
 * Benchmark-Regression trailers of the commits after `base`: each a benchmark
 * name or a `group/` prefix that the commit says it slows down on purpose.
 */
async function acceptedRegressions(base: string): Promise<Array<{ prefix: string; commit: string }>> {
  const log = await run('git', [
    'log',
    '--format=%h %s%x00%(trailers:key=Benchmark-Regression,valueonly,separator=%x01)%x1e',
    `${base}..HEAD`,
  ]);

  return log
    .split('\x1e')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .flatMap((entry) => {
      const [commit, trailers = ''] = entry.split('\x00');
      return trailers
        .split('\x01')
        .map((prefix) => prefix.trim())
        .filter(Boolean)
        .map((prefix) => ({ prefix, commit }));
    });
}

/**
 * emberx: --base. Measures `ref`'s own suite in a temporary worktree and returns
 * its numbers as the baseline, or null when `ref` predates the Deno bench suite.
 */
async function measureBase(ref: string | undefined): Promise<Baseline | null> {
  const head = await run('git', ['rev-parse', 'HEAD']);
  let base: string;
  if (ref) {
    base = await run('git', ['rev-parse', '--verify', `${ref}^{commit}`]);
  } else {
    const mergeBase = await run('git', ['merge-base', 'HEAD', 'origin/main']);
    base = mergeBase === head ? await run('git', ['rev-parse', 'HEAD~1']) : mergeBase;
  }
  comparedBase = base;
  const label = `${base.slice(0, 7)} (${await run('git', ['log', '-1', '--format=%s', base])})`;

  const hasSuite = await run('git', ['cat-file', '-e', `${base}:scripts/check-benchmarks.ts`], ROOT, true).then(
    () => true,
    () => false,
  );
  if (!hasSuite) {
    console.log(yellow(`Base ${label} has no Deno bench suite; printing this tree's numbers only.`));
    return null;
  }

  console.log(dim(`Measuring base ${label} in a temporary worktree, then this tree.`));
  await removeBaseWorktree();
  try {
    await run('git', ['worktree', 'add', '--detach', '--quiet', BASE_WORKTREE, base]);
    await run('npm', ['ci', '--no-audit', '--no-fund', '--loglevel=error'], BASE_WORKTREE);
    await run(Deno.execPath(), ['run', '--allow-all', 'scripts/check-benchmarks.ts', '--save'], BASE_WORKTREE);
    return await loadBaseline(`${BASE_WORKTREE}/benches/results.json`);
  } finally {
    await removeBaseWorktree();
  }
}

// ─── Save / Check ─────────────────────────────────────────────────────────────

async function save(results: BenchResult[], existing: Baseline | null, minAbsDeltaNs: number): Promise<void> {
  printTable(results, existing, 0.26, minAbsDeltaNs);

  const baseline: Baseline = {
    savedAt: new Date().toISOString(),
    results: Object.fromEntries(results.map((r) => [r.name, r.avg])),
  };
  await Deno.writeTextFile(BASELINE_FILE, JSON.stringify(baseline, null, 2) + '\n');
  console.log(green(`Baseline saved: ${results.length} benchmark(s) → benches/results.json`));
}

async function check(
  results: BenchResult[],
  baseline: Baseline | null,
  thresholdPct: number,
  minAbsDeltaNs: number,
): Promise<boolean> {
  const threshold = thresholdPct / 100;
  if (!baseline) {
    console.log(yellow('No baseline to compare against.'));
    console.log(dim("Save one with 'make bench-update', or compare against a commit with 'make bench-check'."));
    printTable(results, null, threshold, minAbsDeltaNs);
    return true; // nothing to compare: report, don't fail
  }

  console.log(
    `\nBenchmark regression check (threshold: ${yellow(`${thresholdPct}%`)}, abs floor: ${yellow(fmtNs(minAbsDeltaNs))})`,
  );
  const accepted = comparedBase ? await acceptedRegressions(comparedBase) : [];
  const acceptedBy = (name: string) => accepted.find(({ prefix }) => name.startsWith(prefix));
  printTable(results, baseline, threshold, minAbsDeltaNs, (name) => Boolean(acceptedBy(name)));

  const regressions = results.filter(({ name, avg }) => {
    const saved = baseline.results[name];
    return saved !== undefined && isRegression(name, avg, saved, threshold, minAbsDeltaNs);
  });
  const failures = regressions.filter(({ name }) => !acceptedBy(name));

  for (const { name, avg } of regressions.filter(({ name }) => acceptedBy(name))) {
    console.log(
      yellow(`  ACCEPTED  ${name}: ${fmtNs(baseline.results[name])} → ${fmtNs(avg)}, by ${acceptedBy(name)!.commit}`),
    );
  }

  if (failures.length > 0) {
    console.error(bold(red(`Regressions exceeding ${thresholdPct}% threshold:`)));
    for (const { name, avg } of failures) {
      console.error(red(`  FAIL  ${name}: ${fmtNs(baseline.results[name])} → ${fmtNs(avg)}`));
    }
    console.error(
      dim(
        `\nThese values are the min across up to 3 runs — the regression survived every attempt to\n` +
          `resample, so it is unlikely to be transient noise. If it is an intentional trade-off, add a\n` +
          `"Benchmark-Regression: <name or group/>" trailer to the commit that makes it; otherwise retry\n` +
          `on an idle machine, raise REGRESSION_THRESHOLD for this run, or set SKIP_BENCHMARK=true|<file>.`,
      ),
    );
    return false;
  }

  console.log(
    green(
      regressions.length > 0
        ? `All ${results.length} benchmark(s) within threshold, or accepted by their commit.`
        : `All ${results.length} benchmark(s) within threshold.`,
    ),
  );
  return true;
}

// ─── main ────────────────────────────────────────────────────────────────────

const args = Deno.args;
const isSave = args.includes('--save');
const isPrint = args.includes('--print');
const baseIndex = args.indexOf('--base');
const filesIndex = args.indexOf('--files');
const minAbsDeltaNs = Number(Deno.env.get('MIN_ABS_DELTA_NS') ?? '1000');
const thresholdPct = parseFloat(Deno.env.get('REGRESSION_THRESHOLD') ?? '26');

const requested =
  filesIndex !== -1
    ? args.slice(filesIndex + 1).filter((a) => !a.startsWith('--'))
    : [...Deno.readDirSync(`${ROOT}benches`)]
        .map((entry) => `benches/${entry.name}`)
        .filter((file) => file.endsWith('.bench.ts'))
        .sort();
const files = applySkipBenchmark(requested.map((file) => (file.startsWith('/') ? file : `${ROOT}${file}`)));
if (files.length === 0) {
  console.log(yellow('All bench files skipped via SKIP_BENCHMARK; nothing to do.'));
  Deno.exit(0);
}

const baseRef =
  baseIndex !== -1 && args[baseIndex + 1] && !args[baseIndex + 1].startsWith('--') ? args[baseIndex + 1] : undefined;
const baseline = isPrint ? null : baseIndex !== -1 ? await measureBase(baseRef) : await loadBaseline();

await bundle(files);

// Checking against a baseline → adaptive (1 run, retry only on regression).
// --save, --print or no baseline → best-of-2 so the numbers aren't biased by a single spike.
const results =
  !isSave && baseline
    ? await collectAdaptive(files, baseline, thresholdPct, minAbsDeltaNs)
    : await collectBestOf2(files);

if (isPrint) {
  printTable(results, null, thresholdPct / 100, minAbsDeltaNs);
} else if (isSave) {
  await save(results, await loadBaseline(), minAbsDeltaNs);
} else if (!(await check(results, baseline, thresholdPct, minAbsDeltaNs))) {
  Deno.exit(1);
}
