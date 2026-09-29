import QUnit from 'qunitx';
import Assert from 'qunitx/assert';
import { setup } from 'qunit-dom';
import { setupRenderingTest as upstreamSetupRenderingTest } from '@emberx/test-helpers';

export function setupRenderingTest(hooks) {
  // QUnit.assert only exists in qunitx's browser build; under node, assertions
  // live on qunitx's own Assert class. qunit-dom just adds `dom` to whichever it gets.
  setup(QUnit.assert ?? Assert.prototype);
  upstreamSetupRenderingTest(hooks);
}
