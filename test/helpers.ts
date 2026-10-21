/**
 * Test setup for the example apps, which sit outside the packages and so
 * outside the packages' own test helpers.
 */
import QUnit from 'qunitx';
import Assert from 'qunitx/assert';
import { setup } from 'qunit-dom';
import { setupRenderingTest as setupEmberXRenderingTest } from '@emberx/test-helpers';

export function setupRenderingTest(hooks, startRouter?: () => unknown) {
  // QUnit.assert only exists in qunitx's browser build; under node, assertions
  // live on qunitx's own Assert class. qunit-dom just adds `dom` to whichever it gets.
  setup(QUnit.assert ?? Assert.prototype);
  setupEmberXRenderingTest(hooks, startRouter);
}

export { setupRenderingTest as setupApplicationTest };
