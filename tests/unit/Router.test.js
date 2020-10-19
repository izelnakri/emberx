// TODO: write test utility to query actual router_js registry of the Router and assert against objects
import { module, test } from 'qunit';
import Router from '../../src/router';
import oldRouterMap from '../helpers/old-router-map';
import targetRegistryForOldRouterMap from '../helpers/outputs/target-registry-for-old-router-map';
import targetRouteJSArrayForOldRouterMap from '../helpers/outputs/target-route-js-array-for-old-router-map';

module('Router Unit Test', () => {
  test('Router.map creates route registry without Router.start()', async (assert) => {
    assert.true(Router.LOG_ROUTES);
    assert.true(Router.LOG_MODELS);
    assert.deepEqual(Router._ROUTE_REGISTRY, {});
    assert.deepEqual(Router.SERVICES, {});

    assert.ok(Router.map);
    assert.ok(Router.start);

    let routeRegistry = Router.map(oldRouterMap);

    assert.deepEqual(Router._ROUTE_REGISTRY, targetRegistryForOldRouterMap);
    assert.deepEqual(routeRegistry, targetRegistryForOldRouterMap);
  });

  test('Router.start with only map create route registry correctly', async (assert) => {
    let router = Router.start([], oldRouterMap);

    assert.deepEqual(Router._ROUTE_REGISTRY, targetRegistryForOldRouterMap);
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

    let oldOptions = Object.assign({}, targetRegistryForOldRouterMap['admin.posts'].options);

    delete targetRegistryForOldRouterMap['admin.posts'].options.resetNamespace;

    assert.deepEqual(Router._ROUTE_REGISTRY, targetRegistryForOldRouterMap);
    assert.ok(router);

    targetRegistryForOldRouterMap['admin.posts'].options = oldOptions; // NOTE: resets targetRegistry
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

    assert.deepEqual(Router._ROUTE_REGISTRY, targetRegistryForOldRouterMap);
    assert.ok(router);
  });

  test('Router.convertToRouterJSRouteArray with routeRegistry gets converted to right array of nested routes', async (assert) => {
    Router.SERVICES = {};

    assert.deepEqual(
      Router.convertToRouterJSRouteArray(targetRegistryForOldRouterMap),
      targetRouteJSArrayForOldRouterMap
    );
  });
});
