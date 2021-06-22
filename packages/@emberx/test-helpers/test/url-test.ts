import { module, test } from 'qunitx';
import { visit, currentURL, currentRouteName } from '@emberx/test-helpers';
import Router, { Route, hbs } from '@emberx/router';
import { setupRenderingTest } from './helpers/index';

module('@emberx/test-helpers | url helpers', function (hooks) {
  class IndexRoute extends Route {
    static template = hbs`
      <h1 data-test-route-title="index">This is from Index Route</h1>
    `;
  }

  class BasicRoute extends Route {
    static template = hbs`
      <h1 data-test-route-title="basic">This is from Basic Route</h1>
    `;
  }

  class AdvancedRoute extends Route {
    static template = hbs`
      <h1 data-test-route-title="advanced">This is from Advanced Route</h1>
    `;
  }

  setupRenderingTest(hooks, () => {
    return Router.start([
      {
        path: '/',
        name: 'index',
        route: IndexRoute,
      },
      {
        path: '/basic',
        name: 'basic',
        route: BasicRoute,
      },
      {
        path: '/profiles/:slug',
        name: 'profiles.profile',
        route: AdvancedRoute,
      },
    ]);
  });

  test('visit, currentRouteName, currentURL works consequently', async function (assert) {
    assert.equal(currentURL(), undefined);
    assert.equal(currentRouteName(), undefined);

    await visit('/');

    assert.dom('[data-test-route-title]').hasText('This is from Index Route');
    assert.equal(currentURL(), '/');
    assert.equal(currentRouteName(), 'index');

    await visit('/basic');

    assert.dom('[data-test-route-title]').hasText('This is from Basic Route');
    assert.equal(currentURL(), '/basic');
    assert.equal(currentRouteName(), 'basic');

    await visit('/profiles/izelnakri');

    assert.dom('[data-test-route-title]').hasText('This is from Advanced Route');
    assert.equal(currentURL(), '/profiles/izelnakri');
    assert.equal(currentRouteName(), 'profiles.profile');
  });

  test('not found route on visit, currentRouteName, currentURL works correctly', async function (assert) {
    assert.equal(currentURL(), undefined);
    assert.equal(currentRouteName(), undefined);

    await visit('/someunknownthing');

    assert.dom('[data-test-route-title]').hasText('Route: not-found. This route is missing a template!');
    assert.equal(currentURL(), '/someunknownthing');
    assert.equal(currentRouteName(), 'not-found');
  });

  test('visit, currentRouteName, currentURL works consequently when initially landed on not-found route', async function (assert) {
    await visit('/profiles/izelnakri');

    assert.dom('[data-test-route-title]').hasText('This is from Advanced Route');
    assert.equal(currentURL(), '/profiles/izelnakri');
    assert.equal(currentRouteName(), 'profiles.profile');

    await visit('/asdaidasdasd'); // TODO: then should wait for parent children resolution

    assert.dom('[data-test-route-title]').hasText('Route: not-found. This route is missing a template!');
    assert.equal(currentURL(), '/asdaidasdasd');
    assert.equal(currentRouteName(), 'not-found');

    await visit('/');

    assert.dom('[data-test-route-title]').hasText('This is from Index Route');
    assert.equal(currentURL(), '/');
    assert.equal(currentRouteName(), 'index');
  });
});
