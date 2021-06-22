import { module, test } from 'qunitx';
import { hbs } from '@emberx/component';
import { neq } from '@emberx/helper';
import { setupRenderingTest, render } from '@emberx/test-helpers';

module('@emberx/helper | "neq" helper', function (hooks) {
  setupRenderingTest(hooks);

  test('simple test 1', async function (assert) {
    await render(hbs`[{{neq true true}}] [{{neq true false}}] [{{neq false true}}] [{{neq false false}}]`, {
      neq,
    });

    assert.equal(
      this.element.textContent,
      '[false] [true] [true] [false]',
      'value should be "[false] [true] [true] [false]"'
    );
  });

  test('simple test 2', async function (assert) {
    this.contextChild = {
      valueA: null,
      valueB: null,
    };

    await render(
      hbs`[{{neq this.contextChild.valueA this.contextChild.valueB}}] [{{neq this.contextChild.valueB this.contextChild.valueA}}]`,
      { neq }
    );

    assert.equal(this.element.textContent, '[false] [false]', 'value should be "[false] [false]"');

    this.contextChild.valueA = undefined;

    await render(
      hbs`[{{neq this.contextChild.valueA this.contextChild.valueB}}] [{{neq this.contextChild.valueB this.contextChild.valueA}}]`,
      { neq }
    );

    assert.equal(this.element.textContent, '[true] [true]', 'value should be "[true] [true]"');

    this.contextChild.valueB = undefined;

    await render(
      hbs`[{{neq this.contextChild.valueA this.contextChild.valueB}}] [{{neq this.contextChild.valueB this.contextChild.valueA}}]`,
      { neq }
    );

    assert.equal(this.element.textContent, '[false] [false]', 'value should be "[false] [false]"');

    this.contextChild.valueA = 'yellow';
    this.contextChild.valueB = 'yellow';

    await render(
      hbs`[{{neq this.contextChild.valueA this.contextChild.valueB}}] [{{neq this.contextChild.valueB this.contextChild.valueA}}]`,
      { neq }
    );

    assert.equal(this.element.textContent, '[false] [false]', 'value should be "[false] [false]"');
  });
});
