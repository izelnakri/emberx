import { Route, LinkTo } from '@emberx/router';

export default class AdminPostsPostRoute extends Route {
  // @service intl;

  static includes = {
    LinkTo,
  };

  static model(params: { slug: string }): { slug: string } {
    return {
      slug: params.slug,
    };
  }

  static template = `
    <p>Post slug is: {{this.model.slug}}</p>
    <LinkTo @route="public.index">Go back</LinkTo>
  `;
}
