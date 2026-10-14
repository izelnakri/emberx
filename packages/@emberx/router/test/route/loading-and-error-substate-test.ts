// https://guides.emberjs.com/release/routing/loading-and-error-substates/
import { module, test } from 'qunitx';
import Router, { Route, hbs } from '@emberx/router';
import { visit, currentURL, currentRouteName, wait, waitFor, waitUntil } from '@emberx/test-helpers';
import setupTest from '../helpers/index';
import API from '../helpers/services/api';
import ParentLoadingRoute from '../helpers/routes/parent-loading-route';
import ChildLoadingRoute from '../helpers/routes/child-loading-route';
import ParentErrorRoute from '../helpers/routes/parent-error-route';
import ChildErrorRoute from '../helpers/routes/child-error-route';

const POSTS = [
  { id: 1, title: 'Compilers are the New Frameworks' },
  { id: 2, title: 'Adventures in Microbenchmarking', locked: true },
];

let api: API;

class HomeRoute extends Route {
  static template = hbs`<h1 data-test-title>Home</h1>`;
}

class LoginRoute extends Route {
  static template = hbs`<h1 data-test-title>Login</h1>`;
}

class PostsRoute extends Route {
  static model() {
    return this.api.get('/posts');
  }

  static template = hbs`
    <h1 data-test-title>Posts</h1>
    {{#each this.model as |post|}}
      <p data-test-post={{post.id}}>{{post.title}}</p>
    {{/each}}
  `;
}

class PostRoute extends Route {
  static model(params) {
    return this.api.get(`/posts/${params.post_id}`);
  }

  static afterModel(post) {
    if (post.locked) {
      return Promise.reject(new Error('This post is locked'));
    }
  }

  static template = hbs`<h1 data-test-title>{{this.model.title}}</h1>`;
}

class CommentsRoute extends Route {
  static beforeModel() {
    throw new Error('Comments are closed');
  }
}

// Recovers from a failed request on its own, so no error event is ever fired.
class FeedRoute extends Route {
  static model() {
    return this.api.get('/feed').catch(() => [{ id: 0, title: 'Showing the cached feed' }]);
  }

  static template = hbs`
    {{#each this.model as |post|}}
      <p data-test-post={{post.id}}>{{post.title}}</p>
    {{/each}}
  `;
}

class LoadingRoute extends Route {
  static template = hbs`<h1 data-test-loading>Loading...</h1>`;
}

class ErrorRoute extends Route {
  static template = hbs`<h1 data-test-error>Something went wrong: {{this.model.message}}</h1>`;
}

// Recovers from a 403 in its own hook by sending the user to log in.
class DashboardRoute extends Route {
  static model() {
    return this.api.get('/dashboard').catch((error) => {
      if (error.status === 403) {
        return this.router.transitionTo('login');
      }

      throw error;
    });
  }
}

/** Starts the router with the routes every module shares, plus `substates`. */
function startRouter(...substates) {
  return () => {
    api = new API();
    Router.addServices({ api });

    return Router.start([
      { path: '/', name: 'home', route: HomeRoute },
      { path: '/login', name: 'login', route: LoginRoute },
      { path: '/feed', name: 'feed', route: FeedRoute },
      { path: '/posts', name: 'posts', route: PostsRoute },
      { path: '/posts/:post_id', name: 'posts.post', route: PostRoute },
      { path: '/posts/:post_id/comments', name: 'posts.post.comments', route: CommentsRoute },
      { path: '/dashboard', name: 'dashboard', route: DashboardRoute },
      ...substates,
    ]);
  };
}

/** Steps "substate <name>" for every loading or error substate the router enters. */
function recordSubstates(assert, router) {
  const intermediateTransitionTo = router.intermediateTransitionTo;

  router.intermediateTransitionTo = function (name, ...args) {
    assert.step(`substate ${name}`);

    return intermediateTransitionTo.call(this, name, ...args);
  };
}

