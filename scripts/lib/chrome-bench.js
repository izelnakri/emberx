#!/usr/bin/env node
/**
 * Chrome.bench: Deno.bench, in Chrome.
 *
 *   node scripts/lib/chrome-bench.js tmp/benches/render.chrome.bench.js
 *
 * Neither Chrome nor the Chrome DevTools Protocol has a benchmark harness. CDP
 * offers the parts (Performance.getMetrics counters, Profiler and Tracing for
 * profiles, Emulation.setCPUThrottlingRate), but nothing that warms a function
 * up, sizes batches, repeats samples and reports statistics. This file is that
 * harness, shaped like Deno.bench so the two read the same:
 *
 *   Chrome.bench('render a list', async () => { ... });
 *   Chrome.bench({ name: 'render a list', group: 'render', fn: async () => { ... } });
 *
 * It prints exactly what `deno bench --json` prints, so scripts/check-benchmarks.ts
 * gates browser cases the way it gates Deno ones: the same thresholds, retries,
 * --base comparisons and SKIP_BENCHMARK.
 *
 * Accuracy. performance.now() is coarsened to 100µs on ordinary pages and to
 * 5µs on cross-origin-isolated ones, so the page is served with COOP and COEP
 * headers, and every sample is a batch timed as a whole: a batch runs for at
 * least SAMPLE_MS, which puts timer granularity well under 0.1% of a sample.
 *
 * Environment:
 *   CHROME_BIN                  the Chrome to drive (default: Playwright's)
 *   CHROME_BENCH_CPU_THROTTLE   slow the CPU down N× through CDP, e.g. 4 for a
 *                               mid-range phone
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const WARMUP_MS = 100;
const SAMPLE_MS = 10;
const BUDGET_MS = 1000;
const MIN_SAMPLES = 10;
const MAX_SAMPLES = 100;
const TIMEOUT_MS = 5 * 60 * 1000;

/**
 * The in-page half. It is serialized into the page as a classic script, so it
 * must stay self-contained: no closures over this module.
 */
function harness(settings) {
  const cases = [];
  const state = { done: false, report: null, error: null };

  // Every result is assigned here, so the optimiser cannot delete the work measured.
  let sink;

  function bench(nameOrOptions, maybeFn) {
    const options = typeof nameOrOptions === 'string' ? { name: nameOrOptions, fn: maybeFn } : nameOrOptions;
    if (typeof options.fn !== 'function') throw new TypeError(`Chrome.bench: "${options.name}" has no fn`);
    cases.push(options);
  }

  /** Runs `fn` `count` times and returns the elapsed milliseconds. */
  async function timeBatch(fn, count, isAsync) {
    const started = performance.now();
    if (isAsync) {
      for (let index = 0; index < count; index++) sink = await fn();
    } else {
      for (let index = 0; index < count; index++) sink = fn();
    }
    return performance.now() - started;
  }

  function percentile(sorted, fraction) {
    return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
  }

  async function measure({ fn }) {
    const isAsync = fn() instanceof Promise;

    // Warm up so JIT tiering and inline caches settle before anything is timed.
    const warmupUntil = performance.now() + settings.WARMUP_MS;
    while (performance.now() < warmupUntil) await timeBatch(fn, 1, isAsync);

    // Grow the batch until one takes long enough to time precisely.
    let batch = 1;
    while ((await timeBatch(fn, batch, isAsync)) < settings.SAMPLE_MS && batch < 1e7) batch *= 2;

    const perIteration = [];
    const budgetEnd = performance.now() + settings.BUDGET_MS;
    while (
      perIteration.length < settings.MIN_SAMPLES ||
      (perIteration.length < settings.MAX_SAMPLES && performance.now() < budgetEnd)
    ) {
      perIteration.push(((await timeBatch(fn, batch, isAsync)) * 1e6) / batch);
    }

    const sorted = [...perIteration].sort((a, b) => a - b);
    return {
      n: perIteration.length * batch,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: perIteration.reduce((sum, value) => sum + value, 0) / perIteration.length,
      p75: percentile(sorted, 0.75),
      p99: percentile(sorted, 0.99),
      p995: percentile(sorted, 0.995),
      p999: percentile(sorted, 0.999),
      highPrecision: globalThis.crossOriginIsolated === true,
      usedExplicitTimers: false,
    };
  }

  async function run() {
    try {
      const benches = [];
      for (const options of cases) {
        if (options.ignore) continue;
        benches.push({
          origin: settings.origin,
          group: options.group ?? null,
          name: options.name,
          baseline: options.baseline ?? false,
          results: [{ ok: await measure(options) }],
        });
      }
      state.report = { version: 1, runtime: navigator.userAgent, cpu: settings.cpu, benches };
    } catch (error) {
      state.error = String(error?.stack ?? error);
    } finally {
      state.done = true;
      void sink;
    }
  }

  globalThis.Chrome = { bench };
  globalThis.__chromeBench = { state, run };
}

/** Serves the page and the bundle with the headers that make the page cross-origin isolated. */
async function serve(bundlePath, settings) {
  const bundle = await readFile(bundlePath);
  const page = `<!doctype html>
<meta charset="utf-8">
<title>${basename(bundlePath)}</title>
<script>(${harness.toString()})(${JSON.stringify(settings)});</script>
<script type="module">
  import '/bench.js';
  await globalThis.__chromeBench.run();
</script>`;

  const server = createServer((request, response) => {
    const isolation = {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cache-Control': 'no-store',
    };
    if (request.url === '/') {
      response.writeHead(200, { ...isolation, 'Content-Type': 'text/html; charset=utf-8' });
      return response.end(page);
    }
    if (request.url === '/bench.js') {
      response.writeHead(200, { ...isolation, 'Content-Type': 'text/javascript; charset=utf-8' });
      return response.end(bundle);
    }
    response.writeHead(404, isolation);
    response.end();
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}/` };
}

/** Runs one bundled bench file in Chrome and returns `deno bench --json`-shaped output. */
export async function chromeBench(bundlePath) {
  const throttle = Number(process.env.CHROME_BENCH_CPU_THROTTLE || 1);
  const settings = {
    WARMUP_MS,
    SAMPLE_MS,
    BUDGET_MS,
    MIN_SAMPLES,
    MAX_SAMPLES,
    origin: pathToFileURL(bundlePath).href,
    cpu: throttle > 1 ? `throttled ${throttle}×` : 'unthrottled',
  };
  const { server, url } = await serve(bundlePath, settings);
  const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || undefined });

  try {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.stack ?? String(error)));

    if (throttle > 1) {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
    }

    await page.goto(url);
    await page.waitForFunction(() => globalThis.__chromeBench?.state.done || false, null, {
      timeout: TIMEOUT_MS,
      polling: 250,
    });
    const { report, error } = await page.evaluate(() => globalThis.__chromeBench.state);

    if (error || pageErrors.length > 0) throw new Error(error ?? pageErrors.join('\n'));
    return { ...report, runtime: `Chrome ${browser.version()}` };
  } finally {
    await browser.close();
    server.close();
  }
}

// Run only when invoked directly. pathToFileURL, not a `file://` template, which
// never matches a Windows path.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const bundlePath = process.argv[2];
  if (!bundlePath) {
    process.stderr.write('Usage: node scripts/lib/chrome-bench.js <bundled bench file>\n');
    process.exit(1);
  }
  try {
    process.stdout.write(`${JSON.stringify(await chromeBench(bundlePath))}\n`);
  } catch (error) {
    process.stderr.write(`chrome-bench: ${error.message}\n`);
    process.exit(1);
  }
}
