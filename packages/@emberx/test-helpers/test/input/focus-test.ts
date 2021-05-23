import { hbs } from '@emberx/component';
import { module, test } from 'qunitx';
import { render, focus } from '@emberx/test-helpers';
import { setupRenderingTest } from '../helpers';

function setupFocusEventStepListeners(assert, element) {
  ['focus', 'focusin'].forEach((eventName) => {
    element.addEventListener(eventName, () => assert.step(eventName));
  });
}

function setupBlurEventStepListeners(assert, element) {
  ['blur', 'focusout'].forEach((eventName) => {
    element.addEventListener(eventName, () => assert.step(eventName));
  });
}

module('emberx/test-helpers | focus', function (hooks) {
  const FOCUS_STEPS = ['focus', 'focusin'];
  const BLUR_STEPS = ['blur', 'focusout'];

  setupRenderingTest(hooks);

  module('assertion before focus error cases', function () {
    test('focusing with a not found selector raises', async function (assert) {
      await render(hbs`<a href="#" class="elt"></a>`);

      assert.rejects(focus('[data-test-not-existing]'), /Error: Element not found when calling/);
    });

    test('focusing a disabled form control', async function (assert) {
      await render(hbs`<input data-test-some-input disabled />`);

      assert.rejects(
        focus('[data-test-some-input]'),
        'Error: [object HTMLInputElement] is not focusable'
      );
    });

    test('trying to focus on unfocusable element raises', async function (assert) {
      await render(hbs`<div data-test-some-div></div>`);

      assert.rejects(focus('[data-test-some-div]'), 'Error: [object HTMLElement] is not focusable');
    });
  });

  module('actual focus test cases', function () {
    test('focusing a div via selector works', async function (assert) {
      await render(hbs`<a href="#" class="elt"></a>`);

      assert.strictEqual(document.activeElement, document.querySelector('body'));

      await focus('.elt');

      assert.strictEqual(document.activeElement, document.querySelector('.elt'));
    });

    test('focusing a div via element works', async function (assert) {
      await render(hbs`<a href="#" class="elt"></a>`);

      const element = document.querySelector('.elt');

      assert.strictEqual(document.activeElement, document.querySelector('body'));

      await focus(element);

      assert.strictEqual(document.activeElement, element);
    });

    test('does not run sync', async function (assert) {
      await render(hbs`<input data-test-some-test-input/>`);

      const element = document.querySelector('[data-test-some-test-input]');

      setupFocusEventStepListeners(assert, element);

      const promise = focus(element);

      await promise;

      assert.verifySteps(FOCUS_STEPS);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
    });

    test('blurs the previous active element', async function (assert) {
      await render(hbs`
        <form>
          <input data-test-some-test-input/>
          <textarea data-test-some-textarea/>
        </form>
      `);

      const inputElement = document.querySelector('[data-test-some-test-input]');
      const textareaElement = document.querySelector('[data-test-some-textarea]');

      assert.strictEqual(document.activeElement, document.querySelector('body'));

      setupFocusEventStepListeners(assert, inputElement);
      setupBlurEventStepListeners(assert, inputElement);
      setupFocusEventStepListeners(assert, textareaElement);

      await focus('[data-test-some-test-input]');

      assert.strictEqual(
        document.activeElement,
        document.querySelector('[data-test-some-test-input]')
      );

      assert.verifySteps(FOCUS_STEPS);

      await focus('[data-test-some-textarea]');

      assert.strictEqual(
        document.activeElement,
        document.querySelector('[data-test-some-textarea]')
      );
      assert.verifySteps(BLUR_STEPS.concat(FOCUS_STEPS));
    });

    test('does not attempt to blur the previous element if it is not focusable', async function (assert) {
      await render(hbs`
        <form>
          <div data-test-some-div></div>
          <input data-test-some-test-input/>
        </form>
      `);

      const inputElement = document.querySelector('[data-test-some-test-input]');
      const divElement = document.querySelector('[data-test-some-div]');

      assert.strictEqual(document.activeElement, document.querySelector('body'));

      setupFocusEventStepListeners(assert, inputElement);

      divElement.focus();

      assert.verifySteps([]);

      await focus('[data-test-some-test-input]');

      assert.strictEqual(
        document.activeElement,
        document.querySelector('[data-test-some-test-input]')
      );
      assert.verifySteps(FOCUS_STEPS);
    });

    test('focusing an input via selector works', async function (assert) {
      await render(hbs`<input data-test-some-test-input/>`);

      const element = document.querySelector('[data-test-some-test-input]');

      setupFocusEventStepListeners(assert, element);

      assert.strictEqual(document.activeElement, document.querySelector('body'));

      await focus('[data-test-some-test-input]');

      assert.verifySteps(FOCUS_STEPS);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
    });

    test('focusing an input via element works', async function (assert) {
      await render(hbs`<input data-test-some-test-input/>`);

      const element = document.querySelector('[data-test-some-test-input]');

      setupFocusEventStepListeners(assert, element);

      assert.strictEqual(document.activeElement, document.querySelector('body'));

      await focus(element);

      assert.verifySteps(FOCUS_STEPS);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
    });
  });
});
