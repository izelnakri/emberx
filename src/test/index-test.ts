import test from 'ava';
// import fs from 'fs-extra';
import oldRouterMap from './test-helpers/old-router-map';
import targetRegistryForOldRouterMap from './target-outputs/target-registry-for-old-router-map';
import targetRouteJSArrayForOldRouterMap from './target-outputs/target-route-js-array-for-old-router-map';
// TODO: write test utility to query actual router_js registry of the Router and assert against objects

// const CWD = process.cwd();

test.beforeEach(async () => {
  Object.keys(require.cache).forEach((key) => delete require.cache[key]);
});

test.serial('Router.map creates route registry without start', async (t) => {
  const Router = (await import('../router')).default;

  t.true(Router.LOG_ROUTES);
  t.true(Router.LOG_MODELS);
  t.deepEqual(Router.ROUTE_REGISTRY, {});
  t.deepEqual(Router.SERVICES, {});

  const router = new Router();

  t.truthy(router.route);
  t.truthy(router.map);
  t.truthy(router.start);

  router.map(oldRouterMap);

  t.deepEqual(Router.ROUTE_REGISTRY, targetRegistryForOldRouterMap);
});

test.serial('Router.start with only map create route registry correctly', async (t) => {
  const Router = (await import('../router')).default;

  Router.ROUTE_REGISTRY = {};

  t.true(Router.LOG_ROUTES);
  t.true(Router.LOG_MODELS);
  t.deepEqual(Router.ROUTE_REGISTRY, {});
  t.deepEqual(Router.SERVICES, {});

  const router = new Router();

  t.truthy(router.route);
  t.truthy(router.map);
  t.truthy(router.start);

  router.start([], oldRouterMap);

  t.deepEqual(Router.ROUTE_REGISTRY, targetRegistryForOldRouterMap);
});

test.serial(
  'Router.start with array of routeDefinitions create route registry correctly',
  async (t) => {
    const Router = (await import('../router')).default;

    t.true(Router.LOG_ROUTES);
    t.true(Router.LOG_MODELS);
    t.deepEqual(Router.ROUTE_REGISTRY, {});
    t.deepEqual(Router.SERVICES, {});

    const router = new Router();

    t.truthy(router.route);
    t.truthy(router.map);
    t.truthy(router.start);

    router.start([
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

    const oldOptions = Object.assign({}, targetRegistryForOldRouterMap['admin.posts'].options);

    delete targetRegistryForOldRouterMap['admin.posts'].options.resetNamespace;

    t.deepEqual(Router.ROUTE_REGISTRY, targetRegistryForOldRouterMap);

    targetRegistryForOldRouterMap['admin.posts'].options = oldOptions;
  }
);

test.serial(
  'Router.start with array of routeDefinitions and map create route registry correctly',
  async (t) => {
    const Router = (await import('../router')).default;

    t.true(Router.LOG_ROUTES);
    t.true(Router.LOG_MODELS);
    t.deepEqual(Router.ROUTE_REGISTRY, {});
    t.deepEqual(Router.SERVICES, {});

    const router = new Router();

    router.start(
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

    t.deepEqual(Router.ROUTE_REGISTRY, targetRegistryForOldRouterMap);
  }
);

test.serial(
  'Router.convertToRouterJSRouteArray with ROUTE_REGISTRY gets converted to right array of nested routes',
  async (t) => {
    const Router = (await import('../router')).default;

    t.deepEqual(
      Router.convertToRouterJSRouteArray(targetRegistryForOldRouterMap),
      targetRouteJSArrayForOldRouterMap
    );
  }
);
