/**
 * Browser suite entry point: every package's tests in one bundle.
 *
 * These are relative paths rather than `@emberx/<pkg>/test` because each
 * package now declares an `exports` map, which deliberately publishes only the
 * package entry point. Test modules are not part of the published surface, so
 * they are reached by path from here.
 */
import './debug.js';
import '../packages/@emberx/string/test/index.ts';
import '../packages/@emberx/helper/test/index.ts';
import '../packages/@emberx/component/test/index.ts';
import '../packages/@emberx/router/test/index.ts';
import '../packages/@emberx/test-helpers/test/index.ts';
import '../examples/basic/tests/my-component-test.ts';
import './e2e/index.ts';
