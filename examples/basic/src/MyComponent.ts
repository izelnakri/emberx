// TODO: Only thing missing is actual registration on ProgramSymbolTable: @glimmer/syntax/dist/modules/es2017/lib/v2-a/normalize.js
import { templateFactory } from '@glimmer/opcode-compiler';
import Component, {
  tracked,
  getOwner,
  setComponentTemplate,
  templateOnlyComponent,
  on,
  action,
} from '@emberx/component';
// import { helper } from '@emberx/helper';
// import OtherComponent from './OtherComponent';
// import { Owner } from '../index';
import { precompile } from '@glimmer/compiler';

// const myHelper = helper(function ([name], { greeting }) {
//   return `Helper: ${greeting} ${name}`;
// });

// const isCJK = helper(function (_args, _hash, services) {
//   const localeService = services.locale as LocaleService;

//   return (
//     localeService.currentLocale === 'zh_CN' ||
//     localeService.currentLocale === 'ko_KO' ||
//     localeService.currentLocale === 'ja_JP'
//   );
// });

let lol = precompile(`<h1>I am rendered by a template only component: {{@name}}</h1>`, {
  strictMode: true,
});
console.log(lol.toString());
window.lol = lol;
// const TemplateOnlyComponent = setComponentTemplate(lol, templateOnlyComponent());

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
// TODO: template imports is the only thing that doesnt work. Need to register basic events on globalContext
let output = precompile(
  `
  <h1>Hello {{this.message}}</h1> <br/>
  <p>Current locale: {{this.currentLocale}}</p>
  `,
  //   `
  //   <h1>Hello {{this.message}}</h1> <br/>
  //   {{myHelper "foo" greeting="Hello"}}
  //   <p>Current locale: {{this.currentLocale}}</p>
  //   {{#if (isCJK)}}
  //     <p>Component is in a CJK locale</p>
  //   {{else}}
  //     <p>Component is not in a CJK locale</p>
  //   {{/if}}
  //   <button {{on "click" this.increment}}>Increment</button>
  //   <button {{on "click" this.changeLocale}}>Change Locale</button>
  // `,
  { strictMode: true, scope: {} }
);
console.log(precompile.toString());
window.output = output;

setComponentTemplate(templateFactory(JSON.parse(output)), MyComponent);
// createTemplateFactory(another);

// setComponentTemplate(createTemplateFactory(another), MyComponent);

window.com = MyComponent;
export default MyComponent;
