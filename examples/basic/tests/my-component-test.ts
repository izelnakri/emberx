import { module, test } from 'qunitx';
import { render, click, hbs, setupRenderingTest } from '@emberx/test-helpers';
import MyComponent from '../src/MyComponent.ts';
import LocaleService from '../src/services/LocaleService.ts';

module('examples/basic | MyComponent', function (hooks) {
  setupRenderingTest(hooks);
  hooks.beforeEach(function () {
    this.owner.register('service:locale', new LocaleService('en_US'));
  });

  test('it renders the template blocks, the helper and the locale service', async function (assert) {
    await render(hbs`<MyComponent />`, { MyComponent });

    assert.dom('p:nth-of-type(1)').hasText('hello world');
    assert.dom(this.element).includesText('Helper: Hello foo');
    assert.dom('p:nth-of-type(2)').hasText('Current locale: en_US');
    assert.dom('p:nth-of-type(3)').hasText('Component is in a US locale');
    assert.dom('b').hasText('Counter Val: 55');
  });

  test('Increment counts up in the child component', async function (assert) {
    await render(hbs`<MyComponent />`, { MyComponent });

    await click('#ember-testing button:nth-of-type(1)');
    await click('#ember-testing button:nth-of-type(1)');

    assert.dom('b').hasText('Counter Val: 57');
  });

  test('Change Locale toggles the locale, and the helper that reads the service follows', async function (assert) {
    await render(hbs`<MyComponent />`, { MyComponent });

    await click('#ember-testing button:nth-of-type(2)');

    assert.dom('p:nth-of-type(2)').hasText('Current locale: zh_CN');
    assert.dom('p:nth-of-type(3)').hasText('Component is not in a US locale');

    await click('#ember-testing button:nth-of-type(2)');

    assert.dom('p:nth-of-type(2)').hasText('Current locale: en_US');
    assert.dom('p:nth-of-type(3)').hasText('Component is in a US locale');
  });
});
