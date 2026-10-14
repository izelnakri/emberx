import { module, test } from 'qunitx';
import { visit, click, currentURL } from '@emberx/test-helpers';
import startRouter from '@examples/blog/start-router';
import { setupApplicationTest } from '../../../helpers';

module('E2E | /admin/posts/:slug', function (hooks) {
  setupApplicationTest(hooks, startRouter);

  test('visiting a post renders its slug', async function (assert) {
    await visit('/admin/posts/compilers-are-the-new-frameworks');

    assert.equal(currentURL(), '/admin/posts/compilers-are-the-new-frameworks');
    assert.dom('#ember-testing p').hasText('Post slug is: compilers-are-the-new-frameworks');
  });

  test('Go back returns to the blog index', async function (assert) {
    await visit('/admin/posts/232');
    await click('#ember-testing a');

    assert.equal(currentURL(), '/');
    assert.dom('#intro h1').hasText('This is INDEXROUTE');
  });
});
