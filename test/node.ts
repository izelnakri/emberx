/**
 * Node and Deno suite entry point: `npm run test:node` runs it as it is, through
 * scripts/register.ts, and `npm run test:deno` runs it under Deno as it is.
 *
 * emberx's central claim is that its packages resolve and run outside a browser
 * without a framework-specific build system. This suite is what proves it: the
 * packages are imported, rendered into jsdom and asserted on under plain node
 * and under Deno, no browser involved.
 *
 * Everything test/index.ts runs in the browser runs here too, plus @emberx/ssr,
 * which runs here only: it renders to a string, without a browser DOM.
 */
import '../packages/@emberx/string/test/index.ts';
import '../packages/@emberx/helper/test/index.ts';
import '../packages/@emberx/component/test/index.ts';
import '../packages/@emberx/router/test/index.ts';
import '../packages/@emberx/test-helpers/test/index.ts';
import '../packages/@emberx/ssr/test/index.ts';
import '../examples/basic/tests/my-component-test.ts';
import './e2e/index.ts';
