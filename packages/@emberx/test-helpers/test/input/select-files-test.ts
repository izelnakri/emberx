import { hbs } from '@emberx/component';
import { module, test } from 'qunitx';
import { render, triggerEvent } from '@emberx/test-helpers';
import { setupRenderingTest } from '../helpers';

module('emberx/test-helpers | select files', function (hooks) {
  setupRenderingTest(hooks);

  const textFile = new Blob(['Hello World'], { type: 'text/plain' });
  textFile.name = 'text-file.txt';

  const imageFile = new Blob([], { type: 'text/png' });
  imageFile.name = 'image-file.png';

  test('it can trigger a file selection event more than once', async function (assert) {
    await render(hbs`
      <input type="file" data-test-some-input/>
    `);

    const element = document.querySelector('[data-test-some-input]');
    element.addEventListener('change', (e) => {
      assert.step(e.target.files[0].name);
    });

    await triggerEvent(element, 'change', { files: [textFile] });
    await triggerEvent(element, 'change', { files: [imageFile] });

    assert.verifySteps(['text-file.txt', 'image-file.png']);
  });

  test('it can trigger a file selection event with an empty files array', async function (assert) {
    await render(hbs`
      <input type="file" data-test-some-input/>
    `);

    const element = document.querySelector('[data-test-some-input]');
    element.addEventListener('change', (e) => {
      assert.equal(e.target.files.length, 0, 'Files should be empty');
      assert.step('empty');
    });

    await triggerEvent(element, 'change', { files: [] });

    assert.verifySteps(['empty']);
  });

  test('can trigger file event with same selection twice without error', async function (assert) {
    await render(hbs`<input type="file" data-test-some-input/>`);

    const element = document.querySelector('[data-test-some-input]');
    element.addEventListener('change', (e) => {
      assert.step(e.target.files[0].name);
    });

    const files = [new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })];
    await triggerEvent(element, 'change', { files });
    await triggerEvent(element, 'change', { files });

    assert.verifySteps(['chucknorris.png', 'chucknorris.png']);
  });
});
