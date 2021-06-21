import { module, test } from 'qunitx';
import { hbs } from '@emberx/component';
import { setupRenderingTest, render } from '@emberx/test-helpers';

module('@emberx/helper | "and" helper', function (hooks) {
  setupRenderingTest(hooks);

  test('boolean values', async function (assert) {
    await render(hbs`[{{and true true}}] [{{and true false}}] [{{and false true}}] [{{and false false}}]`);

    assert.equal(
      this.element.textContent,
      '[true] [false] [false] [false]',
      'value should be "[true] [false] [false] [false]"'
    );
  });

  test('integer values', async function (assert) {
    await render(hbs`[{{and 1 1}}] [{{and 1 0}}] [{{and 0 1}}] [{{and 0 0}}]`);

    assert.equal(this.element.textContent, '[1] [0] [0] [0]', 'value should be "[1] [0] [0] [0]"');
  });

  test('string values', async function (assert) {
    await render(hbs`[{{and " " " "}}] [{{and " " ""}}] [{{and "" " "}}] [{{and "" ""}}]`);

    assert.equal(this.element.textContent, '[ ] [] [] []', 'value should be "[ ] [] [] []"');
  });

  test('undefined list length and boolean', async function (assert) {
    await render(hbs`[{{and this.array.length 1}}]`);

    assert.equal(this.element.textContent, '[]', 'value should be "[]"');
  });

  test('null list length and boolean', async function (assert) {
    this.array = null;

    await render(hbs`[{{and this.array.length 1}}]`);

    assert.equal(this.element.textContent, '[]', 'value should be "[]"');
  });

  test('empty list length and boolean false case', async function (assert) {
    this.array = [];

    await render(hbs`[{{and this.array.length 1}}]`);

    assert.equal(this.element.textContent, '[0]', 'value should be "[0]"');
  });

  test('empty list length and boolean intended case when empty list', async function (assert) {
    this.array = [];

    await render(hbs`[{{and this.array.length 0}}]`);

    assert.equal(this.element.textContent, '[0]', 'value should be "[0]"');
  });

  test('non-empty list length and boolean', async function (assert) {
    this.array = ['a'];

    await render(hbs`[{{and this.array.length 2}}]`);

    assert.equal(this.element.textContent, '[2]', 'value should be "[2]"');
  });

  test('non-empty list length and correct length', async function (assert) {
    this.array = ['a'];

    await render(hbs`[{{and this.array.length 1}}]`);

    assert.equal(this.element.textContent, '[1]', 'value should be "[2]"');
  });
});
