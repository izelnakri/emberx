import { hbs } from '@emberx/component';
import Route, { type RouteHooks } from './route.ts';

/**
 * What a URL no route matches shows, unless the app declares a catch-all of
 * its own: `{ path: '/*path', route: MyNotFoundRoute }`, or, with `resolve`,
 * a `not-found` route it finds. Extend it to keep its title and change the
 * page, or replace it whole.
 */
export default class NotFoundRoute extends Route {
  static {
    // Set rather than declared, so a route extending it needs no `override`: see RouteHooks.
    Object.assign(this, {
      title: 'Page not found',
      template: hbs`
        <main data-test-not-found>
          <h1>Page not found</h1>
          <p>There is no page at {{this.router.currentURL}}.</p>
        </main>
      `,
    } satisfies RouteHooks);
  }
}
