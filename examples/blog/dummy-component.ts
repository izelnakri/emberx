import Component, { hbs, tracked, on, action } from '@emberx/component';
import { precompileTemplate, setComponentTemplate, templateOnlyComponent } from '@glimmer/core';

class MyComponent extends Component {
  message = 'hello world';
  @tracked count = 55;

  @action
  increment(): void {
    this.count++;
  }
}

setComponentTemplate(
  precompileTemplate(
    `
      <h1>Hello {{this.message}}</h1> <br/>
      <p>Count is {{this.count}}</p>
      <p>Current locale: {{this.currentLocale}}</p>
      <p>Component is in a CJK locale</p>
      <button {{on "click" this.increment}}>Increment</button>
    `,
    {
      strictMode: true,
      scope: () => {
        return { on };
      },
    }
  ),
  MyComponent
);

export default MyComponent;
