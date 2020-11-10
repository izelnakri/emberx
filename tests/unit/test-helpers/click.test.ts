import { hbs } from '@glimmerx/component';
import { on } from '@glimmerx/modifier';
import { fn } from '@glimmerx/helper';
import { module, test } from 'qunit';
import { setupRenderingTest, render, click } from '../../../src/test-helpers';

module('emberx/test-helpers | click', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    assert.expect(3);

    this.title = 'some title';
    this.assertTrue = (param) => {
      assert.equal(param, 'some title');
    };

    await render(hbs`
      <button type="button" {{on "click" (fn @assertTrue @title)}} data-test-some-button>
        Something
      </button>
    `);

    assert.dom('[data-test-some-button]').hasText('Something');

    await click('[data-test-some-button]');

    assert.dom('[data-test-some-button]').hasText('Something');
  });

  test('it throws when called without target', async function (assert) {
    const done = assert.async();

    click().catch((error) => {
      assert.ok(error instanceof Error);
      assert.equal(error.message, 'Must pass an element or selector to `click`.');
      done();
    });
  });

  test('it throws when target does not exist', async function (assert) {
    const done = assert.async();

    click('#asdasdasd').catch((error) => {
      assert.ok(error instanceof Error);
      assert.equal(error.message, "Element not found when calling `click('#asdasdasd')`.");
      done();
    });
  });

  test('it calls mousedown, focus, mouseup, click once on focusable element', async function (assert) {
    await render(hbs`
      <button type="button" data-test-outside></button>
      <form data-test-form>
        <input id="test-input"/>
      </form>
    `);

    assert.dom('#test-input').hasValue('').isNotFocused();

    const input = document.querySelector('#test-input');

    input.addEventListener('mousedown', () => assert.step('mousedown'));
    input.addEventListener('focus', () => assert.step('focus'));
    input.addEventListener('mouseup', () => assert.step('mouseup'));
    input.addEventListener('click', () => assert.step('click'));

    assert.verifySteps([]);

    await click('#test-input');

    assert.verifySteps(['mousedown', 'focus', 'mouseup', 'click']);

    assert.dom('#test-input').isFocused();

    await click('[data-test-outside]');

    assert.verifySteps([]);
    assert.dom('#test-input').isNotFocused();

    await click('#test-input');

    assert.verifySteps(['mousedown', 'focus', 'mouseup', 'click']);
    assert.dom('#test-input').isFocused();
  });

  test('it doesnt call mousedown, mouseup, click on disabled form element', async function (assert) {
    assert.expect(9);

    const done = assert.async();

    await render(hbs`
      <button type="button" data-test-outside></button>
      <form data-test-form>
        <input id="test-input" disabled/>
      </form>
    `);

    assert.dom('#test-input').isNotFocused().isDisabled();

    const input = document.querySelector('#test-input');

    input.addEventListener('mousedown', () => assert.step('mousedown'));
    input.addEventListener('focus', () => assert.step('focus'));
    input.addEventListener('mouseup', () => assert.step('mouseup'));
    input.addEventListener('click', () => assert.step('click'));

    assert.verifySteps([]);

    click('#test-input')
      .catch(() => {
        assert.verifySteps([]);
        assert.dom('#test-input').isNotFocused().isDisabled();

        return click('#test-input');
      })
      .catch(() => {
        assert.verifySteps([]);
        assert.dom('#test-input').isNotFocused().isDisabled();
        done();
      });
  });
});
