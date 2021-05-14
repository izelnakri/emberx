import Route from '../../../src/route'; // import Route from 'emberx/route';

import LinkTo from '../../../src/link-to'; // import Route from 'emberx/link-to';

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
