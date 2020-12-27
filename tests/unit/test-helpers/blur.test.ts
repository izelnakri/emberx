import { hbs } from '@glimmerx/component';
import { on } from '@glimmerx/modifier';
import { fn } from '@glimmerx/helper';
import { module, test } from 'qunit';
import { setupRenderingTest, render, blur, focus } from '../../../src/test-helpers';

function setupEventStepListeners(assert, element) {
  ['focus', 'focusin', 'blur', 'focusout'].forEach((eventName) => {
    element.addEventListener(eventName, () => assert.step(eventName));
  });
}

module('emberx/test-helpers | blur', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    assert.expect(11);

    this.title = 'some title';
    this.assertTrue = (param) => {
      assert.equal(param, 'some title');
    };

    await render(hbs`
      <form>
        <input {{on "blur" (fn @assertTrue @title)}} value="Something" data-test-some-input/>
      </form>
    `);

    const input = document.querySelector('[data-test-some-input]');

    setupEventStepListeners(assert, input);

    assert.dom('[data-test-some-input]').hasValue('Something');

    await focus('[data-test-some-input]');

    assert.verifySteps(['focus', 'focusin']);
    assert.equal(
      document.activeElement,
      document.querySelector('[data-test-some-input]'),
      'activeElement updated'
    );
    assert.dom('[data-test-some-input]').hasValue('Something');

    await blur('[data-test-some-input]');

    assert.verifySteps(['blur', 'focusout']);
    assert.dom('[data-test-some-input]').hasValue('Something');
  });

  test('it throws when called without target', async function (assert) {
    const done = assert.async();

    try {
      await blur();
    } catch (error) {
      assert.ok(error instanceof Error);
      done();
    }
  });

  test('it throws when target does not exist', async function (assert) {
    const done = assert.async();

    try {
      await blur('#asdasdasd');
    } catch (error) {
      assert.ok(error instanceof Error);
      assert.equal(error.message, "Element not found when calling `blur('#asdasdasd')`.");
      done();
    }
  });

  test('it calls mousedown, focus, mouseup, click once on focusable element', async function (assert) {
    await render(hbs`
      <input id="another-input"/>

      <form data-test-form>
        <input id="test-input" value="Something" />
      </form>
    `);

    assert.dom('#test-input').hasValue('Something').isNotFocused();

    const input = document.querySelector('#test-input');

    setupEventStepListeners(assert, input);

    await focus('#test-input');

    assert.equal(
      document.activeElement,
      document.querySelector('#test-input'),
      'activeElement updated'
    );
    assert.verifySteps(['focus', 'focusin']);
    assert.dom('#test-input').isFocused();

    await blur('#test-input');

    assert.equal(document.activeElement, document.querySelector('body'), 'activeElement updated');
    assert.verifySteps(['blur', 'focusout']);
    assert.dom('#test-input').isNotFocused();

    await focus('#test-input');
    await blur('#another-input');

    assert.verifySteps(['focus', 'focusin']);
    assert.dom('#test-input').isFocused();
    assert.equal(
      document.activeElement,
      document.querySelector('#test-input'),
      'activeElement updated'
    );

    await blur('#test-input');

    assert.verifySteps(['blur', 'focusout']);
  });

  test('it doesnt call mousedown, mouseup, click on disabled form element', async function (assert) {
    assert.expect(6);

    const done = assert.async();

    await render(hbs`
      <button type="button" data-test-outside></button>
      <form data-test-form>
        <input id="test-input" disabled/>
      </form>
    `);

    assert.dom('#test-input').isNotFocused().isDisabled();

    const input = document.querySelector('#test-input');

    setupEventStepListeners(assert, input);

    try {
      await focus('#test-input');
    } catch {
      assert.verifySteps([]);

      try {
        await blur('#test-input');
      } catch {
        assert.verifySteps([]);
        assert.dom('#test-input').isNotFocused().isDisabled();
        done();
      }
    }
  });
});
