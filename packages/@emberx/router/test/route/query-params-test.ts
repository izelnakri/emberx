import { module, test } from 'qunitx';
import Router, { Route, hbs } from '@emberx/router';
import { visit, currentURL, click, settled } from '@emberx/test-helpers';
import setupTest from '../helpers/index.ts';
import { setupHookSteps } from '../helpers/routes/logged-route.ts';
import QueryParamParentRoute from '../helpers/routes/query-param-parent-route.ts';
import QueryParamChildRoute from '../helpers/routes/query-param-child-route.ts';

class HomeRoute extends Route {
  static template = hbs`<h1 data-test-title>Home</h1>`;
}

/** The step QueryParamParentRoute's model hook records for these query params. */
function postsModel(queryParams) {
  return `posts model: ${JSON.stringify(queryParams)}`;
}

/** The step QueryParamChildRoute's model hook records for these query params. */
function postModel(queryParams) {
  return `posts.post model: ${JSON.stringify(queryParams)}`;
}

/** Steps "<updateURL|replaceURL> <url>" for every URL change, to tell a push from a replace. */
function recordURLChanges(assert, router) {
  for (const method of ['updateURL', 'replaceURL']) {
    const original = router[method];

    router[method] = function (url) {
      assert.step(`${method} ${url}`);

      return original.call(this, url);
    };
  }
}

const DEFAULTS = { page: 1, sort: 'oldest', category: 'all' };
const WITH_CHILD_DEFAULTS = { ...DEFAULTS, comments: false };

