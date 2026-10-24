import Component, {
  didRender,
  hbs,
  service,
  renderComponent,
  unmountComponent,
  action,
  tracked,
} from '@emberx/component';
import { module, test } from 'qunitx';
import { click, setupRenderingTest } from '@emberx/test-helpers';

module('@emberx/component | Render tests', function (hooks) {
  setupRenderingTest(hooks);

  test('full state complex component with empty scope gets rendered correctly', async function (assert) {
    class FirstComponent extends Component {
      message = 'hello world';
      @tracked accessor count = 55;

      static template = hbs`
        <div id="first-component">
          <p id="message">Current message: {{this.message}}</p>
          <span>Count is {{this.count}}</span>
          <p id="received-arg">Received argument is {{@notice}}</p>
          <button id="increment-button">Increment</button>
        </div>
      `;
    }

    await renderComponent(FirstComponent, {
      element: document.getElementById('ember-testing'),
      args: { notice: 'should be inside' },
      owner: {},
    });

    assert.dom('#first-component #message').hasText('Current message: hello world');
    assert.dom('#first-component span').hasText('Count is 55');
    assert.dom('#first-component #received-arg').hasText('Received argument is should be inside');
    assert.dom('#first-component #increment-button').hasText('Increment');
  });

  test('complex full state complex components with embeded components inside, services, modifiers render correctly', async function (assert) {
    class LocaleService {
      @tracked accessor currentLocale: string;

      constructor(currentLocale: string) {
        this.currentLocale = currentLocale;
      }

      @action
      setLocale(locale) {
        this.currentLocale = locale;
      }
    }

    class AnotherComponent extends Component {
      @service locale;

      message = 'hello world';
      @tracked accessor count = 55;

      static template = hbs`
        <div id="another-component">
          <p id="message">Current message: {{this.message}}</p>
          <p id="locale-info">Component gets rendered. Current locale is {{this.locale.currentLocale}}</p>
          <span>Count is {{this.count}}</span>
          <p id="received-arg">Received argument is {{@notice}}</p>
          <button {{on "click" this.increment}} id="increment-button">Increment</button>
          <button {{on "click" this.changeMessage}} id="another-message-button">Change message</button>
          <button {{on "click" (fn this.locale.setLocale "tr")}} id="change-locale-button">Change locale</button>
        </div>
      `;

      @action
      increment(): void {
        this.count++;
      }

      @action
      changeMessage(): void {
        this.message = 'message changed';
      }
    }

    class MainComponent extends Component {
      @service locale;
      @tracked accessor mainMessage = 'hello world';

      static includes = {
        AnotherComponent,
      };
      static template = hbs`
        <p id="main-component-message">{{this.mainMessage}}</p>
        <p id="main-component-formatted-message">{{this.formattedMessage}}</p>
        <div id="another">
          <AnotherComponent @notice={{this.mainMessage}} />
        </div>
        <button {{on "click" this.changeMessage}} id="message-button">Change main message</button>
      `;

      get formattedMessage() {
        return this.mainMessage.toUpperCase();
      }

      @action
      changeMessage(): void {
        this.mainMessage = 'message changed';
      }
    }

    await renderComponent(MainComponent, {
      element: document.getElementById('ember-testing'),
      owner: { services: { locale: new LocaleService('en') } },
    });

    assert.dom('#first-component').doesNotExist();
    assert.dom('#main-component-message').hasText('hello world');
    assert.dom('#main-component-formatted-message').hasText('HELLO WORLD');
    assert.dom('#another #another-component #message').hasText('Current message: hello world');
    assert.dom('#locale-info').hasText('Component gets rendered. Current locale is en');
    assert.dom('#another #another-component span').hasText('Count is 55');
    assert.dom('#another #another-component #received-arg').hasText('Received argument is hello world');
    assert.dom('#another #another-component #increment-button').hasText('Increment');
    assert.dom('#another #another-component #another-message-button').hasText('Change message');
    assert.dom('#another #another-component #change-locale-button').hasText('Change locale');
    assert.dom('#message-button').hasText('Change main message');

    await click('#another-message-button');
    await click('#increment-button');

    assert.dom('#another #another-component span').hasText('Count is 56');
    assert.dom('#another #another-component #message').hasText('Current message: hello world');

    await click('#message-button');

    assert.dom('#locale-info').hasText('Component gets rendered. Current locale is en');
    assert.dom('#main-component-message').hasText('message changed');
    assert.dom('#main-component-formatted-message').hasText('MESSAGE CHANGED');
    assert.dom('#another #another-component #received-arg').hasText('Received argument is message changed');

    await click('#change-locale-button');

    assert.dom('#locale-info').hasText('Component gets rendered. Current locale is tr');
    assert.dom('#main-component-message').hasText('message changed');
    assert.dom('#main-component-formatted-message').hasText('MESSAGE CHANGED');
    assert.dom('#another #another-component #received-arg').hasText('Received argument is message changed');
  });

  test('a subclass renders its own template, after its parent rendered', async function (assert) {
    class Parent extends Component {
      static template = hbs`<b>parent</b>`;
    }
    class Child extends Parent {
      static template = hbs`<i>child</i>`;
    }
    const element = document.getElementById('ember-testing') as HTMLElement;

    await renderComponent(Parent, { element, owner: {} });
    assert.dom('b').hasText('parent');

    await renderComponent(Child, { element, owner: {} });
    assert.dom('i').hasText('child');
    assert.dom('b').doesNotExist();
  });

  test("a component's includes replace a built-in of the same name, and are left as they were", async function (assert) {
    const includes = { eq: () => 'my eq' };
    class Mine extends Component {
      static includes = includes;
      static template = hbs`<p>{{eq 1 2}}</p>`;
    }

    await renderComponent(Mine, { element: document.getElementById('ember-testing') as HTMLElement, owner: {} });

    assert.dom('p').hasText('my eq');
    assert.deepEqual(Object.keys(includes), ['eq'], 'no built-in was written into it');
  });

  module('the template syntax Ember compiles to built-in helpers', function () {
    test('{{#each}} re-renders a tracked array set again, and {{#each-in}} iterates an object by key', async function (assert) {
      class Lists extends Component {
        @tracked accessor names = ['Ada', 'Grace'];
        prices = { tea: 2, cake: 4 };

        static template = hbs`
          <ul>{{#each this.names as |name|}}<li data-test-name>{{name}}</li>{{/each}}</ul>
          <dl>{{#each-in this.prices as |item price|}}<dt>{{item}}</dt><dd>{{price}}</dd>{{/each-in}}</dl>
          <button {{on "click" this.add}} data-test-add>Add</button>
        `;

        @action add() {
          this.names = [...this.names, 'Barbara'];
        }
      }

      await renderComponent(Lists, { element: document.getElementById('ember-testing'), owner: {} });
      assert.dom('[data-test-name]').exists({ count: 2 });
      assert.deepEqual(
        [...document.querySelectorAll('dt')].map((dt) => dt.textContent),
        ['tea', 'cake'],
      );
      assert.deepEqual(
        [...document.querySelectorAll('dd')].map((dd) => dd.textContent),
        ['2', '4'],
      );

      await click('[data-test-add]');
      assert.dom('[data-test-name]').exists({ count: 3 });
      assert.dom('li:last-child').hasText('Barbara');
    });

    test('class interpolation, and {{#in-element}} with and without insertBefore', async function (assert) {
      const target = document.createElement('div');
      target.innerHTML = '<p>kept</p>';
      document.getElementById('ember-testing')!.after(target);

      class Placed extends Component {
        @tracked accessor active = true;
        target = target;

        static template = hbs`
          <span class="badge {{if this.active "on" "off"}}" data-test-badge>badge</span>
          {{#in-element this.target}}<b data-test-replaced>replaced</b>{{/in-element}}
        `;
      }
      class Appended extends Component {
        target = target;

        static template = hbs`{{#in-element this.target insertBefore=null}}<i data-test-appended>appended</i>{{/in-element}}`;
      }

      await renderComponent(Placed, { element: document.getElementById('ember-testing'), owner: {} });
      assert.dom('[data-test-badge]').hasClass('badge').hasClass('on');
      assert.equal(target.innerHTML.replace(/<!---->/g, ''), '<b data-test-replaced="">replaced</b>');

      target.innerHTML = '<p>kept</p>';
      await renderComponent(Appended, { element: document.getElementById('ember-testing'), owner: {} });
      assert.ok(target.querySelector('p') && target.querySelector('[data-test-appended]'), 'insertBefore=null appends');
      target.remove();
    });
  });

  module('mounted in an app of another framework', function () {
    class Greeting extends Component {
      static template = hbs`<p data-test-greeting>Hello {{@name}}</p>`;
    }

    test('the render renderComponent resolves to removes itself, and only itself', async function (assert) {
      const element = document.getElementById('ember-testing') as HTMLElement;
      const first = await renderComponent(Greeting, { element, args: { name: 'first' }, owner: {} });
      const second = await renderComponent(Greeting, { element, args: { name: 'second' }, owner: {} });
      await didRender();
      assert.dom('[data-test-greeting]').hasText('Hello second');

      first.destroy();
      await didRender();
      assert
        .dom('[data-test-greeting]')
        .hasText('Hello second', "the first render's handle leaves the render that replaced it");

      second.destroy();
      await didRender();
      assert.dom('[data-test-greeting]').doesNotExist();
    });

    test('unmountComponent removes what an element holds, and a render after it starts afresh', async function (assert) {
      const element = document.getElementById('ember-testing') as HTMLElement;
      const rendering = renderComponent(Greeting, { element, args: { name: 'gone' }, owner: {} });
      unmountComponent(element);
      await rendering;
      await didRender();
      assert.dom('[data-test-greeting]').doesNotExist();

      await renderComponent(Greeting, { element, args: { name: 'again' }, owner: {} });
      unmountComponent(element);
      await renderComponent(Greeting, { element, args: { name: 'back' }, owner: {} });
      await didRender();
      assert.dom('[data-test-greeting]').exists({ count: 1 }).hasText('Hello back');
    });
  });
});
