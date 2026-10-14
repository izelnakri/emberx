import { Route, hbs } from '@emberx/router';

// NOTE: declared as `posts.loading`, shown while a route under posts loads
export default class ChildLoadingRoute extends Route {
  static template = hbs`<h1 data-test-loading>Loading the post...</h1>`;
}
