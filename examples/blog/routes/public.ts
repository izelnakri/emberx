import Route from '../../../src/route'; // import Route from 'emberx/route';

import LinkTo from '../../../src/link-to'; // import Route from 'emberx/link-to';

export default class LoginRoute extends Route {
  // @service intl;

  static model() {
    return {};
  }

  static template = `
    <h1>Hello PublicRoute</h1>
  `;
}
