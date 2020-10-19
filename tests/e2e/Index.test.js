import { module, test } from 'qunit';
import { visit, currentURL } from '../../src/test-helpers';
import { setupApplicationTest } from '../../src/test-helpers/setup';

// import { visit, currentURL } from '@ember/test-helpers';
// import { setupApplicationTest } from 'ember-qunit';

QUnit.config.notrycatch = true;

module('E2E | /', function (hooks) {
  setupApplicationTest(hooks); // TODO: how should this start silently?

  test('visiting / renders the content', async function (assert) {
    console.log('comeon');

    assert.ok(true);

    await visit('/'); // TODO: after route init make this go to that route inside the container

    // NOTE: add content and test interactions

    assert.equal(currentURL(), '/'); // TODO: make this assert against currentURL
  });
});
