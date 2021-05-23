import { module, test } from 'qunitx';
import { setupRenderingTest, waitFor } from '@emberx/test-helpers';

module('emberx/test-helpers | waitFor', function (hooks) {
  setupRenderingTest(hooks);

  let rootElement;
  hooks.beforeEach(function () {
    rootElement = document.getElementById('ember-testing');
  });

  hooks.afterEach(function () {
    document.getElementById('ember-testing').innerHTML = '';
  });

  test('wait for selector', async function (assert) {
    const waitPromise = waitFor('.something');

    setTimeout(() => {
      rootElement.innerHTML = `<div class="something">Hi!</div>`;
    }, 10);

    const element = await waitPromise;

    assert.equal(element.textContent, 'Hi!');
  });

  test('wait for count of selector', async function (assert) {
    const waitPromise = waitFor('.something', { count: 2 });

    setTimeout(() => {
      rootElement.innerHTML = `<div class="something">No!</div>`;
    }, 10);
    setTimeout(() => {
      rootElement.innerHTML = `
        <div class="something">Hi!</div>
        <div class="something">Bye!</div>
      `;
    }, 20);

    const elements = await waitPromise;

    assert.deepEqual(
      elements.map((e) => e.textContent),
      ['Hi!', 'Bye!']
    );
  });

  test('wait for selector with timeout', async function (assert) {
    assert.expect(2);

    const start = Date.now();
    try {
      await waitFor('.something', { timeout: 100 });
    } catch (error) {
      const end = Date.now();
      assert.ok(end - start >= 100, 'timed out after correct time');
      assert.equal(error.message, 'waitFor timed out waiting for selector ".something"');
    }
  });

  test('wait for selector with timeoutMessage', async function (assert) {
    assert.expect(1);

    try {
      await waitFor('.something', { timeoutMessage: '.something timed out' });
    } catch (error) {
      assert.equal(error.message, '.something timed out');
    }
  });
});
