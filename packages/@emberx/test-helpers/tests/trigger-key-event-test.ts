import { hbs } from '@emberx/component';
import { module, test } from 'qunitx';
import { setupRenderingTest, render, triggerKeyEvent } from '@emberx/test-helpers';

module('emberx/test-helpers | triggerKeyEvent', function (hooks) {
  setupRenderingTest(hooks);

  module('assertion before triggerKeyEvent error cases', function () {
    test('rejects if event type is missing', async function (assert) {
      await render(hbs`<div data-test-some-test-div></div>`);

      assert.rejects(
        triggerKeyEvent('[data-test-some-test-div]'),
        /Must provide an `eventType` to `triggerKeyEvent`/
      );
    });

    test('rejects if event type is invalid', async function (assert) {
      await render(hbs`<div data-test-some-test-div></div>`);

      assert.rejects(
        triggerKeyEvent('[data-test-some-test-div]', 'mouseenter'),
        /Must provide an `eventType` of keydown, keypress, keyup to `triggerKeyEvent` but you passed `mouseenter`./
      );
    });

    test('rejects if key code is missing', async function (assert) {
      await render(hbs`<div data-test-some-test-div></div>`);

      assert.rejects(
        triggerKeyEvent('[data-test-some-test-div]', 'keypress'),
        /Must provide a `key` or `keyCode` to `triggerKeyEvent`/
      );
    });

    test('rejects if empty string is passed in', async function (assert) {
      await render(hbs`<div data-test-some-test-div></div>`);

      assert.rejects(
        triggerKeyEvent('[data-test-some-test-div]', 'keypress', ''),
        /Must provide a `key` or `keyCode` to `triggerKeyEvent`/
      );
    });

    test('rejects if lower case key is passed in', async function (assert) {
      await render(hbs`<div data-test-some-test-div></div>`);

      assert.rejects(
        triggerKeyEvent('[data-test-some-test-div]', 'keypress', 'enter'),
        /Must provide a `key` to `triggerKeyEvent` that starts with an uppercase character but you passed `enter`./
      );
    });

    test('rejects if keyCode is passed as a string', async function (assert) {
      await render(hbs`<div data-test-some-test-div></div>`);

      assert.rejects(
        triggerKeyEvent('[data-test-some-test-div]', 'keypress', '13'),
        /Must provide a numeric `keyCode` to `triggerKeyEvent` but you passed `13` as a string./
      );
    });

    test('rejects for disabled form control', async function (assert) {
      await render(hbs`<textarea data-test-some-textarea disabled/>`);

      assert.rejects(
        triggerKeyEvent('[data-test-some-textarea]', 'keypress', '13'),
        new Error('Can not `triggerKeyEvent` on disabled [object HTMLTextAreaElement]')
      );
    });
  });

  module('actual triggerKeyEvent test cases', function () {
    function setupEventStepListeners(assert, element, eventsToRegister) {
      eventsToRegister.forEach((eventName) => {
        element.addEventListener(eventName, () => assert.step(eventName));
      });
    }

    test('triggering via selector with context set', async function (assert) {
      await render(hbs`<div data-test-some-test-div></div>`);

      const element = document.querySelector('[data-test-some-test-div]');

      setupEventStepListeners(assert, element, ['keydown']);

      await triggerKeyEvent('[data-test-some-test-div]', 'keydown', 13);

      assert.verifySteps(['keydown']);
    });

    test('triggering via element with context set', async function (assert) {
      await render(hbs`<div data-test-some-test-div></div>`);

      const element = document.querySelector('[data-test-some-test-div]');

      setupEventStepListeners(assert, element, ['keydown']);

      await triggerKeyEvent(element, 'keydown', 13);

      assert.verifySteps(['keydown']);
    });

    ['ctrl', 'shift', 'alt', 'meta'].forEach((modifierType) => {
      test(`triggering passing with ${modifierType} pressed`, async function (assert) {
        await render(hbs`<div data-test-some-test-div></div>`);

        const element = document.querySelector('[data-test-some-test-div]');
        element.addEventListener('keypress', (e) => {
          assert.step('keypress');
          assert.ok(e[`${modifierType}Key`], `has ${modifierType} indicated`);
        });

        await triggerKeyEvent(element, 'keypress', 13, { [`${modifierType}Key`]: true });

        assert.verifySteps(['keypress']);
      });
    });

    test(`can combine modifier keys`, async function (assert) {
      await render(hbs`<div data-test-some-test-div></div>`);

      const element = document.querySelector('[data-test-some-test-div]');
      element.addEventListener('keypress', (e) => {
        assert.step('keypress');
        assert.ok(e.ctrlKey, `has ctrlKey indicated`);
        assert.ok(e.altKey, `has altKey indicated`);
      });

      await triggerKeyEvent(element, 'keypress', 13, { altKey: true, ctrlKey: true });

      assert.verifySteps(['keypress']);
    });

    test('The value of the `event.key` is properly inferred from the given keycode and modifiers', async function (assert) {
      await render(hbs`<div data-test-some-test-div></div>`);

      const element = document.querySelector('[data-test-some-test-div]');
      async function checkKey(keyCode, key, modifiers) {
        const handler = (e) => assert.equal(e.key, key);

        element.addEventListener('keydown', handler);

        await triggerKeyEvent(element, 'keydown', keyCode, modifiers);

        element.removeEventListener('keydown', handler);
      }

      await checkKey(8, 'Backspace');
      await checkKey(9, 'Tab');
      await checkKey(13, 'Enter');
      await checkKey(16, 'Shift');
      await checkKey(17, 'Control');
      await checkKey(18, 'Alt');
      await checkKey(20, 'CapsLock');
      await checkKey(27, 'Escape');
      await checkKey(32, ' ');
      await checkKey(37, 'ArrowLeft');
      await checkKey(38, 'ArrowUp');
      await checkKey(39, 'ArrowRight');
      await checkKey(40, 'ArrowDown');
      await checkKey(48, '0');
      await checkKey(57, '9');
      await checkKey(91, 'Meta');
      await checkKey(93, 'Meta');
      await checkKey(187, '=');
      await checkKey(189, '-');
      await checkKey(65, 'a');
      await checkKey(90, 'z');
      await checkKey(65, 'A', { shiftKey: true });
      await checkKey(90, 'Z', { shiftKey: true });
    });

    test('The value of the `event.keyCode` is properly inferred from the given key', async function (assert) {
      await render(hbs`<div data-test-some-test-div></div>`);

      const element = document.querySelector('[data-test-some-test-div]');
      async function checkKeyCode(key, keyCode) {
        const handler = (e) => assert.equal(e.keyCode, keyCode);

        element.addEventListener('keydown', handler);

        await triggerKeyEvent(element, 'keydown', key);

        element.removeEventListener('keydown', handler);
      }

      await checkKeyCode('Backspace', 8);
      await checkKeyCode('Tab', 9);
      await checkKeyCode('Enter', 13);
      await checkKeyCode('Shift', 16);
      await checkKeyCode('Control', 17);
      await checkKeyCode('Alt', 18);
      await checkKeyCode('CapsLock', 20);
      await checkKeyCode('Escape', 27);
      await checkKeyCode(' ', 32);
      await checkKeyCode('ArrowLeft', 37);
      await checkKeyCode('ArrowUp', 38);
      await checkKeyCode('ArrowRight', 39);
      await checkKeyCode('ArrowDown', 40);
      await checkKeyCode('Meta', 91);
      await checkKeyCode('=', 187);
      await checkKeyCode('-', 189);
      await checkKeyCode('0', 48);
      await checkKeyCode('9', 57);
      await checkKeyCode('A', 65);
      await checkKeyCode('Z', 90);
    });
  });
});
