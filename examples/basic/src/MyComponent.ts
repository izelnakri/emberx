import Component, { getOwner, hbs } from '@emberx/component';
import { tracked } from '@glimmer/tracking';
import { on, action } from '@glimmer/modifier';
import { helper } from '@emberx/helper';
import OtherComponent from './OtherComponent';

const myHelper = helper(function ([name], { greeting }) {
  return `Helper: ${greeting} ${name}`;
});

const localeIsEnUS = helper(function (_args, _hash, services) {
  const localeService = services.locale;

  return localeService.currentLocale === 'en_US';
});

class MyComponent extends Component {
  static includes = {
    OtherComponent,
    myHelper,
    localeIsEnUS,
    on,
  };
  static template = hbs`
    {{#let "hello" "world" as |hello world|}}<p>{{hello}} {{world}}</p>{{/let}}
    {{myHelper "foo" greeting="Hello"}}
    <p>Current locale: {{this.currentLocale}}</p>
    {{#if (localeIsEnUS)}}
      <p>Component is in a US locale</p>
    {{else}}
      <p>Component is not in a US locale</p>
    {{/if}}
      <OtherComponent @count={{this.count}} />
    <button {{on "click" this.increment}}>Increment</button>
    <button {{on "click" this.changeLocale}}>Change Locale</button>
  `;

  message = 'hello world';
  @tracked count = 55;

  get currentLocale(): string {
    return getOwner(this).services.locale.currentLocale;
  }

  @action
  increment(): void {
    this.count++;
  }

  @action
  changeLocale(): void {
    let LocaleService = getOwner<Owner>(this).services.locale;

    LocaleService.currentLocale === 'zh_CN'
      ? LocaleService.setLocale('en_US')
      : LocaleService.setLocale('zh_CN');
  }
}

export default MyComponent;
