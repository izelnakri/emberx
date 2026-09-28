/**
 * Node suite entry point.
 *
 * emberx's central claim is that its packages resolve and run in node without a
 * framework-specific build system. This suite is what proves it: the packages
 * are imported, rendered into jsdom and asserted on under plain node, no
 * browser involved.
 *
 * @emberx/ssr runs here only: it renders to a string, without a browser DOM.
 *
 * @emberx/router and @emberx/test-helpers stay browser-only for now. Their
 * suites start a router per test, and transitions from one test keep running
 * after it ends, rendering into a container the next test has already torn
 * down. The browser tolerates that; node:test reports it as a failure.
 * ROADMAP.md #3 tracks the fix.
 */
import '../packages/@emberx/string/test/index';
import '../packages/@emberx/helper/test/index';
import '../packages/@emberx/component/test/index';
import '../packages/@emberx/ssr/test/index';
