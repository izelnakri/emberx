import Component, { hbs, service, renderComponent, action, tracked } from '@emberx/component';
import { module, test } from 'qunitx';
import { click } from '@emberx/test-helpers';
import { setupRenderingTest } from './helpers/index';

module('@emberx/component | Public API', function (hooks) {
  setupRenderingTest(hooks);

  module('Component', function (hooks) {
    test('holds the correct default static properties', async function (assert) {
      assert.deepEqual(Object.keys(Component), ['compiled', 'includes', 'template']);
      assert.equal(Component.compiled, false);
      assert.ok(Component.includes);
      assert.ok(typeof Component.includes === 'object');
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

    test('full state complex component with empty scope gets rendered correctly', async function (assert) {
      class FirstComponent extends Component {
        message = 'hello world';
        @tracked count = 55;

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
        @tracked currentLocale: string;

        constructor(currentLocale: string) {
          this.currentLocale = currentLocale;
        }

        get currentLocale(): string {
          return this.currentLocale;
        }

        @action
        setLocale(locale) {
          this.currentLocale = locale;
        }
      }

      class AnotherComponent extends Component {
        @service locale;

        message = 'hello world';
        @tracked count = 55;

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
        @tracked mainMessage = 'hello world';

        get formattedMessage() {
          return this.mainMessage.toUpperCase();
        }

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
      await new Promise((resolve) => setTimeout(() => resolve(), 100)); // TODO: remove this with test waiters

      assert.dom('#another #another-component span').hasText('Count is 56');
      assert.dom('#another #another-component #message').hasText('Current message: hello world');

      await click('#message-button');
      await new Promise((resolve) => setTimeout(() => resolve(), 100)); // TODO: remove this with test waiters

      assert.dom('#locale-info').hasText('Component gets rendered. Current locale is en');
      assert.dom('#main-component-message').hasText('message changed');
      assert.dom('#main-component-formatted-message').hasText('MESSAGE CHANGED');
      assert.dom('#another #another-component #received-arg').hasText('Received argument is message changed');

      await click('#change-locale-button');
      await new Promise((resolve) => setTimeout(() => resolve(), 100)); // TODO: remove this with test waiters

      assert.dom('#locale-info').hasText('Component gets rendered. Current locale is tr');
      assert.dom('#main-component-message').hasText('message changed');
      assert.dom('#main-component-formatted-message').hasText('MESSAGE CHANGED');
      assert.dom('#another #another-component #received-arg').hasText('Received argument is message changed');
    });
  });
});
