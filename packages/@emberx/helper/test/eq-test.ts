import { module, test } from 'qunitx';
import { hbs } from '@emberx/component';
import { setupRenderingTest, render } from '@emberx/test-helpers';

module('@emberx/helper | "eq" helper', function (hooks) {
  setupRenderingTest(hooks);

  test('simple test 1', async function (assert) {
    await render(hbs`[{{eq true true}}] [{{eq true false}}] [{{eq false true}}] [{{eq false false}}]`);

    assert.equal(
      this.element.textContent,
      '[true] [false] [false] [true]',
      'value should be "[true] [false] [false] [true]"'
    );
  });

  test('simple test 2', async function (assert) {
    this.contextChild = {
      valueA: null,
      valueB: null,
    };

    await render(
      hbs`[{{eq this.contextChild.valueA this.contextChild.valueB}}] [{{eq this.contextChild.valueB this.contextChild.valueA}}]`
    );

    assert.equal(this.element.textContent, '[true] [true]', 'value should be "[true] [true]"');

    this.contextChild.valueA = undefined;

    await render(
      hbs`[{{eq this.contextChild.valueA this.contextChild.valueB}}] [{{eq this.contextChild.valueB this.contextChild.valueA}}]`
    );

    assert.equal(this.element.textContent, '[false] [false]', 'value should be "[false] [false]"');

    this.contextChild.valueB = undefined;

    await render(
      hbs`[{{eq this.contextChild.valueA this.contextChild.valueB}}] [{{eq this.contextChild.valueB this.contextChild.valueA}}]`
    );

    assert.equal(this.element.textContent, '[true] [true]', 'value should be "[true] [true]"');

    this.contextChild.valueA = 'yellow';
    this.contextChild.valueB = 'yellow';

    await render(
      hbs`[{{eq this.contextChild.valueA this.contextChild.valueB}}] [{{eq this.contextChild.valueB this.contextChild.valueA}}]`
    );

    assert.equal(this.element.textContent, '[true] [true]', 'value should be "[true] [true]"');
  });
});
