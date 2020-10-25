import Route from '../route'; // import Route from 'emberx/route';
import { hbs } from '@glimmerx/component';
import { service } from '@glimmerx/service';

import LinkTo from '../components/LinkTo'; // import LinkTo from 'emberx/link-to';

export default class LoginRoute extends Route {
  @service intl;

  static model() {
    return {};
  }

  static template = hbs`
    <h1>Hello PublicRoute</h1>
  `;
}
