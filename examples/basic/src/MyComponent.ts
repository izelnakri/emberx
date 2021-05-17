import Component, {
  tracked,
  setComponentTemplate,
  getOwner,
  templateOnlyComponent,
  on,
  action,
} from '@emberx/component';
import { helper } from '@emberx/helper';
import OtherComponent from './OtherComponent';
// import { Owner } from '../index';
import { precompileTemplate } from '@glimmer/core';

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

let lol = precompileTemplate(`<h1>I am rendered by a template only component: {{@name}}</h1>`, {
  strictMode: true,
});
console.log(lol.toString());
window.lol = lol;
const TemplateOnlyComponent = setComponentTemplate(lol, templateOnlyComponent());

class MyComponent extends Component {
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
let another = precompileTemplate(
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
);

console.log(another.toString());
window.another = another;
setComponentTemplate(another, MyComponent);

window.com = MyComponent;
export default MyComponent;
