import { module, test } from 'qunitx';
import Router, { hbs } from '@emberx/router';
import { visit, currentURL, settled } from '@emberx/test-helpers';
import setupTest from '../helpers/index';
import LoggedRoute, { setupHookSteps } from '../helpers/routes/logged-route';

const USERS = [
  {
    id: 1,
    name: 'Izel Nakri',
    posts: [
      { id: 1, title: 'Compilers are the New Frameworks' },
      { id: 2, title: 'Adventures in Microbenchmarking' },
    ],
  },
  { id: 2, name: 'Tom Dale', posts: [{ id: 3, title: 'What’s the Deal with TypeScript?' }] },
  { id: 3, name: 'Suspended User', suspended: true, posts: [] },
];

// What /users lists. Tests that need a different directory replace it.
let users = USERS;
// The query params the last users.user.posts model hook received.
let receivedQueryParams = null;
const session = { currentUser: null, previousTransition: null };

class HomeRoute extends LoggedRoute('home') {
  static template = hbs`<h1 data-test-title>Home</h1>`;
}

class UsersRoute extends LoggedRoute('users') {
  static model(params, transition) {
    super.model(params, transition);

    return { users };
  }

  // With a single user there is nothing to choose from: /users goes straight to it.
  static redirect(model, transition) {
    super.redirect(model, transition);

    if (model.users.length === 1 && transition.to.name === 'users.index') {
      this.router.transitionTo('users.user', model.users[0]);
    }
  }

  static template = hbs`
    <h1 data-test-title>Users</h1>
    {{#each this.model.users as |user|}}
      <p data-test-user={{user.id}}>{{user.name}}</p>
    {{/each}}
  `;
}

class UserRoute extends LoggedRoute('users.user') {
  static model(params, transition) {
    super.model(params, transition);

    return this.modelFor('users').users.find((user) => user.id === Number(params.user_id));
  }

  static afterModel(user, transition) {
    super.afterModel(user, transition);

    if (user.suspended) {
      return this.router.transitionTo('users');
    }
  }

  static template = hbs`
    <h1 data-test-title>{{this.model.name}}</h1>
    <p data-test-params>user_id: {{@params.user_id}}</p>
  `;
}

class UserPostsRoute extends LoggedRoute('users.user.posts') {
  static model(params, transition) {
    super.model(params, transition);

    const user = this.modelFor('users.user');
    const { limit } = params.queryParams;

    receivedQueryParams = params.queryParams;

    return {
      author: user.name,
      authorId: this.paramsFor('users.user').user_id,
      posts: limit ? user.posts.slice(0, limit) : user.posts,
    };
  }

  static template = hbs`
    <h1 data-test-title>Posts by {{this.model.author}}</h1>
    <p data-test-author-id>{{this.model.authorId}}</p>
    {{#each this.model.posts as |post|}}
      <p data-test-post={{post.id}}>{{post.title}}</p>
    {{/each}}
  `;
}

class AccountRoute extends LoggedRoute('account') {
  static beforeModel(transition) {
    super.beforeModel(transition);

    if (!session.currentUser) {
      session.previousTransition = transition;

      return this.router.transitionTo('login');
    }
  }

  static template = hbs`<h1 data-test-title>Account of {{this.router.currentRouteName}}</h1>`;
}

class LoginRoute extends LoggedRoute('login') {
  static template = hbs`<h1 data-test-title>Login</h1>`;
}

class AboutRoute extends LoggedRoute('about') {
  static template = hbs`<h1 data-test-title>About</h1>`;
}

const RESOLVE_USERS = ['users: beforeModel', 'users: model', 'users: afterModel', 'users: redirect'];
const RESOLVE_USER = ['users.user: beforeModel', 'users.user: model', 'users.user: afterModel', 'users.user: redirect'];
const RESOLVE_ABOUT = ['about: beforeModel', 'about: model', 'about: afterModel', 'about: redirect'];

