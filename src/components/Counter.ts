import Component, { hbs, tracked } from '@glimmerx/component';
import { on, action } from '@glimmerx/modifier';

export default class extends Component {
  static template = hbs`
        <button {{on "click" this.incrementCounter}}>Counter: {{this.count}}</button>
      `;
  @tracked count = 1;

  @action
  incrementCounter() {
    this.count++;
  }
}
