import { hbs } from '@emberx/component';
import { module, test } from 'qunitx';
import { setupRenderingTest, render, find } from '@emberx/test-helpers';

module('emberx/test-helpers | find', function (hooks) {
  setupRenderingTest(hooks);

  test('works correctly', async function (assert) {
    await render(hbs`
      <div class="elt"></div>
      <div data-test-elt-div></div>
    `);

    assert.deepEqual(find('[data-test-elt-div]'), document.querySelector('[data-test-elt-div]'));
  });
});