module('@emberx/router | Nested routes and lifecycle hooks', function (hooks) {
  setupTest(hooks, () => {
    return Router.start([
      { path: '/', name: 'home', route: HomeRoute },
      { path: '/users', name: 'users', route: UsersRoute },
      { path: '/users/:user_id', name: 'users.user', route: UserRoute },
      { path: '/users/:user_id/posts', name: 'users.user.posts', route: UserPostsRoute },
      { path: '/account', name: 'account', route: AccountRoute },
      { path: '/login', name: 'login', route: LoginRoute },
      { path: '/about', name: 'about', route: AboutRoute },
    ]);
  });
  hooks.beforeEach(function () {
    users = USERS;
    receivedQueryParams = null;
    session.currentUser = null;
    session.previousTransition = null;
  });

  module('landing on a route and moving around', function (hooks) {
    setupHookSteps(hooks);

    test('user can land on root and go to a child route that includes its parent model', async function (assert) {
      await visit('/');

      assert.equal(currentURL(), '/');
      assert.dom('[data-test-title]').hasText('Home');
      assert.verifySteps([
        'home: beforeModel',
        'home: model',
        'home: afterModel',
        'home: redirect',
        'home: enter',
        'home: setup',
      ]);

      await visit('/users/2');

      assert.equal(currentURL(), '/users/2');
      assert.dom('[data-test-title]').hasText('Tom Dale', 'the child renders a user it found in the parent model');
      assert.dom('[data-test-params]').hasText('user_id: 2');
      assert.verifySteps(
        [
          ...RESOLVE_USERS,
          ...RESOLVE_USER,
          'home: exit',
          'users: enter',
          'users: setup',
          'users.user: enter',
          'users.user: setup',
        ],
        'every model hook resolves top-down before anything is exited or entered',
      );

      await visit('/users/2/posts');

      assert.equal(currentURL(), '/users/2/posts');
      assert.dom('[data-test-title]').hasText('Posts by Tom Dale');
      assert.dom('[data-test-post]').exists({ count: 1 });
      assert.verifySteps(
        [
          'users.user.posts: beforeModel',
          'users.user.posts: model',
          'users.user.posts: afterModel',
          'users.user.posts: redirect',
          'users.user.posts: enter',
          'users.user.posts: setup',
        ],
        'the routes that stay active keep their models: none of their hooks run again',
      );
    });

    test('user can land on the parent route, go to a child, then to an unrelated route', async function (assert) {
      await visit('/users');

      assert.equal(currentURL(), '/users');
      assert.dom('[data-test-title]').hasText('Users', 'the parent renders for its index route');
      assert.dom('[data-test-user]').exists({ count: 3 });
      assert.verifySteps([...RESOLVE_USERS, 'users: enter', 'users: setup']);

      await visit('/users/1');

      assert.equal(currentURL(), '/users/1');
      assert.dom('[data-test-title]').hasText('Izel Nakri');
      assert.verifySteps([...RESOLVE_USER, 'users.user: enter', 'users.user: setup']);

      await visit('/about');

      assert.equal(currentURL(), '/about');
      assert.dom('[data-test-title]').hasText('About');
      assert.verifySteps(
        [...RESOLVE_ABOUT, 'users.user: exit', 'users: exit', 'about: enter', 'about: setup'],
        'routes exit deepest first, and only once the new route has resolved',
      );
    });

    test('user can land on a child, go to an unrelated route, then back to a child', async function (assert) {
      await visit('/users/1');

      assert.verifySteps([
        ...RESOLVE_USERS,
        ...RESOLVE_USER,
        'users: enter',
        'users: setup',
        'users.user: enter',
        'users.user: setup',
      ]);

      await visit('/about');

      assert.verifySteps([...RESOLVE_ABOUT, 'users.user: exit', 'users: exit', 'about: enter', 'about: setup']);

      await visit('/users/2');

      assert.equal(currentURL(), '/users/2');
      assert.dom('[data-test-title]').hasText('Tom Dale');
      assert.verifySteps(
        [
          ...RESOLVE_USERS,
          ...RESOLVE_USER,
          'about: exit',
          'users: enter',
          'users: setup',
          'users.user: enter',
          'users.user: setup',
        ],
        'coming back resolves the parent again, since it was exited',
      );
    });

    test('changing a param re-runs the hooks of that route only, and sets it up again without entering it', async function (assert) {
      await visit('/users/1');
      assert.verifySteps([
        ...RESOLVE_USERS,
        ...RESOLVE_USER,
        'users: enter',
        'users: setup',
        'users.user: enter',
        'users.user: setup',
      ]);

      await visit('/users/2');

      assert.dom('[data-test-title]').hasText('Tom Dale');
      assert.dom('[data-test-params]').hasText('user_id: 2');
      assert.verifySteps([...RESOLVE_USER, 'users.user: setup'], 'neither users hooks nor users.user enter/exit run');
    });

    test('going up to the parent exits the child and renders the parent', async function (assert) {
      await visit('/users/1/posts');
      assert.verifySteps([
        ...RESOLVE_USERS,
        ...RESOLVE_USER,
        'users.user.posts: beforeModel',
        'users.user.posts: model',
        'users.user.posts: afterModel',
        'users.user.posts: redirect',
        'users: enter',
        'users: setup',
        'users.user: enter',
        'users.user: setup',
        'users.user.posts: enter',
        'users.user.posts: setup',
      ]);

      await visit('/users');

      assert.equal(currentURL(), '/users');
      assert.dom('[data-test-title]').hasText('Users');
      assert.verifySteps(['users.user.posts: exit', 'users.user: exit']);
    });
  });

  module('passing data from parent to child routes', function () {
    test('a child model hook reads its parent model with modelFor and its parent params with paramsFor', async function (assert) {
      await visit('/users/1/posts');

      assert.dom('[data-test-title]').hasText('Posts by Izel Nakri');
      assert.dom('[data-test-author-id]').hasText('1');
      assert.dom('[data-test-post]').exists({ count: 2 });
    });

    test('model hooks receive the query params cast to the values they denote', async function (assert) {
      await visit('/users/1/posts?limit=1&draft=false');

      assert.equal(currentURL(), '/users/1/posts?draft=false&limit=1');
      assert.dom('[data-test-post]').exists({ count: 1 });
      assert.dom('[data-test-post="1"]').hasText('Compilers are the New Frameworks');

      assert.deepEqual(receivedQueryParams, { limit: 1, draft: false });
    });

    test('route templates get the params of every route in the hierarchy as @params', async function (assert) {
      await visit('/users/2');

      assert.dom('[data-test-params]').hasText('user_id: 2');
      assert.deepEqual(UserRoute.getParams(), { user_id: '2' });
      assert.deepEqual(UserRoute.paramsFor('users.user'), { user_id: '2' });
      assert.deepEqual(UserRoute.paramsFor('users'), {});
    });

    test('modelFor and paramsFor throw for a route that is not part of the transition', async function (assert) {
      await visit('/about');

      assert.throws(() => AboutRoute.paramsFor('users.user'), /users\.user is not part of the current transition/);
      assert.throws(() => AboutRoute.modelFor('users.user'), /users\.user not found on current transition/);
    });
  });

  module('redirects', function (hooks) {
    setupHookSteps(hooks);

    test('transitionTo in beforeModel redirects before the model hook runs', async function (assert) {
      await visit('/account');

      assert.equal(currentURL(), '/login');
      assert.dom('[data-test-title]').hasText('Login');
      assert.verifySteps([
        'account: beforeModel',
        'login: beforeModel',
        'login: model',
        'login: afterModel',
        'login: redirect',
        'login: enter',
        'login: setup',
      ]);
    });

    test('a transition stopped in beforeModel can be retried once the reason is gone', async function (assert) {
      await visit('/account');

      assert.equal(currentURL(), '/login');
      assert.verifySteps([
        'account: beforeModel',
        'login: beforeModel',
        'login: model',
        'login: afterModel',
        'login: redirect',
        'login: enter',
        'login: setup',
      ]);

      session.currentUser = { id: 1, name: 'Izel Nakri' };
      await session.previousTransition.retry();
      await settled();

      assert.equal(currentURL(), '/account');
      assert.dom('[data-test-title]').hasText('Account of account');
      assert.verifySteps([
        'account: beforeModel',
        'account: model',
        'account: afterModel',
        'account: redirect',
        'login: exit',
        'account: enter',
        'account: setup',
      ]);
    });

    test('transitionTo in afterModel redirects once the model has resolved', async function (assert) {
      await visit('/users/3');

      assert.equal(currentURL(), '/users');
      assert.dom('[data-test-title]').hasText('Users');
      assert.verifySteps(
        [
          ...RESOLVE_USERS,
          'users.user: beforeModel',
          'users.user: model',
          'users.user: afterModel',
          'users.user: redirect',
          'users: enter',
          'users: setup',
        ],
        'router_js still calls the redirect hook of the route that redirected; the parent resolved on the way is kept',
      );
    });

    test('the redirect hook runs once its model resolves, and redirecting into a child keeps the parent model', async function (assert) {
      users = [USERS[1]];

      await visit('/users');

      assert.equal(currentURL(), '/users/2');
      assert.dom('[data-test-title]').hasText('Tom Dale');
      assert.verifySteps(
        [
          ...RESOLVE_USERS,
          'users.user: beforeModel',
          'users.user: afterModel',
          'users.user: redirect',
          'users: enter',
          'users: setup',
          'users.user: enter',
          'users.user: setup',
        ],
        'users resolves once; the redirect hands users.user its model, so its model hook is skipped',
      );
    });

    test('the redirect hook of a parent that stays active does not run again', async function (assert) {
      users = [USERS[1]];

      await visit('/users/2/posts');

      assert.equal(currentURL(), '/users/2/posts', 'the redirect only applies to /users itself');
      assert.verifySteps([
        ...RESOLVE_USERS,
        ...RESOLVE_USER,
        'users.user.posts: beforeModel',
        'users.user.posts: model',
        'users.user.posts: afterModel',
        'users.user.posts: redirect',
        'users: enter',
        'users: setup',
        'users.user: enter',
        'users.user: setup',
        'users.user.posts: enter',
        'users.user.posts: setup',
      ]);

      await visit('/users');

      assert.equal(currentURL(), '/users', 'users stayed active, so its redirect hook did not run to send us on');
      assert.dom('[data-test-title]').hasText('Users');
      assert.verifySteps(['users.user.posts: exit', 'users.user: exit']);
    });

    test('router.transitionTo from application code runs the same hooks as visiting the URL', async function (assert) {
      const router = this.owner.lookup('service:router');

      await router.transitionTo('users.user', 2);
      await settled();

      assert.equal(currentURL(), '/users/2');
      assert.dom('[data-test-title]').hasText('Tom Dale');
      assert.verifySteps([
        ...RESOLVE_USERS,
        ...RESOLVE_USER,
        'users: enter',
        'users: setup',
        'users.user: enter',
        'users.user: setup',
      ]);
    });

    test('router.transitionTo with a model object uses it as the model, without running the model hook', async function (assert) {
      const router = this.owner.lookup('service:router');

      await router.transitionTo('users.user', USERS[0]);
      await settled();

      assert.equal(currentURL(), '/users/1');
      assert.dom('[data-test-title]').hasText('Izel Nakri');
      assert.verifySteps([
        ...RESOLVE_USERS,
        'users.user: beforeModel',
        'users.user: afterModel',
        'users.user: redirect',
        'users: enter',
        'users: setup',
        'users.user: enter',
        'users.user: setup',
      ]);
    });
  });
});
