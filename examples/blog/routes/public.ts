import { Route, LinkTo } from '@emberx/router';

export default class LoginRoute extends Route {
  // @service intl;

  static model() {
    return {};
  }

  static template = `
    <h1>Hello PublicRoute</h1>
  `;
}
