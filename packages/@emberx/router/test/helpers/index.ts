import QUnit from 'qunitx';
import Assert from 'qunitx/assert';
import { setup } from 'qunit-dom';
import Router from '@emberx/router';
import { setupRenderingTest } from '@emberx/test-helpers';

export default function setupTest(hooks, startRouterFunc) {
  // QUnit.assert only exists in qunitx's browser build; under node, assertions
  // live on qunitx's own Assert class. qunit-dom just adds `dom` to whichever it gets.
  setup(QUnit.assert ?? Assert.prototype);

  // The router logs each route and model it enters; across the suite that is
  // tens of thousands of lines, which node prints in full.
  hooks.beforeEach(function () {
    Router.LOG_ROUTES = false;
    Router.LOG_MODELS = false;
  });
  hooks.afterEach(function () {
    Router.LOG_ROUTES = true;
    Router.LOG_MODELS = true;
  });
  setupRenderingTest(hooks, startRouterFunc);
}
