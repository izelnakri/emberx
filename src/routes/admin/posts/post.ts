import Route from '../../../route'; // import Route from 'emberx/route';
import { hbs } from '@glimmerx/component';
import { service } from '@glimmerx/service';

import LinkTo from '../../../components/LinkTo'; // import LinkTo from 'emberx/link-to';

export default class AdminPostsPostRoute extends Route {
  @service intl;

  static model(params: { slug: string }): { slug: string } {
    return {
      slug: params.slug,
    };
  }

  static template = hbs`
    <p>Post slug is: {{this.model.slug}}</p>
    <LinkTo @route="index">Go back</LinkTo>
  `;
}
