import { module, test } from 'qunitx';
import Router, { Route, hbs } from '@emberx/router';
import { visit, currentURL, setupRenderingTest } from '@emberx/test-helpers';

const session = { currentUser: null };

class HomeRoute extends Route {
  static template = hbs`<h1 data-test-title>Home</h1>`;
}

class PostsRoute extends Route {
  static queryParams = { page: 1 };
  static template = hbs`<h1 data-test-title>Posts</h1>`;
}

class PostRoute extends Route {
  static template = hbs`<h1 data-test-title>Post</h1>`;
}

class AccountRoute extends Route {
  static beforeModel() {
    if (!session.currentUser) {
      return this.router.transitionTo('login');
    }
  }
}

class LoginRoute extends Route {
  static template = hbs`<h1 data-test-title>Login</h1>`;
}

module('@emberx/router | RouterService', function (hooks) {
  setupRenderingTest(hooks, () => {
    return Router.start([
      { path: '/', name: 'home', route: HomeRoute },
      { path: '/posts', name: 'posts', route: PostsRoute },
      { path: '/posts/:post_id', name: 'posts.post', route: PostRoute },
      { path: '/posts/:post_id/comments', name: 'posts.post.comments', route: Route },
      { path: '/account', name: 'account', route: AccountRoute },
      { path: '/login', name: 'login', route: LoginRoute },
    ]);
  });

  module('routeWillChange and routeDidChange', function (hooks) {
    let router;

    hooks.beforeEach(function (assert) {
      router = this.owner.lookup('service:router');
      router.on('routeWillChange', (transition) => {
        assert.step(`will change: ${transition.from?.name ?? 'nothing'} → ${transition.to.name}`);
      });
      router.on('routeDidChange', function (transition) {
        assert.step(`did change: ${transition.to.name} at ${this.currentURL}`);
      });
    });

    test('routeWillChange fires as a transition starts, and routeDidChange once it is done', async function (assert) {
      await visit('/');
      await visit('/posts/1');

      assert.verifySteps([
        'will change: nothing → home',
        'did change: home at /',
        'will change: home → posts.post.index',
        'did change: posts.post.index at /posts/1',
      ]);
    });

    test('a redirect fires routeWillChange again, and routeDidChange only where it ends', async function (assert) {
      await visit('/account');

      assert.equal(currentURL(), '/login');
      assert.verifySteps([
        'will change: nothing → account',
        'will change: nothing → login',
        'did change: login at /login',
      ]);
    });

    test('a query param change fires both', async function (assert) {
      await visit('/posts');
      await visit('/posts?page=2');

      assert.verifySteps([
        'will change: nothing → posts.index',
        'did change: posts.index at /posts',
        'will change: posts.index → posts.index',
        'did change: posts.index at /posts?page=2',
      ]);
    });

    test('off stops calling a listener', async function (assert) {
      const listener = () => assert.step('removed listener');

      router.on('routeDidChange', listener);
      router.off('routeDidChange', listener);
      await visit('/');

      assert.verifySteps(['will change: nothing → home', 'did change: home at /']);
    });

    test('there are no other events', function (assert) {
      assert.throws(
        () => router.on('didTransition', () => {}),
        /The router has no "didTransition" event, only routeWillChange and routeDidChange/,
      );
    });
  });

  module('urlFor', function () {
    test('builds the URL of a route from its models, without transitioning', async function (assert) {
      const router = this.owner.lookup('service:router');

      await visit('/');

      assert.equal(router.urlFor('posts.post', 1), '/posts/1');
      assert.equal(router.urlFor('posts.post', { id: 2, title: 'Second' }), '/posts/2', 'a model gives its id');
      assert.equal(router.urlFor('home'), '/');
      assert.equal(currentURL(), '/');
    });

    test('takes the models it is not given from the routes that are active', async function (assert) {
      const router = this.owner.lookup('service:router');

      await visit('/posts/3');

      assert.equal(router.urlFor('posts.post.comments'), '/posts/3/comments');
      assert.equal(router.urlFor('posts.post.comments', 4), '/posts/4/comments');
    });

    test('adds query params, leaving out the missing ones and those at their declared default', async function (assert) {
      const router = this.owner.lookup('service:router');

      await visit('/');

      assert.equal(router.urlFor('posts', { queryParams: { page: 2, sort: 'title' } }), '/posts?page=2&sort=title');
      assert.equal(router.urlFor('posts', { queryParams: { page: 1, draft: null, tag: undefined } }), '/posts');
      assert.equal(
        router.urlFor('posts.post', 1, { queryParams: { page: '1' } }),
        '/posts/1',
        'compared as the value it denotes',
      );
    });
  });
});
