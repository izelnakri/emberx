import Route from '../../../../../src/route'; // import Route from 'emberx/route';
import { hbs } from '@glimmerx/component';
import { service } from '@glimmerx/service';

import LinkTo from '../../../../../src/link-to'; // import LinkTo from 'emberx/link-to';

export default class AdminPostsPostRoute extends Route {
  @service intl;

  static model(params: { slug: string }): { slug: string } {
    return {
      slug: params.slug,
    };
  }

  static template = hbs`
    <p>Post slug is: {{this.model.slug}}</p>
    <LinkTo @route="public.index">Go back</LinkTo>
  `;
}
