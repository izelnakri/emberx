import { Route, hbs } from '@emberx/router';

// NOTE: declared as `posts.error`, shown when the hooks of a route under posts fail; the error is its model
export default class ChildErrorRoute extends Route {
  static template = hbs`<h1 data-test-error>The post could not load: {{this.model.message}}</h1>`;
}
