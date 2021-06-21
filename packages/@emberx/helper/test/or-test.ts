import { module, test } from 'qunitx';
import { setupRenderingTest, render, hbs } from '@emberx/test-helpers';

module('@emberx/helper | "or" helper', function (hooks) {
  setupRenderingTest(hooks);

  test('simple test 1', async function (assert) {
    await render(hbs`[{{or true 1 ' ' null undefined}}]`);

    assert.equal(this.element.textContent, '[true]', 'value should be "[true]"');
  });

  test('simple test 2', async function (assert) {
    await render(hbs`[{{or null undefined true 1 ' '}}]`);

    assert.equal(this.element.textContent, '[true]', 'value should be "[true]"');
  });

  test('simple test 3', async function (assert) {
    await render(
      hbs`[{{or false}}] [{{or true}}] [{{or 1}}] [{{or ''}}] [{{or false ''}}] [{{or true ''}}] [{{or '' true}}]`
    );

    assert.equal(
      this.element.textContent,
      '[false] [true] [1] [] [] [true] [true]',
      'value should be "[false] [true] [1] [] [] [true] [true]"'
    );
  });

  test('simple test 4, mutation', async function (assert) {
    this.contextChild = { valueA: null, valueB: null }; // NOTE: how can I make this tracked properly?

    await render(
      hbs`[{{or this.contextChild.valueA}}] [{{or this.contextChild.valueB}}] [{{or this.contextChild.valueB this.contextChild.valueA}}] [{{or this.contextChild.valueA this.contextChild.valueB}}]`
    );

    assert.equal(this.element.textContent.trim(), '[] [] [] []', 'value should be "[] [] [] []"');

    this.contextChild.valueA = undefined;

    await render(
      hbs`[{{or this.contextChild.valueA}}] [{{or this.contextChild.valueB}}] [{{or this.contextChild.valueB this.contextChild.valueA}}] [{{or this.contextChild.valueA this.contextChild.valueB}}]`
    );

    assert.equal(this.element.textContent.trim(), '[] [] [] []', 'value should be "[] [] [] []"');

    this.contextChild.valueA = '';

    await render(
      hbs`[{{or this.contextChild.valueA}}] [{{or this.contextChild.valueB}}] [{{or this.contextChild.valueB this.contextChild.valueA}}] [{{or this.contextChild.valueA this.contextChild.valueB}}]`
    );

    assert.equal(this.element.textContent.trim(), '[] [] [] []', 'value should be "[] [] [] []"');

    this.contextChild.valueA = ' ';

    await render(
      hbs`[{{or this.contextChild.valueA}}] [{{or this.contextChild.valueB}}] [{{or this.contextChild.valueB this.contextChild.valueA}}] [{{or this.contextChild.valueA this.contextChild.valueB}}]`
    );

    assert.equal(this.element.textContent.trim(), '[ ] [] [ ] [ ]', 'value should be "[ ] [] [ ] [ ]"');

    this.contextChild.valueB = 'yellow';

    await render(
      hbs`[{{or this.contextChild.valueA}}] [{{or this.contextChild.valueB}}] [{{or this.contextChild.valueB this.contextChild.valueA}}] [{{or this.contextChild.valueA this.contextChild.valueB}}]`
    );

    assert.equal(
      this.element.textContent.trim(),
      '[ ] [yellow] [yellow] [ ]',
      'value should be "[ ] [yellow] [yellow] [ ]"'
    );
  });

  module('"or" with "neq" tests', function (hooks) {
    test('simple test 1', async function (assert) {
      await render(hbs`[{{or (neq true false) (neq true false)}}]`);

      assert.equal(this.element.textContent, '[true]', 'value should be "[true]"');
    });

    test('simple test 2', async function (assert) {
      await render(hbs`[{{or (neq true true) (neq false false)}}]`);

      assert.equal(this.element.textContent, '[false]', 'value should be "[true]"');
    });

    test('simple test 3', async function (assert) {
      await render(hbs`[{{or (neq true true) (neq true false)}}]`);

      assert.equal(this.element.textContent, '[true]', 'value should be "[true]"');
    });

    test('simple test 4', async function (assert) {
      await render(hbs`[{{or (neq true false) (neq false false)}}]`);

      assert.equal(this.element.textContent, '[true]', 'value should be "[true]"');
    });

    test('simple test 5', async function (assert) {
      await render(hbs`[{{#if (or (neq true false) (neq false false))}}true{{else}}false{{/if}}]`);

      assert.equal(this.element.textContent, '[true]', 'value should be "[true]"');
    });
  });
});
