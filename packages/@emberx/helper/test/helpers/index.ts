import QUnit from 'qunitx';
import { setup } from 'qunit-dom';
import { setupRenderingTest as upstreamSetupRenderingTest } from '@emberx/test-helpers';

export function setupRenderingTest(hooks) {
  setup(QUnit.assert);
  upstreamSetupRenderingTest(hooks);
}
