import Route from '../../../src/route'; // import Route from 'emberx/route';
import { hbs } from '@glimmerx/component';
import { service } from '@glimmerx/service';

import LinkTo from '../../../src/link-to'; // import Route from 'emberx/link-to';

export default class LoginRoute extends Route {
  @service intl;

  static model() {
    return {};
  }

  static template = hbs`
    <h1>Hello PublicRoute</h1>
  `;
}
