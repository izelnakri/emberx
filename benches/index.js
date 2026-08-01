#!/usr/bin/env node
/**
 * emberx benchmark harness.
 *
 *   npm run bench          run everything and print a table
 *   npm run bench:update   run everything and save benches/results.json
 *   npm run bench:check    run everything and fail on a regression
 *
 * Why these benchmarks: emberx compiles templates at runtime rather than in a
 * build step. That is the project's central bet, and it moves work that other
 * frameworks do once at build time into every page load. If runtime compilation
 * regresses, the whole premise regresses — so it is measured on every push.
 *
 * Methodology: each case is timed in batches sized to run for a target duration,
 * repeated across samples, and reported as the *median* ops/sec. Median rather
 * than mean because CI runners stall unpredictably and one 200ms scheduling gap
 * would otherwise dominate. `--check` compares against the committed baseline
 * and fails when a case is more than REGRESSION_THRESHOLD% slower.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readdirSync } from 'node:fs';

const HERE = dirname(fileURLToPath(import.meta.url));
const RESULTS_PATH = resolve(HERE, 'results.json');

const WARMUP_MS = 150;
const SAMPLE_TARGET_MS = 60;
const SAMPLES = 9;

const threshold = Number(process.env.REGRESSION_THRESHOLD || 25);

/**
 * Above this sample spread a case is measuring scheduler noise rather than
 * code, so it is reported but never allowed to fail the build. Shared CI
 * runners routinely produce this on sub-microsecond cases.
 */
const NOISE_LIMIT = 0.25;
const shouldSave = process.argv.includes('--save');
const shouldCheck = process.argv.includes('--check');

/**
 * Consumes every result so the optimiser cannot delete the work being measured.
 * Without this, pure functions like `eq` get inlined to nothing and the case
 * reports the cost of an empty loop (hundreds of millions of "ops/sec").
 */
let sink;

/** Runs `fn` `count` times and returns elapsed nanoseconds. */
function timeBatch(fn, count, context) {
  const started = process.hrtime.bigint();
  for (let index = 0; index < count; index++) sink = fn(context);
  const elapsed = Number(process.hrtime.bigint() - started);

  if (sink === Symbol.for('emberx.unreachable')) process.stdout.write('');

  return elapsed;
}

/**
 * Measures one case. Calibrates a batch size that takes ~SAMPLE_TARGET_MS, then
 * collects SAMPLES batches and returns the median throughput.
 */
function measure(fn, context) {
  // Warm up so JIT tiering and inline caches settle before we measure.
  const warmupUntil = Date.now() + WARMUP_MS;
  while (Date.now() < warmupUntil) sink = fn(context);

  // Calibrate: grow the batch until it runs long enough to time reliably.
  let batchSize = 1;
  while (timeBatch(fn, batchSize, context) < SAMPLE_TARGET_MS * 1e6 && batchSize < 1e8) {
    batchSize *= 2;
  }

  const throughputs = [];
  for (let sample = 0; sample < SAMPLES; sample++) {
    const nanoseconds = timeBatch(fn, batchSize, context);
    throughputs.push((batchSize / nanoseconds) * 1e9);
  }

  throughputs.sort((a, b) => a - b);

  return {
    opsPerSecond: throughputs[Math.floor(throughputs.length / 2)],
    // Spread between fastest and slowest sample, as a fraction of the median.
    // A high value means the number is noise and should not gate anything.
    jitter:
      (throughputs[throughputs.length - 1] - throughputs[0]) /
      throughputs[Math.floor(throughputs.length / 2)],
  };
}

function formatNumber(value) {
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}k`;
  return value.toFixed(1);
}

const benchFiles = readdirSync(HERE)
  .filter((file) => file.endsWith('.bench.js'))
  .sort();

if (benchFiles.length === 0) {
  process.stderr.write('No *.bench.js files found in benches/\n');
  process.exit(1);
}

const results = {};

for (const file of benchFiles) {
  const cases = (await import(resolve(HERE, file))).default;
  const suite = file.replace(/\.bench\.js$/, '');

  process.stdout.write(`\n${suite}\n`);

  for (const testCase of cases) {
    const context = testCase.setup ? await testCase.setup() : undefined;
    const measured = measure(testCase.fn, context);
    const key = `${suite}/${testCase.name}`;

    results[key] = {
      opsPerSecond: Number(measured.opsPerSecond.toFixed(2)),
      jitter: Number(measured.jitter.toFixed(3)),
    };

    const noisy = measured.jitter > NOISE_LIMIT ? `  (jitter ${(measured.jitter * 100).toFixed(0)}%)` : '';
    process.stdout.write(
      `  ${testCase.name.padEnd(44)} ${formatNumber(measured.opsPerSecond).padStart(9)} ops/s${noisy}\n`,
    );
  }
}

if (shouldSave) {
  await writeFile(RESULTS_PATH, `${JSON.stringify(results, null, 2)}\n`);
  process.stdout.write(`\nsaved baseline: ${RESULTS_PATH}\n`);
  process.exit(0);
}

if (!shouldCheck) process.exit(0);

let baseline;
try {
  baseline = JSON.parse(await readFile(RESULTS_PATH, 'utf8'));
} catch {
  process.stdout.write(
    `\nNo baseline at ${RESULTS_PATH}. Run \`npm run bench:update\` once and commit it.\n`,
  );
  process.exit(0);
}

const regressions = [];
const missing = [];
const tooNoisy = [];

for (const [key, { opsPerSecond, jitter }] of Object.entries(results)) {
  const previous = baseline[key];

  if (!previous) {
    missing.push(key);
    continue;
  }

  const change = ((opsPerSecond - previous.opsPerSecond) / previous.opsPerSecond) * 100;

  if (change >= -threshold) continue;

  // Slower than the gate allows — but only trust it if this run was stable.
  if (jitter > NOISE_LIMIT) {
    tooNoisy.push({ key, change, jitter });
    continue;
  }

  regressions.push({ key, change, previous: previous.opsPerSecond, current: opsPerSecond });
}

process.stdout.write('\n');

if (missing.length > 0) {
  process.stdout.write(`New cases with no baseline (not gated): ${missing.join(', ')}\n`);
}

if (tooNoisy.length > 0) {
  process.stdout.write('\nSlower than the threshold, but too noisy to gate on:\n');
  for (const { key, change, jitter } of tooNoisy) {
    process.stdout.write(`  ${key}: ${change.toFixed(1)}% (jitter ${(jitter * 100).toFixed(0)}%)\n`);
  }
}

if (regressions.length > 0) {
  process.stderr.write(`\nRegressions beyond ${threshold}%:\n`);
  for (const { key, change, previous, current } of regressions) {
    process.stderr.write(
      `  ${key}: ${formatNumber(previous)} -> ${formatNumber(current)} ops/s (${change.toFixed(1)}%)\n`,
    );
  }
  process.stderr.write(
    '\nIf this is an intentional trade-off, rerun `npm run bench:update` and commit the new baseline.\n',
  );
  process.exit(1);
}

process.stdout.write(`No regressions beyond ${threshold}%.\n`);
