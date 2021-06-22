import QUnit from 'qunitx';
import { setup } from 'qunit-dom/dist/addon-test-support/index';
import { setupRenderingTest } from '@emberx/test-helpers';

export default function setupTest(hooks, startRouterFunc) {
  setup(QUnit.assert);
  setupRenderingTest(hooks, startRouterFunc);
}
