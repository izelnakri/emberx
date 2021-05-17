import Route from '@emberx/route'; // import Route from 'emberx/route';

import LinkTo from '@emberx/link-to'; // import Route from 'emberx/link-to';

export default class LoginRoute extends Route {
  // @service intl;

  static model() {
    return {};
  }

  static template = `
    <h1>Hello PublicRoute</h1>
  `;
}
