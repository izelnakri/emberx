import Component, {
  hbs,
  service,
  renderComponent,
  action,
  tracked,
  didRender,
  getAsyncActionsQueue,
} from '@emberx/component';
import { module, test } from 'qunitx';
import { setupRenderingTest } from './helpers/index.ts';

module('@emberx/component | Decorators', function (hooks) {
  setupRenderingTest(hooks);

  test('@tracked accessor re-renders what read it, on an assignment', async function (assert) {
    let list!: List;
    class List extends Component {
      @tracked accessor title = 'Groceries';
      @tracked accessor items = ['milk'];

      static template = hbs`<h1>{{this.title}}</h1><p>{{this.items.length}}</p>`;

      constructor(owner: object, args: Record<string, unknown>) {
        super(owner, args);
        list = this;
      }
    }

    await renderComponent(List, { element: document.getElementById('ember-testing') as HTMLElement, owner: {} });
    assert.dom('h1').hasText('Groceries');

    list.title = 'Errands';
    list.items = [...list.items, 'bread'];
    await didRender();

    assert.dom('h1').hasText('Errands');
    assert.dom('p').hasText('2');
  });

  test('@tracked on a field, without accessor, says how to write it', function (assert) {
    assert.throws(() => {
      class Wrong {
        // @ts-expect-error: a field decorator's types do not match tracked's
        @tracked count = 0;
      }
      return new Wrong();
    }, /@tracked decorates an accessor: write `@tracked accessor count`/);
  });

  test('@action binds the method to its instance', function (assert) {
    class Counter {
      count = 0;

      @action
      increment() {
        this.count++;
      }
    }

    const counter = new Counter();
    const { increment } = counter;
    increment();

    assert.equal(counter.count, 1);
    assert.notStrictEqual(new Counter().increment, counter.increment, 'each instance has its own');
  });

  test('@action records an async action until it settles, for settled()', async function (assert) {
    let finish: () => void = () => {};
    class Saver {
      @action
      async save() {
        await new Promise<void>((resolve) => (finish = resolve));
      }
    }

    const saving = new Saver().save();
    assert.equal(getAsyncActionsQueue().size, 1);

    finish();
    await saving;
    await Promise.resolve();
    assert.equal(getAsyncActionsQueue().size, 0);
  });

  test("@service is the owner's service of that name", async function (assert) {
    const locale = { currentLocale: 'tr' };
    class Greeting extends Component {
      @service locale: typeof locale;

      static template = hbs`<p>{{this.locale.currentLocale}}</p>`;
    }

    await renderComponent(Greeting, {
      element: document.getElementById('ember-testing') as HTMLElement,
      owner: { services: { locale } },
    });

    assert.dom('p').hasText('tr');
  });
});
