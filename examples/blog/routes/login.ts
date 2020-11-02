import Route from '../../../src/route'; // import Route from 'emberx/route';
import { hbs } from '@glimmerx/component';
import { service } from '@glimmerx/service';

import LinkTo from '../../../src/LinkTo'; // import Route from 'emberx/link-to';

export default class LoginRoute extends Route {
  @service intl;

  static model() {
    return {};
  }

  static template = hbs`
    <h1>Hello LoginRoute</h1>
  `;
}
