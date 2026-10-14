import { Route, hbs } from '@emberx/router';

// NOTE: declared as `posts_loading`, shown while the posts model loads
export default class ParentLoadingRoute extends Route {
  static template = hbs`<h1 data-test-loading>Loading posts...</h1>`;
}
