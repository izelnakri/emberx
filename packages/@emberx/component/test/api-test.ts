import Component, { renderComponent } from '@emberx/component';
import { module, test } from 'qunitx';
import { setupRenderingTest } from './helpers/index.ts';

module('@emberx/component | Public API', function (hooks) {
  setupRenderingTest(hooks);

  test('holds the correct default static properties', async function (assert) {
    assert.ok(typeof Component.includes === 'object');
  });

  test('the suites run with EMBERX_DEBUG on: a component built outside a render is reported', function (assert) {
    class Hand extends Component {}

    assert.throws(() => new Hand({}, {}), /You must pass both the owner and args to super\(\) in your component: Hand/);
  });

  test('Component.setTemplate() works correctly', async function (assert) {
    class SomeComponent extends Component {}

    SomeComponent.setTemplate(`<h1 id="some-component">This is from SomeComponent</h1>`);

    renderComponent(SomeComponent, {
      element: document.getElementById('ember-testing'),
      owner: {},
    });

    assert.dom('#some-component').hasText('This is from SomeComponent');

    class OtherComponent extends Component {}

    OtherComponent.setTemplate(`<h1 id="other-component">changed content</h1>`);

    renderComponent(OtherComponent, {
      element: document.getElementById('ember-testing'),
      owner: {},
    });

    assert.dom('#other-component').hasText('changed content');
  });
});
