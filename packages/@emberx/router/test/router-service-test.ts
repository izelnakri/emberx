import { module, test } from 'qunitx';
import Router, { Route, hbs } from '@emberx/router';
import { visit, currentURL } from '@emberx/test-helpers';
import setupTest from './helpers/index.ts';

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
  setupTest(hooks, () => {
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
});
