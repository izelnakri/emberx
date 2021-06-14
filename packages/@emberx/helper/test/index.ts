import Component, { hbs, service, renderComponent } from '@emberx/component';
import { helper } from '@emberx/helper';
import { tracked } from '@glimmer/tracking';
import { action } from '@glimmer/modifier';
import { module, test } from 'qunitx';
import { click } from '@emberx/test-helpers';
import { setupRenderingTest } from './helpers/index';

module('@emberx/helper | Public API', function (hooks) {
  setupRenderingTest(hooks);

  test('Basic helper with no service works, incl. on mutation', async function (assert) {
    const capitalize = helper(function ([text]) {
      return text.toUpperCase();
    });

    class SomeComponent extends Component {
      @tracked message = 'hello world';

      static includes = { capitalize };

      static template = hbs`
        <h1 id="target-title">{{this.message}} - {{capitalize this.message}}</h1>
        <p id="target-text">{{this.message}}</p>
        <button type="button" {{on "click" this.changeMessage}} id="change-msg-button">Change message</button>
      `;

      @action
      changeMessage() {
        this.message = 'something else';
      }
    }

    await renderComponent(SomeComponent, {
      element: document.getElementById('ember-testing'),
      args: { notice: 'should be inside' },
      owner: {},
    });

    assert.dom('#target-title').hasText('hello world - HELLO WORLD');
    assert.dom('#target-text').hasText('hello world');
    assert.dom('#change-msg-button').hasText('Change message');

    await click('#change-msg-button');

    assert.dom('#target-title').hasText('something else - SOMETHING ELSE');
    assert.dom('#target-text').hasText('something else');
    assert.dom('#change-msg-button').hasText('Change message');
  });

  test('Complex embedded helper with service works, incl. on mutation', async function (assert) {
    const myHelper = helper(function ([text], options, services) {
      let locale = services.locale.currentLocale;

      return `Param is ${text}, options are ${JSON.stringify(options)}, locale is ${locale}`;
    });

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

    class SomeComponent extends Component {
      @service locale;
      @tracked message = 'some message';

      static includes = { myHelper };

      static template = hbs`
        <h1 id="target-title">{{this.message}} - {{myHelper this.message title="Izel" message=this.message}}</h1>
        <p id="target-text">{{this.message}}</p>
        <p id="helper-text">{{myHelper this.message title="Isaac" cool=true}}</p>
        <button type="button" {{on "click" this.changeMessage}} id="change-msg-button">Change message</button>
        <button type="button" {{on "click" this.changeLocale}} id="change-locale-button">Change locale</button>
      `;

      @action
      changeMessage() {
        this.message = 'something else';
      }

      @action
      changeLocale() {
        this.locale.setLocale('tr');
      }
    }

    class MainComponent extends Component {
      static includes = { SomeComponent };

      static template = hbs`
        <div id="main-component">
          <SomeComponent />
        </div>
      `;
    }

    await renderComponent(MainComponent, {
      element: document.getElementById('ember-testing'),
      args: { notice: 'should be inside' },
      owner: { services: { locale: new LocaleService('en') } },
    });

    assert
      .dom('#target-title')
      .hasText(
        'some message - Param is some message, options are {"title":"Izel","message":"some message"}, locale is en'
      );
    assert.dom('#target-text').hasText('some message');
    assert.dom('#change-msg-button').hasText('Change message');

    await click('#change-msg-button');

    assert
      .dom('#target-title')
      .hasText(
        'something else - Param is something else, options are {"title":"Izel","message":"something else"}, locale is en'
      );
    assert.dom('#target-text').hasText('something else');
    assert.dom('#change-msg-button').hasText('Change message');

    await click('#change-locale-button');

    assert
      .dom('#target-title')
      .hasText(
        'something else - Param is something else, options are {"title":"Izel","message":"something else"}, locale is tr'
      );
    assert.dom('#target-text').hasText('something else');
    assert.dom('#change-msg-button').hasText('Change message');
  });
});
