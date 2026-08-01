import { Route } from '@emberx/router';

export default class LoginRoute extends Route {
  // @service intl;

  // TODO: check whether `this.intl` is accessible from a static model hook.
  static model() {
    return {};
  }

  static template = `
    <h1>Hello LoginRoute</h1>
  `;
}
