import { Route, hbs } from '@emberx/router';

export default class BasicRoute extends Route {
  static model() {
    return { firstName: 'Izel', lastName: 'Nakri' };
  }
  static template = hbs`
    <h1>This is basic route</h1>

    <p class="text-center">Testing it: {{this.model.firstName}} {{this.model.lastName}}<p>
  `;
}
