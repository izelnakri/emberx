// TODO: write test utility to query actual router_js registry of the Router and assert against objects
import { module, test } from 'qunitx';
import Router from '@emberx/router';
import oldRouterMap from './helpers/old-router-map';
import targetFlatRegistry from './helpers/outputs/target-flat-registry';
import targetRouterJSArray from './helpers/outputs/target-router-js-array';

module('@emberx/router Public API', () => {
  test('Router.map creates route registry without Router.start()', async (assert) => {
    Router.ROUTE_REGISTRY = {};

    assert.true(Router.LOG_ROUTES);
    assert.true(Router.LOG_MODELS);
    assert.deepEqual(Router.ROUTE_REGISTRY, {});
    assert.deepEqual(Router.SERVICES, {});

    assert.ok(Router.map);
    assert.ok(Router.start);

    let routeRegistry = Router.map(oldRouterMap);

    assert.deepEqual(Router.ROUTE_REGISTRY, targetFlatRegistry);
    assert.deepEqual(routeRegistry, targetFlatRegistry);
  });

  test('Router.start with only map create route registry correctly', async (assert) => {
    let router = Router.start([], oldRouterMap);

    assert.deepEqual(Router.ROUTE_REGISTRY, targetFlatRegistry);
    assert.ok(router);
    assert.deepEqual(Object.keys(router), [
      '_lastQueryParams',
      'state',
      'oldState',
      'activeTransition',
      'currentRouteInfos',
      '_changedQueryParams',
      'currentSequence',
      'log',
      'recognizer',
      'locationBar',
      'path',
    ]);
  });

  test('Router.start with array of routeDefinitions create route registry correctly', async (assert) => {
    let router = Router.start([
      { path: '/admin' },
      { path: '/admin/content' },
      { path: '/admin/lol/abc' },
      { path: '/admin/posts/:slug', routeName: 'admin.posts.post' },
      { path: '/admin/posts/new' },
      { path: '/admin/settings' },
      { path: '/login' },
      { path: '/logout' },
      { path: '/', routeName: 'public' },
      { path: '/public/:slug', routeName: 'public.blog-post' },
    ]);

    let oldOptions = Object.assign({}, targetFlatRegistry['admin.posts'].options);

    delete targetFlatRegistry['admin.posts'].options.resetNamespace;

    assert.deepEqual(Router.ROUTE_REGISTRY, targetFlatRegistry);
    assert.ok(router);

    targetFlatRegistry['admin.posts'].options = oldOptions; // NOTE: resets targetRegistry
  });

  test('Router.start with array of routeDefinitions and map create route registry correctly', async (assert) => {
    let router = Router.start(
      [
        { path: '/admin' },
        { path: '/admin/content' },
        { path: '/admin/lol/abc' },
        { path: '/admin/posts/:slug', routeName: 'admin.posts.post' },
        { path: '/admin/settings' },
        { path: '/logout' },
        { path: '/', routeName: 'public' },
      ],
      oldRouterMap
    );

    assert.deepEqual(Router.ROUTE_REGISTRY, targetFlatRegistry);
    assert.ok(router);
  });

  test('Router.convertToRouterJSRouteArray with routeRegistry gets converted to right array of nested routes', async (assert) => {
    Router.SERVICES = {};

    assert.deepEqual(Router.convertToRouterJSRouteArray(targetFlatRegistry), targetRouterJSArray);
  });
});
