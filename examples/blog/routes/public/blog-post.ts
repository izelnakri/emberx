import Route from '../../../../src/route'; // import Route from 'emberx/route';
import { hbs } from '@glimmerx/component';
import { service } from '@glimmerx/service';

import LinkTo from '../../../../src/LinkTo'; // import Route from 'emberx/route';

export default class PublicBlogPostRoute extends Route {
  @service intl;

  static model() {}
}
