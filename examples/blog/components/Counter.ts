import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on, action } from '@glimmer/modifier';

export default class extends Component {
  @tracked count = 1;

  static template = `<button {{on "click" this.incrementCounter}}>Counter: {{this.count}}</button>`;

  @action
  incrementCounter() {
    this.count++;
  }
}
