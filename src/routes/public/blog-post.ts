import Route from '../../route'; // import Route from 'emberx/route';
import { hbs } from '@glimmerx/component';
import { service } from '@glimmerx/service';

import LinkTo from '../../components/LinkTo'; // import LinkTo from 'emberx/link-to';

export default class PublicBlogPostRoute extends Route {
  @service intl;

  static model() {}

  static template = hbs`
  `;
}
