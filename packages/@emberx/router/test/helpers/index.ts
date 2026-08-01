import QUnit from 'qunitx';
import { setup } from 'qunit-dom';
import { setupRenderingTest } from '@emberx/test-helpers';

export default function setupTest(hooks, startRouterFunc) {
  setup(QUnit.assert);
  setupRenderingTest(hooks, startRouterFunc);
}
