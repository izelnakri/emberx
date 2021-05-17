import { hbs } from '@emberx/component';
import { module, test } from 'qunitx';
import { setupRenderingTest, render, select } from '@emberx/test-helpers';

function setupEventStepListeners(assert, element) {
  ['focus', 'focusin', 'input', 'change'].forEach((eventName) => {
    element.addEventListener(eventName, () => assert.step(eventName));
  });
}

module('emberx/test-helpers | select', function (hooks) {
  setupRenderingTest(hooks);

  const SELECT_STEPS = ['focus', 'focusin', 'input', 'change'];
  const ADDITIONAL_STEPS = ['input', 'change'];

  test('select without target', async function (assert) {
    assert.rejects(select(), /Must pass an element or selector to `select`./);
  });

  test('select without options', async function (assert) {
    await render(hbs`<div data-test-some-div></div>`);

    const element = document.querySelector('[data-test-some-div]');
    assert.rejects(
      select(element, undefined),
      /Must provide an `option` or `options` to select when calling `select`./
    );
    assert.rejects(
      select(element, null),
      /Must provide an `option` or `options` to select when calling `select`./
    );
  });

  test('select with unfindable selector ', async function (assert) {
    await render(hbs`<div data-test-some-div></div>`);

    assert.rejects(
      select('#fake-selector', 'example'),
      /Element not found when calling `select\('#fake-selector'\)`/
    );
  });

  test('select with element that is not a HTMLSelectElement', async function (assert) {
    await render(hbs`<div data-test-some-div></div>`);

    const element = document.querySelector('[data-test-some-div]');
    assert.rejects(
      select(element, 'example'),
      `Element is not a HTMLSelectElement when calling \`select(${element})\``
    );
  });

  test('select with element that is disabled', async function (assert) {
    await render(hbs`
      <select data-test-some-select disabled>
        <option>One</option>
        <option>Two</option>
      </select>
    `);

    const element = document.querySelector('[data-test-some-select]');
    assert.rejects(
      select(element, 'One'),
      `Element is disabled when calling \`select(${element})\`./`
    );
  });

  test('select | multiple: false - options.length > 1', async function (assert) {
    await render(hbs`
      <select data-test-some-select>
        <option>One</option>
        <option>Two</option>
      </select>
    `);

    const element = document.querySelector('[data-test-some-select]');
    assert.rejects(
      select(element, ['apple', 'orange']),
      `HTMLSelectElement \`multiple\` attribute is set to \`false\` but multiple options have been passed when calling \`select(${element})\``
    );
  });

  test('select | 4 options - multiple: true - optionsToSelect.length : 2', async function (assert) {
    await render(hbs`
      <select data-test-some-select multiple>
        <option>apple</option>
        <option>orange</option>
        <option>pineapple</option>
        <option>pear</option>
      </select>
    `);

    const element = document.querySelector('[data-test-some-select]');

    setupEventStepListeners(assert, element);

    await select(element, ['apple', 'orange']);

    assert.verifySteps(SELECT_STEPS);
    assert.equal(element.selectedOptions.length, 2);
    assert.equal(element.selectedOptions[0].value, 'apple');
    assert.equal(element.selectedOptions[1].value, 'orange');
  });

  test('select | 4 options - multiple: false - optionsToSelect.length : 1', async function (assert) {
    await render(hbs`
      <select data-test-some-select>
        <option>apple</option>
        <option>orange</option>
        <option>pineapple</option>
        <option>pear</option>
      </select>
    `);

    const element = document.querySelector('[data-test-some-select]');

    setupEventStepListeners(assert, element);
    await select(element, 'apple');

    assert.verifySteps(SELECT_STEPS);
    assert.equal(element.selectedIndex, 0);
  });

  test('select | multiple: false | select new option', async function (assert) {
    await render(hbs`
      <select data-test-some-select>
        <option>apple</option>
        <option>orange</option>
        <option>pineapple</option>
        <option>pear</option>
      </select>
    `);

    const element = document.querySelector('[data-test-some-select]');

    setupEventStepListeners(assert, element);

    await select(element, 'apple');
    await select(element, 'orange');

    assert.verifySteps(SELECT_STEPS.concat(ADDITIONAL_STEPS));
    assert.equal(element.selectedIndex, 1);
  });

  test('select | multiple: true | keepPreviouslySelected: true', async function (assert) {
    await render(hbs`
      <select data-test-some-select multiple>
        <option>apple</option>
        <option>orange</option>
        <option>pineapple</option>
        <option>pear</option>
      </select>
    `);

    const element = document.querySelector('[data-test-some-select]');

    setupEventStepListeners(assert, element);

    await select(element, 'apple');
    await select(element, 'orange', true);

    assert.verifySteps(SELECT_STEPS.concat(ADDITIONAL_STEPS));
    assert.equal(element.selectedOptions[0].value, 'apple');
    assert.equal(element.selectedOptions[1].value, 'orange');
  });

  test('select | multiple: true | keepPreviouslySelected: false', async function (assert) {
    await render(hbs`
      <select data-test-some-select multiple>
        <option>apple</option>
        <option>orange</option>
        <option>pineapple</option>
        <option>pear</option>
      </select>
    `);

    const element = document.querySelector('[data-test-some-select]');

    setupEventStepListeners(assert, element);

    await select(element, 'apple');
    await select(element, 'orange', false);

    assert.verifySteps(SELECT_STEPS.concat(ADDITIONAL_STEPS));
    assert.equal(element.selectedOptions[0].value, 'orange');
    assert.equal(element.selectedOptions.length, 1);
  });
});
