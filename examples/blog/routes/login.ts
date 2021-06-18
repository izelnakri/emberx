import { Route, LinkTo } from '@emberx/router';

export default class LoginRoute extends Route {
  // @service intl;

  static model() {
    debugger; // TODO: CHECK IF this.intl access is permitted!
    return {};
  }

  static template = `
    <h1>Hello LoginRoute</h1>
  `;
}