module('@emberx/router | Loading and error substates', function () {
  module('loading substates', function (hooks) {
    setupTest(
      hooks,
      startRouter(
        { name: 'posts_loading', route: ParentLoadingRoute },
        { name: 'posts.loading', route: ChildLoadingRoute },
      ),
    );
    hooks.beforeEach(function (assert) {
      recordSubstates(assert, this.owner.lookup('service:router'));
    });

    test('a model that resolves right away shows no loading substate', async function (assert) {
      api.respondWith('/posts', POSTS);

      await visit('/posts');

      assert.dom('[data-test-post]').exists({ count: 2 });
      assert.verifySteps([]);
    });

    test('the loading substate of a route shows while its model loads, then gives way to the route', async function (assert) {
      const visiting = visit('/posts');

      await waitFor('[data-test-loading]');

      assert.dom('[data-test-loading]').hasText('Loading posts...');
      assert.equal(currentRouteName(), 'posts_loading');

      api.resolve('/posts', POSTS);
      await visiting;

      assert.dom('[data-test-loading]').doesNotExist();
      assert.dom('[data-test-post]').exists({ count: 2 });
      assert.equal(currentURL(), '/posts');
      assert.equal(currentRouteName(), 'posts.index');
      assert.verifySteps(['substate posts_loading']);
    });

    test('a loading child route shows the loading substate under its parent', async function (assert) {
      api.respondWith('/posts', POSTS);
      await visit('/posts');

      const visiting = visit('/posts/1');

      await waitFor('[data-test-loading]');

      assert.dom('[data-test-loading]').hasText('Loading the post...');
      assert.equal(currentRouteName(), 'posts.loading');

      api.resolve('/posts/1', POSTS[0]);
      await visiting;

      assert.dom('[data-test-title]').hasText('Compilers are the New Frameworks');
      assert.equal(currentRouteName(), 'posts.post.index');
      assert.verifySteps(['substate posts.loading']);
    });
  });

  module('error substates', function (hooks) {
    setupTest(
      hooks,
      startRouter(
        { name: 'posts_loading', route: ParentLoadingRoute },
        { name: 'posts_error', route: ParentErrorRoute },
        { name: 'posts.error', route: ChildErrorRoute },
      ),
    );
    hooks.beforeEach(function (assert) {
      recordSubstates(assert, this.owner.lookup('service:router'));
    });

    test('a rejected model hook shows the error substate of its route, with the error as its model', async function (assert) {
      api.respondWith('/posts', new Error('Server is down'));

      await visit('/posts');

      assert.dom('[data-test-error]').hasText('Posts could not load: Server is down');
      assert.equal(currentRouteName(), 'posts_error');
      assert.equal(currentURL(), '/posts', 'the URL is still the one that failed, so a reload retries it');
      assert.verifySteps(['substate posts_error']);
    });

    test('a model that fails while loading swaps the loading substate for the error substate', async function (assert) {
      const visiting = visit('/posts');

      await waitFor('[data-test-loading]');
      api.reject('/posts', new Error('Server is down'));
      await visiting;

      assert.dom('[data-test-loading]').doesNotExist();
      assert.dom('[data-test-error]').hasText('Posts could not load: Server is down');
      assert.verifySteps(['substate posts_loading', 'substate posts_error']);
    });

    test('a failing child route shows the error substate under its parent', async function (assert) {
      api.respondWith('/posts', POSTS);
      api.respondWith('/posts/1', new Error('Post not found'));

      await visit('/posts/1');

      assert.dom('[data-test-error]').hasText('The post could not load: Post not found');
      assert.equal(currentRouteName(), 'posts.error');
      assert.verifySteps(['substate posts.error']);
    });

    test('errors from beforeModel and afterModel go to the error substate too', async function (assert) {
      api.respondWith('/posts', POSTS);
      api.respondWith('/posts/1', POSTS[0]);
      api.respondWith('/posts/2', POSTS[1]);

      await visit('/posts/2');

      assert.dom('[data-test-error]').hasText('The post could not load: This post is locked');

      await visit('/posts/1/comments');

      assert.dom('[data-test-error]').hasText('The post could not load: Comments are closed');
      assert.verifySteps(['substate posts.error', 'substate posts.error']);
    });

    test('the route renders as usual once it is visited again and loads', async function (assert) {
      api.respondWith('/posts', new Error('Server is down'));
      await visit('/posts');
      assert.dom('[data-test-error]').exists();

      api.respondWith('/posts', POSTS);
      await visit('/posts');

      assert.dom('[data-test-error]').doesNotExist();
      assert.dom('[data-test-post]').exists({ count: 2 });
      assert.equal(currentRouteName(), 'posts.index');
      assert.verifySteps(['substate posts_error']);
    });

    test('a model hook that catches its own rejection and returns data shows no error substate', async function (assert) {
      api.respondWith('/feed', new Error('Timed out'));

      await visit('/feed');

      assert.dom('[data-test-post]').hasText('Showing the cached feed');
      assert.verifySteps([]);
    });

    test('a model hook that catches an error can send the user elsewhere instead', async function (assert) {
      api.respondWith('/dashboard', Object.assign(new Error('Forbidden'), { status: 403 }));

      await visit('/dashboard');

      assert.equal(currentURL(), '/login');
      assert.dom('[data-test-title]').hasText('Login');
      assert.verifySteps([], 'it was not an error, so no error substate');
    });
  });

  module('top-level loading and error routes', function (hooks) {
    setupTest(hooks, startRouter({ name: 'loading', route: LoadingRoute }, { name: 'error', route: ErrorRoute }));
    hooks.beforeEach(function (assert) {
      recordSubstates(assert, this.owner.lookup('service:router'));
    });

    test('a route without a loading substate of its own falls back to the top-level one', async function (assert) {
      const visiting = visit('/posts');

      await waitFor('[data-test-loading]');

      assert.dom('[data-test-loading]').hasText('Loading...');

      api.resolve('/posts', POSTS);
      await visiting;

      assert.dom('[data-test-post]').exists({ count: 2 });
      assert.verifySteps(['substate loading']);
    });

    test('the top-level loading route does not show for a route under one that stays active', async function (assert) {
      api.respondWith('/posts', POSTS);
      await visit('/posts');

      const visiting = visit('/posts/1');

      await waitUntil(() => api.isPending('/posts/1'));
      await wait(20); // well past the task the loading substate waits for

      assert.dom('[data-test-loading]').doesNotExist();
      assert.dom('[data-test-title]').hasText('Posts', 'posts stays up while its child loads');

      api.resolve('/posts/1', POSTS[0]);
      await visiting;

      assert.dom('[data-test-title]').hasText('Compilers are the New Frameworks');
      assert.verifySteps([]);
    });

    test('a route without an error substate of its own falls back to the top-level one', async function (assert) {
      api.respondWith('/posts', POSTS);
      api.respondWith('/posts/1', new Error('Post not found'));

      await visit('/posts/1');

      assert.dom('[data-test-error]').hasText('Something went wrong: Post not found');
      assert.equal(currentRouteName(), 'error');
      assert.verifySteps(['substate error']);
    });
  });

  module('substates declared in Router.map()', function (hooks) {
    setupTest(hooks, () => {
      api = new API();
      Router.addServices({ api });

      return Router.start(
        [
          { path: '/', name: 'home', route: HomeRoute },
          { path: '/posts', name: 'posts', route: PostsRoute },
          { path: '/posts/:post_id', name: 'posts.post', route: PostRoute },
          { name: 'posts.error', route: ChildErrorRoute },
        ],
        function () {
          this.route('posts', function () {
            this.route('error');
          });
          this.route('error'); // no class anywhere, so there is nothing to render
        },
      );
    });

    test('a loading or error route in the map is a substate, which Router.start() gives its class', async function (assert) {
      api.respondWith('/posts', POSTS);
      api.respondWith('/posts/1', new Error('Post not found'));

      await visit('/posts/1');

      assert.dom('[data-test-error]').hasText('The post could not load: Post not found');
      assert.equal(currentRouteName(), 'posts.error');
    });

    test('a substate has no URL of its own', async function (assert) {
      await visit('/error');

      assert.equal(currentRouteName(), 'not-found', 'the map declares error, but /error is not its URL');
    });

    test('a substate nothing gives a class is never entered', async function (assert) {
      api.respondWith('/posts', new Error('Server is down'));

      await assert.rejects(
        visit('/posts'),
        /Server is down/,
        'the top-level error route of the map has nothing to render',
      );
      assert.dom('[data-test-error]').doesNotExist();
    });
  });

  module('without substates', function (hooks) {
    setupTest(hooks, startRouter());

    test('an error nothing handles rejects visit() and keeps the page it failed to leave', async function (assert) {
      api.respondWith('/posts', POSTS);
      api.respondWith('/posts/1', new Error('Post not found'));
      await visit('/posts');

      await assert.rejects(visit('/posts/1'), /Post not found/);

      assert.dom('[data-test-title]').hasText('Posts');
    });

    test('substates are entered by name only: declaring a route named "error" with a path keeps it a plain route', async function (assert) {
      Router.start([
        { path: '/', name: 'home', route: HomeRoute },
        { path: '/posts', name: 'posts', route: PostsRoute },
        { path: '/error', name: 'error', route: ErrorRoute },
      ]);
      this.Router = Router;
      api.respondWith('/posts', new Error('Server is down'));

      await assert.rejects(visit('/posts'), /Server is down/);
      await visit('/error');

      assert.equal(currentURL(), '/error');
      assert.dom('[data-test-error]').hasText('Something went wrong:');
    });

    test('a substate declared under a route that does not exist is a mistake caught at startup', function (assert) {
      assert.throws(
        () => Router.start([{ name: 'drafts.loading', route: LoadingRoute }]),
        /The "drafts\.loading" substate needs its parent route "drafts" to be defined too/,
      );
    });
  });
});
