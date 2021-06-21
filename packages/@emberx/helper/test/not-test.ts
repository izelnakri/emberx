import { module, test } from 'qunitx';
import { setupRenderingTest, render, hbs } from '@emberx/test-helpers';

module('@emberx/helper | "not" helper', function (hooks) {
  setupRenderingTest(hooks);

  test('simple test 1', async function (assert) {
    await render(
      hbs`[{{not true}}] [{{not false}}] [{{not null}}] [{{not undefined}}] [{{not ''}}] [{{not ' '}}]`
    );

    assert.equal(
      this.element.textContent,
      '[false] [true] [true] [true] [true] [false]',
      'value should be "[false] [true] [true] [true] [true] [false]"'
    );
  });

  test('simple test 2', async function (assert) {
    await render(
      hbs`[{{not true false}}] [{{not true false}}] [{{not null null false null}}] [{{not false null ' ' true}}]`
    );

    assert.equal(
      this.element.textContent,
      '[false] [false] [true] [false]',
      'value should be "[false] [false] [true] [false]"'
    );
  });
});
