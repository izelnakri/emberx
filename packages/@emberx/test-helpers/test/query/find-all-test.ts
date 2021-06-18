import { hbs } from '@emberx/component';
import { module, test } from 'qunitx';
import { setupRenderingTest, render, findAll } from '@emberx/test-helpers';

module('@emberx/test-helpers | findAll', function (hooks) {
  setupRenderingTest(hooks);

  test('works correctly', async function (assert) {
    await render(hbs`
      <div class="elt"></div>
      <div class="elt"></div>
    `);

    const result = findAll('.elt');

    assert.ok(result instanceof Array);
    assert.equal(result.length, 2);
    assert.deepEqual(result, Array.from(document.querySelectorAll('.elt')));
  });
});
