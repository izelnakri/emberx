import { module, test } from 'qunitx';
import { visit, click, currentURL } from '@emberx/test-helpers';
import startRouter from '@examples/blog/start-router.ts';
import { setupApplicationTest } from '../helpers.ts';

module('E2E | /', function (hooks) {
  setupApplicationTest(hooks, startRouter);

  test('visiting / renders the content', async function (assert) {
    await visit('/');

    assert.equal(currentURL(), '/');
    assert.dom('.navbar-brand').hasText('Izel Nakri');
    assert.dom('#intro h1').hasText('This is INDEXROUTE');
    assert.dom('#intro h5:first-of-type').hasText('Current locale is: en');
    assert.dom('#intro img').hasAttribute('src', 'https://emberjs.com/images/ember-logo.svg');
  });

  test('Change locale switches the locale, and the translated button with it', async function (assert) {
    await visit('/');

    assert.dom('#intro button:last-of-type').hasText('Save model');

    await click('#intro button:first-of-type');

    assert.dom('#intro h5:first-of-type').hasText('Current locale is: es');
    assert.dom('#intro button:last-of-type').hasText('Guardar modelo');

    await click('#intro button:first-of-type');

    assert.dom('#intro h5:first-of-type').hasText('Current locale is: en');
  });

  test('the counter counts clicks', async function (assert) {
    await visit('/');

    assert.dom(':scope > button').hasText('Counter: 1');

    await click('#ember-testing > button');
    await click('#ember-testing > button');

    assert.dom(':scope > button').hasText('Counter: 3');
  });

  test('the post link goes to the admin page of that post', async function (assert) {
    await visit('/');
    await click('#intro a');

    assert.equal(currentURL(), '/admin/posts/232');
    assert.dom('p').hasText('Post slug is: 232');
  });
});
