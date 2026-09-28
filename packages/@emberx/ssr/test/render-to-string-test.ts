import Component, { hbs } from '@emberx/component';
import { renderToString } from '@emberx/ssr';
import { module, test } from 'qunitx';

module('@emberx/ssr | renderToString', function () {
  test('renders nested components and args to HTML', async function (assert) {
    class Item extends Component {
      static template = hbs`<li>{{@name}}</li>`;
    }

    class List extends Component {
      static includes = { Item };
      static template = hbs`<ul>{{#each @names as |name|}}<Item @name={{name}} />{{/each}}</ul><input disabled>`;
    }

    const html = await renderToString(List, { args: { names: ['first', 'second'] } });

    assert.equal(html, '<ul><li>first</li><li>second</li></ul><input disabled>');
  });

  test('does not touch the global DOM', async function (assert) {
    class Greeting extends Component {
      static template = hbs`<p>Hello</p>`;
    }

    const before = document.body.innerHTML;

    assert.equal(await renderToString(Greeting), '<p>Hello</p>');
    assert.equal(document.body.innerHTML, before);
  });
});
