import { hbs } from '@emberx/component';
import { module, test } from 'qunitx';
import { render, triggerEvent } from '@emberx/test-helpers';
import { setupRenderingTest } from '../helpers';

function setupEventStepListeners(assert, element, arrayOfEvents) {
  arrayOfEvents.forEach((eventName) => {
    element.addEventListener(eventName, () => assert.step(eventName));
  });
}

module('emberx/test-helpers | triggerEvent', function (hooks) {
  setupRenderingTest(hooks);

  module('assertion before triggerEvent error cases', function () {
    test('rejects if selector is not found', async function (assert) {
      await render(hbs`<div data-test-some-div></div>`);

      assert.rejects(
        triggerEvent(`#foo-bar-baz-not-here-ever-bye-bye`, 'mouseenter'),
        /Element not found when calling `triggerEvent\('#foo-bar-baz-not-here-ever-bye-bye'/
      );
    });

    test('rejects if event type is not passed', async function (assert) {
      await render(hbs`<div data-test-some-div></div>`);

      assert.rejects(
        triggerEvent(document.querySelector('[data-test-some-div]')),
        /Must provide an `eventType` to `triggerEvent`/
      );
    });

    test('rejects for disabled form control', async function (assert) {
      await render(hbs`<textarea data-test-some-textarea disabled />`);

      assert.rejects(
        triggerEvent('[data-test-some-textarea]', 'mouseenter'),
        new Error('Can not `triggerEvent` on disabled [object HTMLTextAreaElement]')
      );
    });
  });

  module('actual triggerEvent tests', function () {
    test('can trigger arbitrary event types', async function (assert) {
      await render(hbs`<div data-test-some-div></div>`);

      const element = document.querySelector('[data-test-some-div]');
      element.addEventListener('fliberty', (event) => {
        assert.step('fliberty');
        assert.ok(event instanceof Event, `fliberty listener receives a native event`);
      });

      await triggerEvent(element, 'fliberty');

      assert.verifySteps(['fliberty']);
    });

    test('triggering event via selector works', async function (assert) {
      await render(hbs`<div data-test-some-div></div>`);

      setupEventStepListeners(assert, document.querySelector('[data-test-some-div]'), [
        'mouseenter',
      ]);

      await triggerEvent('[data-test-some-div]', 'mouseenter');

      assert.verifySteps(['mouseenter']);
    });

    test('triggering event via element works', async function (assert) {
      await render(hbs`<div data-test-some-div></div>`);

      const element = document.querySelector('[data-test-some-div]');

      setupEventStepListeners(assert, element, ['mouseenter']);

      await triggerEvent(element, 'mouseenter');

      assert.verifySteps(['mouseenter']);
    });

    test('events properly bubble upwards', async function (assert) {
      await render(hbs`
        <div data-test-some-div>
          <div id="outer">
            <div id="inner"></div>
          </div>
        </div>
      `);

      const element = document.querySelector('[data-test-some-div]');

      setupEventStepListeners(assert, element, ['mouseenter']);

      const outer = element.querySelector('#outer');
      const inner = element.querySelector('#inner');

      outer.addEventListener('mouseenter', () => {
        assert.step('outer: mouseenter');
      });

      inner.addEventListener('mouseenter', () => {
        assert.step('inner: mouseenter');
      });

      await triggerEvent('#inner', 'mouseenter');

      assert.verifySteps(['inner: mouseenter', 'outer: mouseenter', 'mouseenter']);
    });
  });

  module('DOM Helper: triggerEvent with window', function () {
    test('triggering event via window without context set fires the given event type', async function (assert) {
      const listener = (event) => {
        assert.step('resize');
        assert.ok(event instanceof Event, `resize listener receives a native event`);
      };
      window.addEventListener('resize', listener);

      await triggerEvent(window, 'resize');

      assert.verifySteps(['resize']);

      window.removeEventListener('resize', listener);
    });
  });
});
