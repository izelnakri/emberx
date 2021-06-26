import { hbs } from '@emberx/component';
import { module, test } from 'qunitx';
import { render, typeIn } from '@emberx/test-helpers';
import { setupRenderingTest } from '../helpers/index';

module('@emberx/test-helpers | typeIn', function (hooks) {
  setupRenderingTest(hooks);

  module('assertion before fill error cases', function () {
    test('typing in a non-typable element', async function (assert) {
      await render(hbs`<div data-test-some-test-div></div>`);

      assert.rejects(
        typeIn('[data-test-some-test-div]', 'foo'),
        /`typeIn` is only usable on form controls or contenteditable elements/
      );
    });

    test('typing in a disabled element', async function (assert) {
      await render(hbs`<input data-test-some-input disabled/>`);

      assert.rejects(
        typeIn(`[data-test-some-input]`, 'foo'),
        new Error("Can not `typeIn` disabled '[data-test-some-input]'.")
      );
      assert.rejects(
        typeIn(document.querySelector('[data-test-some-input]'), 'foo'),
        new Error("Can not `typeIn` disabled '[object HTMLInputElement]'.")
      );
    });

    test('typing in a readonly element', async function (assert) {
      await render(hbs`<input data-test-some-input readonly/>`);

      assert.rejects(
        typeIn(`[data-test-some-input]`, 'foo'),
        new Error("Can not `typeIn` readonly '[data-test-some-input]'.")
      );
      assert.rejects(
        typeIn(document.querySelector('[data-test-some-input]'), 'foo'),
        new Error("Can not `typeIn` readonly '[object HTMLInputElement]'.")
      );
    });

    test('rejects if selector is not found', async function (assert) {
      assert.rejects(
        typeIn(`#foo-bar-baz-not-here-ever-bye-bye`, 'foo'),
        /Element not found when calling `typeIn\('#foo-bar-baz-not-here-ever-bye-bye'\)`/
      );
    });

    test('rejects if text to fill in is not provided', async function (assert) {
      await render(hbs`<input data-test-some-input/>`);

      assert.rejects(typeIn('[data-test-some-input]'), /Must provide `text` when calling `typeIn`/);
    });
  });

  module('actual typeIn tests', function () {
    /*
     * Event order based on https://jsbin.com/zitazuxabe/edit?html,js,console,output
     */
    const FOCUS_EVENTS = ['focus', 'focusin'];
    const KEY_EVENTS = [
      'keydown',
      'keypress',
      'input',
      'keyup',
      'keydown',
      'keypress',
      'input',
      'keyup',
      'keydown',
      'keypress',
      'input',
      'keyup',
    ];
    const EXPECTED_EVENTS = FOCUS_EVENTS.concat(KEY_EVENTS).concat(['change']);

    function setupEventStepListeners(assert, element) {
      EXPECTED_EVENTS.forEach((eventName) => {
        element.addEventListener(eventName, () => assert.step(eventName));
      });
    }

    function generateKeyEvents(letterCount) {
      return KEY_EVENTS.reduce((result, keyName) => {
        Array.from({ length: letterCount }).forEach(() => {
          result.push(keyName);
        });

        return result;
      }, []);
    }

    test('typing in an input', async function (assert) {
      await render(hbs`<input data-test-some-input/>`);

      const element = document.querySelector('[data-test-some-input]');
      setupEventStepListeners(assert, element);

      await typeIn(element, 'foo');

      assert.verifySteps(FOCUS_EVENTS.concat(generateKeyEvents(3)).concat(['change']));
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
      assert.equal(element.value, 'foo');

      await typeIn(element, 'F o');

      assert.verifySteps(generateKeyEvents(3).concat(['change']));
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
      assert.equal(element.value, 'fooF o');
    });

    test('typing in an input with a delay', async function (assert) {
      await render(hbs`<input data-test-some-input/>`);

      const element = document.querySelector('[data-test-some-input]');

      setupEventStepListeners(assert, element);

      await typeIn(element, 'foo', { delay: 150 });

      assert.verifySteps(FOCUS_EVENTS.concat(generateKeyEvents(3)).concat(['change']));
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
      assert.equal(element.value, 'foo');
    });

    test('typing in a textarea', async function (assert) {
      await render(hbs`<textarea data-test-some-textarea/>`);

      const element = document.querySelector('[data-test-some-textarea]');

      setupEventStepListeners(assert, element);

      await typeIn(element, 'foo');

      assert.verifySteps(FOCUS_EVENTS.concat(generateKeyEvents(3)).concat(['change']));
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
      assert.equal(element.value, 'foo');
    });

    test('typing in a contenteditable element', async function (assert) {
      await render(hbs`<div data-test-some-test-div contenteditable="true"></div>`);

      const element = document.querySelector('[data-test-some-test-div]');

      setupEventStepListeners(assert, element);

      await typeIn(element, 'foo');

      assert.verifySteps(FOCUS_EVENTS.concat(generateKeyEvents(3)).concat(['change']));
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
      assert.equal(element.innerHTML, 'foo');
    });

    test('typing in an input with a maxlength with suitable value', async function (assert) {
      await render(hbs`<input data-test-some-input maxlength=3/>`);

      const element = document.querySelector('[data-test-some-input]');
      const maxLengthString = 'foo';

      setupEventStepListeners(assert, element);

      await typeIn(element, maxLengthString);

      assert.verifySteps(FOCUS_EVENTS.concat(generateKeyEvents(3)).concat(['change']));
      assert.equal(
        element.value,
        maxLengthString,
        `typeIn respects input attribute [maxlength=${maxLengthString.length}]`
      );
    });

    test('typing in an string input with a maxlength with too long value', async function (assert) {
      await render(hbs`<input data-test-some-input maxlength=3/>`);

      const element = document.querySelector('[data-test-some-input]');

      setupEventStepListeners(assert, element);

      await assert.rejects(
        typeIn(element, 'emberx').finally(() => {
          assert.verifySteps(
            FOCUS_EVENTS.concat(generateKeyEvents(3)).concat([
              'keydown',
              'keydown',
              'keydown',
              'keypress',
              'keypress',
              'keypress',
            ])
          );
          assert.equal(element.value, 'emb');
        }),
        new Error("Can not `typeIn` with text: 'embe' that exceeds maxlength: '3'.")
      );
    });

    test('typing on an number input with maxlength raises', async function (assert) {
      await render(hbs`<input type="number" data-test-some-input maxlength="2"/>`);

      const element = document.querySelector('[data-test-some-input]');

      setupEventStepListeners(assert, element);

      await typeIn(element, '123');

      assert.verifySteps(FOCUS_EVENTS.concat(generateKeyEvents(3)).concat(['change']));
      assert.equal(element.value, '123', 'typeIn does not reject non-constrained input types');
    });

    test('typing in a textarea with a maxlength with suitable value', async function (assert) {
      await render(hbs`<textarea data-test-some-input maxlength=3/>`);

      const element = document.querySelector('[data-test-some-input]');
      const maxLengthString = 'foo';

      setupEventStepListeners(assert, element);

      await typeIn(element, maxLengthString);

      assert.verifySteps(FOCUS_EVENTS.concat(generateKeyEvents(3)).concat(['change']));
      assert.equal(
        element.value,
        maxLengthString,
        `typeIn respects textarea attribute [maxlength=${maxLengthString.length}]`
      );
    });

    test('typing in a textarea with a maxlength with too long value', async function (assert) {
      await render(hbs`<textarea data-test-some-input maxlength="3"/>`);

      const element = document.querySelector('[data-test-some-input]');

      setupEventStepListeners(assert, element);

      await assert.rejects(
        typeIn(element, 'emberx').finally(() => {
          assert.verifySteps(
            FOCUS_EVENTS.concat(generateKeyEvents(3)).concat([
              'keydown',
              'keydown',
              'keydown',
              'keypress',
              'keypress',
              'keypress',
            ])
          );
          assert.equal(element.value, 'emb');
        }),
        new Error("Can not `typeIn` with text: 'embe' that exceeds maxlength: '3'.")
      );
    });
  });
});
