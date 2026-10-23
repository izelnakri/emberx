import Component, {
  cached,
  didRender,
  hbs,
  registerDestructor,
  renderComponent,
  resetRendering,
  tracked,
} from '@emberx/component';
import { module, test } from 'qunitx';
import { setupRenderingTest } from '@emberx/test-helpers';

module('@emberx/component | @cached and registerDestructor', function (hooks) {
  setupRenderingTest(hooks);

  test('@cached runs its getter again only once the tracked state it read changed', async function (assert) {
    let cart!: Cart;
    class Cart extends Component {
      @tracked accessor prices = [3, 4];
      @tracked accessor note = '';
      runs = 0;

      static template = hbs`<p>{{this.total}} {{this.total}}</p><span>{{this.note}}</span>`;

      constructor(owner: object, args: Record<string, unknown>) {
        super(owner, args);
        cart = this;
      }

      @cached
      get total() {
        this.runs++;
        return this.prices.reduce((sum, price) => sum + price, 0);
      }
    }

    await renderComponent(Cart, { element: document.getElementById('ember-testing') as HTMLElement, owner: {} });
    assert.dom('p').hasText('7 7');
    assert.equal(cart.runs, 1, 'once for both reads');

    cart.note = 'gift';
    await didRender();
    assert.equal(cart.runs, 1, 'state it did not read changed');

    cart.prices = [...cart.prices, 5];
    await didRender();
    assert.dom('p').hasText('12 12');
    assert.equal(cart.runs, 2);
  });

  test('@cached decorates a getter only', function (assert) {
    assert.throws(
      () => cached(() => 1, { kind: 'method', name: 'total' } as unknown as ClassGetterDecoratorContext),
      /@cached decorates a getter, not total/,
    );
  });

  test('registerDestructor runs when the component it is registered on goes away', async function (assert) {
    const steps: string[] = [];
    class Clock extends Component {
      static template = hbs`<time>now</time>`;

      constructor(owner: object, args: Record<string, unknown>) {
        super(owner, args);
        const timer = setInterval(() => {}, 1000);
        registerDestructor(this, () => {
          clearInterval(timer);
          steps.push('cleared');
        });
      }
    }

    await renderComponent(Clock, { element: document.getElementById('ember-testing') as HTMLElement, owner: {} });
    assert.deepEqual(steps, []);

    resetRendering();
    await didRender();
    assert.deepEqual(steps, ['cleared']);
  });
});
