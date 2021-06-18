import Component, { tracked, action } from '@emberx/component';

export default class extends Component {
  @tracked count = 1;

  static template = `<button {{on "click" this.incrementCounter}}>Counter: {{this.count}}</button>`;

  @action
  incrementCounter() {
    this.count++;
  }
}
