import QUnit from 'qunitx';
import { setup } from 'qunit-dom/dist/addon-test-support/index.js';
import { setupRenderingTest as upstreamSetupRenderingTest } from '@emberx/test-helpers';

export function setupRenderingTest(hooks) {
  setup(QUnit.assert);
  upstreamSetupRenderingTest(hooks);
}
