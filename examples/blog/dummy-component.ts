import Component, { hbs } from '@emberx/component';
import { tracked } from '@glimmer/tracking';
import { precompileTemplate, setComponentTemplate, templateOnlyComponent } from '@glimmer/core';
import { on, action } from '@glimmer/modifier';

class MyComponent extends Component {
  message = 'hello world';
  @tracked count = 55;

  @action
  increment(): void {
    debugger;
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
