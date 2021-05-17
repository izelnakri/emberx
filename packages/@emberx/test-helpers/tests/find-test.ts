import { hbs } from '@glimmerx/component';
import { module, test } from 'qunit';
import { setupRenderingTest, render, find } from '../../../src/test-helpers';

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
