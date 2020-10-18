import { module, test } from 'qunit';
import { visit, currentURL } from '../test-helpers';
import { setupApplicationTest } from '../setup-application-test';

// import { visit, currentURL } from '@ember/test-helpers';
// import { setupApplicationTest } from 'ember-qunit';

module('E2E | /', function (hooks) {
  setupApplicationTest(hooks); // TODO: how should this start silently?

  test('visiting / renders the content', async function (assert) {
    console.log('comeon');

    assert.ok(true);

    await visit('/'); // TODO: after route init make this go to that route inside the container

    // console.log('pausestart');
    await this.pauseTest();
    // console.log('pausefinish');

    assert.equal(currentURL(), '/'); // TODO: make this assert against currentURL
  });
});
