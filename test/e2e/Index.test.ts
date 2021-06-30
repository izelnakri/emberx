import { module, test } from 'qunitx';
import { visit, currentURL } from '../../src/test-helpers';
import { setupApplicationTest } from '../../src/test-helpers/setup';
import startRouter from '@examples/blog/start-router';

// window.QUnit.config.notrycatch = true;

module('E2E | /', function (hooks) {
  setupApplicationTest(hooks, startRouter); // TODO: how should this start silently?

  test('visiting / renders the content', async function (assert) {
    assert.ok(true);

    await visit('/'); // TODO: after route init make this go to that route inside the container

    // NOTE: add content and test interactions

    assert.equal(currentURL(), '/'); // TODO: make this assert against currentURL
  });
});
