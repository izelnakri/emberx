import Component from '@emberx/component';
import { tracked } from '@glimmer/tracking';
import {
  precompileTemplate,
  setComponentTemplate,
  getOwner,
  templateOnlyComponent,
} from '@emberx/component';
import { helper } from '@emberx/helper';
import OtherComponent from './OtherComponent';
import { on, action } from '@glimmer/modifier';
import { Owner } from '../..';

const myHelper = helper(function ([name], { greeting }) {
  return `Helper: ${greeting} ${name}`;
});

const isCJK = helper(function (_args, _hash, services) {
  const localeService = services.locale as LocaleService;

  return (
    localeService.currentLocale === 'zh_CN' ||
    localeService.currentLocale === 'ko_KO' ||
    localeService.currentLocale === 'ja_JP'
  );
});

const TemplateOnlyComponent = setComponentTemplate(
  precompileTemplate(`<h1>I am rendered by a template only component: {{@name}}</h1>`, {
    strictMode: true,
  }),
  templateOnlyComponent()
);

class MyComponent extends Component {
  message = 'hello world';
  @tracked count = 55;

  get currentLocale(): string {
    return getOwner<Owner>(this).services.locale.currentLocale;
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

setComponentTemplate(
  precompileTemplate(
    `
      <h1>Hello {{this.message}}</h1> <br/>
      {{myHelper "foo" greeting="Hello"}}
      <p>Current locale: {{this.currentLocale}}</p>
      {{#if (isCJK)}}
        <p>Component is in a CJK locale</p>
      {{else}}
        <p>Component is not in a CJK locale</p>
      {{/if}}
      <OtherComponent @count={{this.count}} /> <br/>
      <button {{on "click" this.increment}}>Increment</button>
      <button {{on "click" this.changeLocale}}>Change Locale</button>
      <TemplateOnlyComponent @name="For Glimmer"/>

    `,
    { strictMode: true, scope: { OtherComponent, TemplateOnlyComponent, myHelper, isCJK, on } }
  ),
  MyComponent
);

export default MyComponent;
