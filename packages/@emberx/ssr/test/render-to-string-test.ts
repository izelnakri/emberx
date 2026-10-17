import Component, { hbs, tracked, action, didRender, renderComponent, resetRendering } from '@emberx/component';
import { renderToString } from '@emberx/ssr';
import { module, test } from 'qunitx';

// Steps "destroyed" when a Farewell is torn down.
let step: (name: string) => void = () => {};

class Item extends Component {
  static template = hbs`<li>{{@name}}</li>`;
}

class List extends Component {
  static includes = { Item };
  static template = hbs`<ul>{{#each @names as |name|}}<Item @name={{name}} />{{/each}}</ul><input disabled>`;
}

class Counter extends Component {
  @tracked accessor count = 0;

  @action
  increment() {
    this.count++;
  }

  static template = hbs`<p data-count>{{@label}}: {{this.count}}</p><button type="button" {{on "click" this.increment}}>+</button>`;
}

class Farewell extends Component {
  willDestroy() {
    super.willDestroy();
    step('destroyed');
  }

  static template = hbs`<p data-farewell>Bye</p>`;
}

/** An element in jsdom's document holding `html`, as a browser holds a server-rendered page. */
function serverRendered(html: string): HTMLElement {
  const element = document.createElement('div');
  element.innerHTML = html;
  document.body.appendChild(element);

  return element;
}

module('@emberx/ssr | renderToString', function (hooks) {
  hooks.afterEach(function () {
    resetRendering();
    step = () => {};
  });

  test('renders nested components and args to HTML', async function (assert) {
    const html = await renderToString(List, { args: { names: ['first', 'second'] }, hydratable: false });

    assert.equal(html, '<ul><li>first</li><li>second</li></ul><input disabled>');
  });

  test('does not touch the global DOM', async function (assert) {
    class Greeting extends Component {
      static template = hbs`<p>Hello</p>`;
    }

    const before = document.body.innerHTML;

    assert.equal(await renderToString(Greeting, { hydratable: false }), '<p>Hello</p>');
    assert.equal(document.body.innerHTML, before);
  });

  test("is hydratable by default: the markup carries Glimmer's block markers", async function (assert) {
    const html = await renderToString(List, { args: { names: ['first'] } });

    assert.ok(html.startsWith('<!--%+b:0%-->'), 'it opens the first block');
    assert.ok(html.includes('<li><!--%+b:6%-->first<!--%-b:6%--></li>'), 'and marks every dynamic part');
  });

  test("a browser render into the markup adopts the server's DOM, and updates it in place", async function (assert) {
    const element = serverRendered(await renderToString(Counter, { args: { label: 'Clicks' } }));
    const paragraph = element.querySelector('[data-count]');

    await renderComponent(Counter, { element, args: { label: 'Clicks' } });

    assert.strictEqual(element.querySelector('[data-count]'), paragraph, 'the same node, not a new one');
    assert.notOk(element.innerHTML.includes('%+b'), 'the markers are gone');
    assert.equal(paragraph!.textContent, 'Clicks: 0');

    element.querySelector('button')!.click();
    await didRender();

    assert.strictEqual(element.querySelector('[data-count]'), paragraph);
    assert.equal(paragraph!.textContent, 'Clicks: 1', 'its modifiers run, and it re-renders in place');
    element.remove();
  });

  test('a later render into the element replaces the hydrated one, and destroys it', async function (assert) {
    // The server's own render is destroyed once serialized: count from here.
    const element = serverRendered(await renderToString(Farewell));
    step = (name) => assert.step(name);

    await renderComponent(Farewell, { element });
    assert.verifySteps([]);

    await renderComponent(List, { element, args: { names: ['after'] } });

    assert.verifySteps(['destroyed']);
    assert.equal(element.querySelector('ul')!.textContent, 'after');
    assert.notOk(element.querySelector('[data-farewell]'));
    element.remove();
  });
});
