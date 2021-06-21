import { Route, hbs, LinkTo } from '@emberx/router';

export default class PublicBlogPostRoute extends Route {
  // @service intl;

  static model() {}

  static includes = { LinkTo };
  static template = hbs`
    <LinkTo @route="preview.user" @model={{11}}>Go to user 11</LinkTo>
  `;
}
