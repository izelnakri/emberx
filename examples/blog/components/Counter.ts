import Component, { tracked, action, hbs } from '@emberx/component';

export default class extends Component {
  @tracked accessor count = 1;

  static template = hbs`<button {{on "click" this.incrementCounter}}>Counter: {{this.count}}</button>`;

  @action
  incrementCounter() {
    this.count++;
  }
}
