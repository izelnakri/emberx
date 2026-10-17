import QUnit from 'qunitx';
import Assert from 'qunitx/assert';
import { setup } from 'qunit-dom';
import Router from '@emberx/router';
import { setupRenderingTest as upstreamSetupRenderingTest } from '@emberx/test-helpers';

export function setupRenderingTest(hooks, startRouter) {
  // QUnit.assert only exists in qunitx's browser build; under node, assertions
  // live on qunitx's own Assert class. qunit-dom just adds `dom` to whichever it gets.
  setup(QUnit.assert ?? Assert.prototype);

  // Quiet, as in @emberx/router's suite: see its test/helpers/index.ts.
  hooks.beforeEach(function () {
    Router.LOG_ROUTES = false;
    Router.LOG_MODELS = false;
  });
  hooks.afterEach(function () {
    Router.LOG_ROUTES = true;
    Router.LOG_MODELS = true;
  });
  upstreamSetupRenderingTest(hooks, startRouter);
}
