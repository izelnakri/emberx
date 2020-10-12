import Component, { hbs, tracked } from '@glimmerx/component';
import { on, action } from '@glimmerx/modifier';

export default class extends Component {
  @tracked count = 1;

  static template = hbs`<button {{on "click" this.incrementCounter}}>Counter: {{this.count}}</button>`;

  @action
  incrementCounter() {
    this.count++;
  }
}
