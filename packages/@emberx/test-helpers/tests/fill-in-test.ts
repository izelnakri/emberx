import { hbs } from '@emberx/component';
import { module, test } from 'qunitx';
import { setupRenderingTest, render, fillIn } from '@emberx/test-helpers';

function setupEventStepListeners(assert, element) {
  ['focus', 'focusin', 'input', 'change'].forEach((eventName) => {
    element.addEventListener(eventName, () => assert.step(eventName));
  });
}

module('emberx/test-helpers | fillIn', function (hooks) {
  setupRenderingTest(hooks);

  module('assertion before fill error cases', function () {
    test('filling in a non-fillable element throws', async function (assert) {
      await render(hbs`<div data-test-some-test-div></div>`);

      assert.rejects(
        fillIn('[data-test-some-test-div]', 'foo'),
        /`fillIn` is only usable on form controls or contenteditable elements/
      );
    });

    test('filling in a non-fillable element throws', async function (assert) {
      await render(hbs`<input data-test-some-test-input disabled />`);

      assert.rejects(
        fillIn(`[data-test-some-test-input]`, 'foo'),
        new Error("Can not `fillIn` disabled '[data-test-some-test-input]'.")
      );

      assert.rejects(
        fillIn(document.querySelector('[data-test-some-test-input]'), 'foo'),
        new Error("Can not `fillIn` disabled '[object HTMLInputElement]'.")
      );
    });

    test('filling in a readonly element throws', async function (assert) {
      await render(hbs`<input data-test-some-test-input readonly="readonly" />`);

      assert.rejects(
        fillIn(`[data-test-some-test-input]`, 'foo'),
        new Error("Can not `fillIn` readonly '[data-test-some-test-input]'.")
      );

      assert.rejects(
        fillIn(document.querySelector('[data-test-some-test-input]'), 'foo'),
        new Error("Can not `fillIn` readonly '[object HTMLInputElement]'.")
      );
    });

    test('rejects if selector is not found', async function (assert) {
      assert.rejects(
        fillIn(`#foo-bar-baz-not-here-ever-bye-bye`, 'foo'),
        /Element not found when calling `fillIn\('#foo-bar-baz-not-here-ever-bye-bye'\)`/
      );
    });

    test('rejects if text to fill in is not provided', async function (assert) {
      await render(hbs`<input data-test-some-test-input />`);

      assert.rejects(
        fillIn('[data-test-some-test-input]'),
        /Must provide `text` when calling `fillIn`/
      );
    });
  });

  const CLICK_STEPS = ['focus', 'focusin', 'input', 'change'];

  module('actual fillIn test cases', function () {
    test('does not run sync', async function (assert) {
      await render(hbs`<input data-test-some-test-input/>`);

      const element = document.querySelector('[data-test-some-test-input]');

      setupEventStepListeners(assert, element);

      const promise = fillIn(element, 'foo');

      await promise;

      assert.verifySteps(CLICK_STEPS);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
      assert.equal(element.value, 'foo');
    });

    test('fills a textarea via selector correctly', async function (assert) {
      assert.expect(11);

      this.param = 'some title';
      this.assertTrue = (param) => assert.equal(param, 'some title');

      await render(hbs`
        <textarea data-test-some-test-textarea {{on "focus" (fn @assertTrue @param)}}
          {{on "focusin" (fn @assertTrue @param)}} {{on "change" (fn @assertTrue @param)}}
          {{on "focus" (fn @assertTrue @param)}}/>
      `);

      const element = document.querySelector('[data-test-some-test-textarea]');

      setupEventStepListeners(assert, element);

      await fillIn('[data-test-some-test-textarea]', 'foo');

      assert.verifySteps(CLICK_STEPS);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
      assert.equal(element.value, 'foo');
    });

    test('fills a textarea via element correctly', async function (assert) {
      await render(hbs`<textarea data-test-some-test-textarea/>`);

      const element = document.querySelector('[data-test-some-test-textarea]');

      setupEventStepListeners(assert, element);

      await fillIn(element, 'foo');

      assert.verifySteps(CLICK_STEPS);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
      assert.equal(element.value, 'foo');
    });

    test('fills a input via selector correctly', async function (assert) {
      assert.expect(11);

      this.param = 'some title';
      this.assertTrue = (param) => assert.equal(param, 'some title');

      await render(hbs`
        <input data-test-some-test-input {{on "focus" (fn @assertTrue @param)}}
          {{on "focusin" (fn @assertTrue @param)}} {{on "change" (fn @assertTrue @param)}}
          {{on "focus" (fn @assertTrue @param)}}/>
      `);

      const element = document.querySelector('[data-test-some-test-input]');

      setupEventStepListeners(assert, element);

      await fillIn('[data-test-some-test-input]', 'foo');

      assert.verifySteps(CLICK_STEPS);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
      assert.equal(element.value, 'foo');
    });

    test('fills a input via element correctly', async function (assert) {
      await render(hbs`<input data-test-some-test-input/>`);

      const element = document.querySelector('[data-test-some-test-input]');

      setupEventStepListeners(assert, element);

      await fillIn(element, 'foo');

      assert.verifySteps(CLICK_STEPS);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
      assert.equal(element.value, 'foo');
    });

    test('fills an content editable element via selector correctly', async function (assert) {
      await render(hbs`<div contenteditable="true" data-test-some-div></div>`);

      const element = document.querySelector('[data-test-some-div]');

      setupEventStepListeners(assert, element);

      assert.equal(element.innerHTML, '');

      await fillIn('[data-test-some-div]', 'foo');

      assert.verifySteps(CLICK_STEPS);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
      assert.equal(element.innerHTML, 'foo');
    });

    test('fills an content editable element via element correctly', async function (assert) {
      await render(hbs`<div contenteditable="true" data-test-some-div></div>`);

      const element = document.querySelector('[data-test-some-div]');

      setupEventStepListeners(assert, element);

      assert.equal(element.innerHTML, '');

      await fillIn(element, 'foo');

      assert.verifySteps(CLICK_STEPS);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
      assert.equal(element.innerHTML, 'foo');
    });

    test('filling an input via selector with empty string', async function (assert) {
      await render(hbs`<input data-test-some-test-input value="something" />`);

      const element = document.querySelector('[data-test-some-test-input]');

      setupEventStepListeners(assert, element);

      assert.equal(element.value, 'something');

      await fillIn(element, '');

      assert.verifySteps(CLICK_STEPS);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
      assert.equal(element.value, '');
    });
  });

  module('after fillIn error assertion test cases', function () {
    test('filling an input with a maxlength with suitable value', async function (assert) {
      await render(hbs`<input data-test-some-test-input value="something" />`);

      const element = document.querySelector('[data-test-some-test-input]');
      const maxLengthString = 'f';

      element.setAttribute('maxlength', maxLengthString.length);
      setupEventStepListeners(assert, element);

      await fillIn(element, maxLengthString);

      assert.verifySteps(CLICK_STEPS);
      assert.equal(
        element.value,
        maxLengthString,
        `fillIn respects input attribute [maxlength=${maxLengthString.length}]`
      );
      assert.verifySteps([]);
      assert.rejects(
        fillIn(element, 'foo'),
        new Error("Can not `fillIn` with text: 'foo' that exceeds maxlength: '1'.")
      );
    });

    test('filling in a non-constrained input type(number) with maxlength succeeds', async function (assert) {
      await render(hbs`
        <input data-test-some-test-input type="number" maxlength="1" />
      `);

      const element = document.querySelector('[data-test-some-test-input]');

      setupEventStepListeners(assert, element);

      assert.equal(element.value, '');
      assert.verifySteps([]);

      await fillIn(element, '123');

      assert.verifySteps(CLICK_STEPS);
      assert.equal(element.value, '123');

      await fillIn(element, '3');

      assert.verifySteps(['input', 'change']);
      assert.equal(element.value, '3');
    });

    test('filling a textarea with a maxlength with suitable value', async function (assert) {
      await render(hbs`
        <textarea data-test-some-test-textarea maxlength="1" />
      `);

      const element = document.querySelector('[data-test-some-test-textarea]');

      setupEventStepListeners(assert, element);

      assert.equal(element.value, '');
      assert.verifySteps([]);
      assert.rejects(
        fillIn(element, 'foo'),
        new Error("Can not `fillIn` with text: 'foo' that exceeds maxlength: '1'.")
      );
      assert.verifySteps([]);
      assert.equal(element.value, '');

      await fillIn(element, 'f');

      assert.verifySteps(CLICK_STEPS);
      assert.equal(element.value, 'f', 'fillIn does not reject non-constrained input types');
    });
  });
});
