import { module, test } from 'qunitx';
import Router from '@emberx/router';
import oldRouterMap from './helpers/old-router-map';
import targetFlatRegistry from './helpers/outputs/target-flat-registry';
import targetRouterJSArray from './helpers/outputs/target-router-js-array';
import setupTest from './helpers/index';

function removeRoute(routeRegistry, targetKey) {
  return Object.keys(routeRegistry).reduce((result, routeKey) => {
    if (routeKey !== targetKey) {
      result[routeKey] = routeRegistry[routeKey];
    }

    return result;
  }, {});
}

module('@emberx/router | Public API', function (hooks) {
  setupTest(hooks);

  test('Router.map creates route registry without Router.start()', async function (assert) {
    Router.reset();

    assert.true(Router.LOG_ROUTES);
    assert.true(Router.LOG_MODELS);
    assert.deepEqual(Router.owner.routes, {});
    assert.deepEqual(Router.owner.services, {});

    assert.ok(Router.map);
    assert.ok(Router.start);

    let routeRegistry = Router.map(oldRouterMap);

    assert.deepEqual(Router.owner.routes, removeRoute(targetFlatRegistry, 'not-found'));
    assert.deepEqual(routeRegistry, removeRoute(targetFlatRegistry, 'not-found'));
  });

  test('Router.convertToRouterJSRouteArray with routeRegistry gets converted to right array of nested routes', async (assert) => {
    Router.reset();

    assert.propEqual(Router.convertToRouterJSRouteArray(targetFlatRegistry), targetRouterJSArray);
  });

  test('Router.start with only map create route registry correctly', async function (assert) {
    let router = Router.start([], oldRouterMap);
    let routerService = router.owner.lookup('service:router');

    assert.propEqual(router.owner.routes, targetFlatRegistry);
    assert.ok(router);
    assert.deepEqual(Object.keys(routerService).sort(), [
      'Resolver',
      '_changedQueryParams',
      '_lastQueryParams',
      'activeTransition',
      'currentRouteInfos',
      'currentSequence',
      'locationBar',
      'log',
      'oldState',
      'recognizer',
      'state',
      'testing',
    ]);

    // TODO: check default route content
  });

  test('Router.start with array of routeDefinitions create route registry correctly', async function (assert) {
    let router = Router.start([
      { path: '/admin', name: 'admin' },
      { path: '/admin/content', name: 'admin.content' },
      { path: '/admin/lol/abc', name: 'admin.lol.abc' },
      { path: '/admin/posts/:slug', name: 'admin.posts.post' },
      { path: '/admin/posts/new', name: 'admin.posts.new' },
      { path: '/admin/settings', name: 'admin.settings' },
      { path: '/login', name: 'login' },
      { path: '/logout', name: 'logout' },
      { path: '/', name: 'public' },
      { path: '/public/:slug', name: 'public.blog-post' },
    ]);

    let oldOptions = Object.assign({}, targetFlatRegistry['admin.posts'].options);

    delete targetFlatRegistry['admin.posts'].options.resetNamespace;

    assert.propEqual(Router.owner.routes, targetFlatRegistry);
    assert.ok(router);

    targetFlatRegistry['admin.posts'].options = oldOptions; // NOTE: resets targetRegistry
  });

  test('Router.start with array of routeDefinitions and map create route registry correctly', async function (assert) {
    let router = Router.start(
      [
        { path: '/admin', name: 'admin' },
        { path: '/admin/content', name: 'admin.content' },
        { path: '/admin/lol/abc', name: 'admin.lol.abc' },
        { path: '/admin/posts/:slug', name: 'admin.posts.post' },
        { path: '/admin/settings', name: 'admin.settings' },
        { path: '/logout', name: 'logout' },
        { path: '/', name: 'public' },
      ],
      oldRouterMap
    );

    assert.propEqual(Router.owner.routes, targetFlatRegistry);
    assert.ok(router);
  });
});
