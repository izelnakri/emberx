import { module, test } from 'qunitx';
import Component, { tracked } from '@emberx/component';
import { render, rerender, clearRender, hbs } from '@emberx/test-helpers';
import { setupRenderingTest } from './helpers/index.ts';

class Counter {
  @tracked count = 1;
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
