import { module, test } from 'qunitx';
import Component, { tracked } from '@emberx/component';
import { render, rerender, clearRender, hbs } from '@emberx/test-helpers';
import { setupRenderingTest } from './helpers/index.ts';

class Counter {
  @tracked count = 1;
}

// Steps 'destroyed' when it is torn down.
let step: (name: string) => void = () => {};
class Farewell extends Component {
  static template = hbs`<p data-test-farewell>Bye</p>`;

  willDestroy() {
    super.willDestroy();
    step('destroyed');
  }
}

class Greeting extends Component {
  static template = hbs`<p data-test-greeting>Hello {{@name}}</p>`;
}

module('@emberx/test-helpers | rerender and clearRender', function (hooks) {
  setupRenderingTest(hooks);

  test('rerender waits for the render that a tracked change scheduled', async function (assert) {
    this.counter = new Counter();
    await render(hbs`<p data-test-count>{{this.counter.count}}</p>`);

    this.counter.count = 2;

    assert.dom('[data-test-count]').hasText('1', 'renders happen a moment after the change');

    await rerender();

    assert.dom('[data-test-count]').hasText('2');
  });

  test('rerender resolves right away when nothing is scheduled', async function (assert) {
    await render(hbs`<p data-test-count>static</p>`);
    await rerender();

    assert.dom('[data-test-count]').hasText('static');
  });

  test('clearRender destroys the component it clears', async function (assert) {
    step = (name) => assert.step(name);

    await render(hbs`<Farewell />`, { Farewell });
    assert.verifySteps([]);

    await clearRender();

    assert.dom('[data-test-farewell]').doesNotExist();
    assert.verifySteps(['destroyed']);
    step = () => {};
  });

  test('clearRender empties what render rendered, and render starts afresh after it', async function (assert) {
    await render(hbs`<Greeting @name="Izel" />`, { Greeting });

    assert.dom('[data-test-greeting]').hasText('Hello Izel');

    await clearRender();

    assert.dom(this.element).hasNoText();
    assert.dom('[data-test-greeting]').doesNotExist();

    await render(hbs`<Greeting @name="Tom" />`, { Greeting });

    assert.dom('[data-test-greeting]').hasText('Hello Tom');
  });
});
