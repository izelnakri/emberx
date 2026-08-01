#!/usr/bin/env node
/**
 * Runs the node test suite: test/node.ts, bundled by scripts/lib/test-bundle.js
 * and imported after jsdom globals are installed. qunitx's node build reports
 * through node:test, which sets a non-zero exit code on failure.
 *
 * qunitx-cli is a browser runner with no node mode, so it cannot run this suite.
 *
 *   node scripts/test-node.js                      against the workspace sources
 *   node scripts/test-node.js --packages-from=DIR  against packages installed in DIR
 */
import { pathToFileURL } from 'node:url';

import { ROOT, bundleTestSuite, packagesFromArgv } from './lib/test-bundle.js';

const outfile = await bundleTestSuite({ outfile: `${ROOT}/tmp/node-tests.mjs`, packagesFrom: packagesFromArgv() });

// Must happen before the bundle is imported: @emberx/component reads `window`
// and `document` while its module body evaluates.
await import(pathToFileURL(`${ROOT}/test/setup-dom.js`).href);
await import(pathToFileURL(outfile).href);