module('@emberx/router | Query params', function (hooks) {
  setupTest(hooks, () => {
    return Router.start([
      { path: '/', name: 'home', route: HomeRoute },
      { path: '/posts', name: 'posts', route: QueryParamParentRoute },
      { path: '/posts/:post_id', name: 'posts.post', route: QueryParamChildRoute },
    ]);
  });
  setupHookSteps(hooks);

  module('reading query params', function () {
    test('query params in the URL are cast to the values they denote', async function (assert) {
      await visit('/posts?page=2&preview=true&ref=007&utm_source=');

      const expected = { ...DEFAULTS, page: 2, preview: true, ref: '007' };

      assert.equal(currentURL(), '/posts?page=2&preview=true&ref=007', 'an empty param is dropped from the URL');
      assert.deepEqual(this.owner.lookup('service:router').queryParams, { page: 2, preview: true, ref: '007' });
      assert.deepEqual(QueryParamParentRoute.getQueryParams(), expected);
      assert.dom('[data-test-title]').hasText('Page 2 of all posts, oldest first');
      assert.verifySteps([postsModel(expected)], 'the model hook gets them cast too, with the defaults filled in');
    });

    test('declared defaults fill in for the params missing from the URL, and stay out of it', async function (assert) {
      await visit('/posts');

      assert.equal(currentURL(), '/posts');
      assert.dom('[data-test-title]').hasText('Page 1 of all posts, oldest first');
      assert.verifySteps([postsModel(DEFAULTS)]);

      await visit('/posts?page=1&sort=oldest&category=all');

      assert.equal(currentURL(), '/posts', 'a param at its default is left out of the URL');
      assert.deepEqual(this.owner.lookup('service:router').queryParams, {});
      assert.verifySteps([], 'nothing changed, so nothing refreshed');
    });

    test('route templates read the same query params as @queryParams and this.queryParams', async function (assert) {
      await visit('/posts?category=compilers&sort=newest');

      assert.dom('[data-test-title]').hasText('Page 1 of compilers posts, newest first');
      assert.verifySteps([postsModel({ ...DEFAULTS, category: 'compilers', sort: 'newest' })]);
    });

    test('setting a param to null or undefined removes it from the URL, and brings back its default', async function (assert) {
      const router = this.owner.lookup('service:router');

      await visit('/posts?category=compilers&preview=true');
      assert.verifySteps([postsModel({ ...DEFAULTS, category: 'compilers', preview: true })]);

      await router.transitionTo({ queryParams: { category: null, preview: undefined } });
      await settled();

      assert.equal(currentURL(), '/posts');
      assert.dom('[data-test-title]').hasText('Page 1 of all posts, oldest first');

      await visit('/posts?category=compilers');
      await visit('/posts?category=null');

      assert.equal(currentURL(), '/posts', 'the string "null" in a URL removes the param as well');
      assert.verifySteps([]);
    });
  });

  module('changing query params', function () {
    test('a param declared with refreshModel re-runs the model hook of the route that declares it', async function (assert) {
      await visit('/posts');
      assert.dom('[data-test-post]').exists({ count: 2 });
      assert.verifySteps([postsModel(DEFAULTS)]);

      await visit('/posts?page=2');

      assert.equal(currentURL(), '/posts?page=2');
      assert.dom('[data-test-title]').hasText('Page 2 of all posts, oldest first');
      assert.dom('[data-test-post="3"]').exists();
      assert.dom('[data-test-post="4"]').exists();
      assert.verifySteps([postsModel({ ...DEFAULTS, page: 2 })]);
    });

    test('a param without refreshModel updates the page in place: no model hook runs and the route keeps its state', async function (assert) {
      await visit('/posts?page=2');
      await click('[data-test-bookmark]');

      assert.dom('[data-test-bookmark]').hasText('Bookmarked 1');
      assert.dom('[data-test-post]').exists({ count: 2 });
      assert.verifySteps([postsModel({ ...DEFAULTS, page: 2 })]);

      await visit('/posts?page=2&category=compilers');

      assert.equal(currentURL(), '/posts?category=compilers&page=2');
      assert.dom('[data-test-title]').hasText('Page 2 of compilers posts, oldest first');
      assert.dom('[data-test-post]').exists({ count: 1 });
      assert.dom('[data-test-post="4"]').exists();
      assert.dom('[data-test-bookmark]').hasText('Bookmarked 1', 'the route was not rendered again');
      assert.verifySteps([]);

      await visit('/posts?page=2&category=compilers&sort=newest');

      assert.dom('[data-test-title]').hasText('Page 2 of compilers posts, newest first');
      assert.dom('[data-test-bookmark]').hasText('Bookmarked 1');
      assert.verifySteps([]);
    });

    test('refreshModel re-runs the hooks from the route that declares the param down, never above it', async function (assert) {
      await visit('/posts/1');

      assert.dom('[data-test-title]').hasText('Compilers are the New Frameworks');
      assert.dom('[data-test-comment]').doesNotExist();
      assert.verifySteps([postsModel(WITH_CHILD_DEFAULTS), postModel(WITH_CHILD_DEFAULTS)]);

      await visit('/posts/1?comments=true');

      assert.equal(currentURL(), '/posts/1?comments=true');
      assert.dom('[data-test-comment]').exists({ count: 2 });
      assert.verifySteps([postModel({ ...WITH_CHILD_DEFAULTS, comments: true })], 'posts declares no comments param');

      await visit('/posts/1?comments=true&page=2');

      assert.verifySteps(
        [
          postsModel({ ...WITH_CHILD_DEFAULTS, comments: true, page: 2 }),
          postModel({ ...WITH_CHILD_DEFAULTS, comments: true, page: 2 }),
        ],
        'a param of the parent refreshes the parent and every route below it',
      );
    });

    test('a param declared with replace changes the URL with replaceState, the others with pushState', async function (assert) {
      recordURLChanges(assert, this.owner.lookup('service:router'));

      await visit('/posts');
      await visit('/posts?sort=newest');
      await visit('/posts?sort=newest&category=compilers');
      await visit('/posts?sort=oldest&category=compilers');

      assert.verifySteps([
        postsModel(DEFAULTS),
        'updateURL /posts',
        'replaceURL /posts?sort=newest',
        'updateURL /posts?category=compilers&sort=newest',
        'replaceURL /posts?category=compilers',
      ]);
    });

    test('named transitions take query params, and refresh the routes that declare them', async function (assert) {
      const router = this.owner.lookup('service:router');

      await router.transitionTo('posts', { queryParams: { page: 3 } });
      await settled();

      assert.equal(currentURL(), '/posts?page=3');
      assert.dom('[data-test-post="5"]').exists();
      assert.verifySteps([postsModel({ ...DEFAULTS, page: 3 })]);

      await router.transitionTo({ queryParams: { page: 2 } });
      await settled();

      assert.equal(currentURL(), '/posts?page=2');
      assert.verifySteps([postsModel({ ...DEFAULTS, page: 2 })]);
    });

    test('query params are not sticky: leaving a route leaves its query params behind', async function (assert) {
      await visit('/posts?category=compilers&page=2');
      await visit('/');
      await visit('/posts');

      assert.equal(currentURL(), '/posts');
      assert.dom('[data-test-title]').hasText('Page 1 of all posts, oldest first');
      assert.verifySteps([postsModel({ ...DEFAULTS, category: 'compilers', page: 2 }), postsModel(DEFAULTS)]);
    });
  });
});
