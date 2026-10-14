import { Route, hbs } from '@emberx/router';

// NOTE: declared as `posts_error`, shown when the posts hooks fail; the error is its model
export default class ParentErrorRoute extends Route {
  static template = hbs`<h1 data-test-error>Posts could not load: {{this.model.message}}</h1>`;
}
