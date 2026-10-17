import { module, test } from 'qunitx';
import Router, { Route, hbs, action, tracked } from '@emberx/router';
import { visit, click, currentURL, currentRouteName, waitFor } from '@emberx/test-helpers';
import setupTest from '../helpers/index.ts';
import LoggedRoute, { setupHookSteps } from '../helpers/routes/logged-route.ts';

const POSTS = [
  { id: 1, title: 'Compilers are the New Frameworks' },
  { id: 2, title: 'Adventures in Microbenchmarking' },
];

// Who is logged in, which the application route loads once for every page.
let currentUser: { name: string } | null = null;
// What the application route's `notify` action was sent.
let notifications: string[] = [];
// Settles the slow route's model, for the loading tests.
let release: (() => void) | null = null;

class ApplicationRoute extends LoggedRoute('application') {
  static queryParams = { theme: 'light' };

  // Anyone not logged in goes to the login page first, whatever page they asked for.
  static beforeModel(transition) {
    super.beforeModel(transition);

    if (!currentUser && transition.to.name !== 'login') {
      return this.router.transitionTo('login');
    }
  }

  static model(params, transition) {
    super.model(params, transition);

    return { currentUser };
  }

  @tracked accessor notifyCount = 0;

  @action
  notify(message) {
    this.notifyCount++;
    notifications.push(`${message} (${this.notifyCount})`);
  }
}

class HomeRoute extends Route {
  static template = hbs`
    <h1 data-test-title>Home</h1>
    <button type="button" data-test-notify {{on "click" (fn this.send "notify" "from home")}}>Notify</button>
  `;
}

class LoginRoute extends Route {
  static template = hbs`<h1 data-test-title>Login</h1>`;
}

class AboutRoute extends Route {
  static template = hbs`<h1 data-test-title>About</h1><p data-test-theme>{{@queryParams.theme}}</p>`;
}

class PostsRoute extends LoggedRoute('posts') {
  static model(params, transition) {
    super.model(params, transition);

    return POSTS;
  }
}

class PostRoute extends LoggedRoute('posts.post') {
  static model(params, transition) {
    super.model(params, transition);

    const post = POSTS.find((post) => post.id === Number(params.post_id));

    return { ...post, reader: this.modelFor('application').currentUser.name };
  }

  static template = hbs`
    <h1 data-test-title>{{this.model.title}}</h1>
    <p data-test-reader>Read by {{this.model.reader}}</p>
    <p data-test-theme>{{@queryParams.theme}}</p>
    <button type="button" data-test-notify {{on "click" (fn this.send "notify" "from a post")}}>Notify</button>
  `;
}

class SlowRoute extends Route {
  static model() {
    return new Promise((resolve) => (release = () => resolve({ title: 'Finally' })));
  }

  static template = hbs`<h1 data-test-title>{{this.model.title}}</h1>`;
}

class BrokenRoute extends Route {
  static model() {
    throw new Error('The server is down');
  }
}

class LoadingRoute extends Route {
  static template = hbs`<h1 data-test-loading>Loading...</h1>`;
}

class ErrorRoute extends Route {
  static template = hbs`<h1 data-test-error>Something went wrong: {{this.model.message}}</h1>`;
}

module('@emberx/router | The application route', function (hooks) {
  setupTest(hooks, () => {
    return Router.start([
      { name: 'application', route: ApplicationRoute, loadingRoute: LoadingRoute, errorRoute: ErrorRoute },
      { path: '/', name: 'home', route: HomeRoute },
      { path: '/login', name: 'login', route: LoginRoute },
      { path: '/about', name: 'about', route: AboutRoute },
      { path: '/posts', name: 'posts', route: PostsRoute },
      { path: '/posts/:post_id', name: 'posts.post', route: PostRoute },
      { path: '/slow', name: 'slow', route: SlowRoute },
      { path: '/broken', name: 'broken', route: BrokenRoute },
    ]);
  });
  hooks.beforeEach(function () {
    currentUser = { name: 'Izel' };
    notifications = [];
    release = null;
  });

  test('it is above every route, and adds nothing to their names or URLs', async function (assert) {
    const router = this.owner.lookup('service:router');

    await visit('/posts/1');

    assert.deepEqual(
      router.state.routeInfos.map((routeInfo) => routeInfo.name),
      ['application', 'posts', 'posts.post'],
    );
    assert.equal(currentRouteName(), 'posts.post');
    assert.equal(currentURL(), '/posts/1');
    assert.equal(router.urlFor('posts.post', 2), '/posts/2');
  });

  module('its hooks', function (hooks) {
    setupHookSteps(hooks);

    test('run once, on the first visit, and not again while moving between pages', async function (assert) {
      await visit('/posts/1');

      assert.verifySteps([
        'application: beforeModel',
        'application: model',
        'application: afterModel',
        'application: redirect',
        'posts: beforeModel',
        'posts: model',
        'posts: afterModel',
        'posts: redirect',
        'posts.post: beforeModel',
        'posts.post: model',
        'posts.post: afterModel',
        'posts.post: redirect',
        'application: enter',
        'application: setup',
        'posts: enter',
        'posts: setup',
        'posts.post: enter',
        'posts.post: setup',
      ]);

      await visit('/about');
      await visit('/');

      assert.verifySteps(['posts.post: exit', 'posts: exit'], 'only the routes it left: the application route stays');
    });

    test('run again for ApplicationRoute.refresh(), with every route under it', async function (assert) {
      await visit('/posts/1');
      assert.verifySteps([
        'application: beforeModel',
        'application: model',
        'application: afterModel',
        'application: redirect',
        'posts: beforeModel',
        'posts: model',
        'posts: afterModel',
        'posts: redirect',
        'posts.post: beforeModel',
        'posts.post: model',
        'posts.post: afterModel',
        'posts.post: redirect',
        'application: enter',
        'application: setup',
        'posts: enter',
        'posts: setup',
        'posts.post: enter',
        'posts.post: setup',
      ]);

      currentUser = { name: 'Tom' };
      await ApplicationRoute.refresh();
      await waitFor('[data-test-reader]');

      assert.dom('[data-test-reader]').hasText('Read by Tom');
      assert.verifySteps([
        'application: beforeModel',
        'application: model',
        'application: afterModel',
        'application: redirect',
        'posts: beforeModel',
        'posts: model',
        'posts: afterModel',
        'posts: redirect',
        'posts.post: beforeModel',
        'posts.post: model',
        'posts.post: afterModel',
        'posts.post: redirect',
        'application: setup',
        'posts: setup',
        'posts.post: setup',
      ]);
    });
  });

  test('every route reads its model with modelFor("application")', async function (assert) {
    await visit('/posts/2');

    assert.dom('[data-test-title]').hasText('Adventures in Microbenchmarking');
    assert.dom('[data-test-reader]').hasText('Read by Izel');
  });

  test('its beforeModel can send any first visit elsewhere', async function (assert) {
    currentUser = null;

    await visit('/posts/1');

    assert.equal(currentURL(), '/login');
    assert.dom('[data-test-title]').hasText('Login');
  });

  test('any page sends it an action with this.send, and it keeps its state from page to page', async function (assert) {
    await visit('/posts/1');
    await click('[data-test-notify]');
    await visit('/');
    await click('[data-test-notify]');

    assert.deepEqual(notifications, ['from a post (1)', 'from home (2)']);
  });

  test('its query params are the whole app’s', async function (assert) {
    await visit('/posts/1?theme=dark');

    assert.dom('[data-test-theme]').hasText('dark');

    await visit('/about');

    assert.dom('[data-test-theme]').hasText('light', 'its declared default, on every page');
  });

  test('its loadingRoute shows while a page under it loads', async function (assert) {
    await visit('/about');

    const visiting = visit('/slow');

    await waitFor('[data-test-loading]');

    assert.dom('[data-test-loading]').hasText('Loading...');

    release();
    await visiting;

    assert.dom('[data-test-title]').hasText('Finally');
  });

  test('its errorRoute shows when a page under it fails', async function (assert) {
    await visit('/broken');

    assert.dom('[data-test-error]').hasText('Something went wrong: The server is down');
    assert.equal(currentRouteName(), 'error');
  });
});

module('@emberx/router | The application route, when none is declared', function (hooks) {
  setupTest(hooks, () => {
    return Router.start(
      [
        { path: '/about', name: 'about', route: AboutRoute },
        { path: '/admin/reports', name: 'admin.reports', route: SlowRoute },
        { name: 'loading', route: LoadingRoute },
      ],
      function () {
        this.route('admin', function () {
          this.route('reports');
        });
      },
    );
  });
  hooks.beforeEach(function () {
    release = null;
  });

  test('a blank one is above every route, the routes of a Router.map() definition too', async function (assert) {
    const router = this.owner.lookup('service:router');

    await visit('/about');

    assert.deepEqual(
      router.state.routeInfos.map((routeInfo) => routeInfo.name),
      ['application', 'about'],
    );
    assert.dom('[data-test-title]').hasText('About');

    const visiting = visit('/admin/reports');
    await waitFor('[data-test-loading]');
    release();
    await visiting;

    assert.deepEqual(
      router.state.routeInfos.map((routeInfo) => routeInfo.name),
      ['application', 'admin', 'admin.reports'],
    );
  });

  test('a parent route without a class does not keep the app-wide loading route from showing', async function (assert) {
    await visit('/about');

    const visiting = visit('/admin/reports');

    await waitFor('[data-test-loading]');

    assert.dom('[data-test-loading]').hasText('Loading...', 'admin has no class, like the blank application route');

    release();
    await visiting;

    assert.dom('[data-test-title]').hasText('Finally');
  });
});

module('@emberx/router | The application route, declared for its loading and error routes only', function (hooks) {
  setupTest(hooks, () => {
    return Router.start([
      { name: 'application', loadingRoute: LoadingRoute, errorRoute: ErrorRoute },
      { path: '/about', name: 'about', route: AboutRoute },
      { path: '/broken', name: 'broken', route: BrokenRoute },
    ]);
  });

  test('it needs no class of its own: its error route still catches every page', async function (assert) {
    await visit('/about');

    assert.dom('[data-test-title]').hasText('About');

    await visit('/broken');

    assert.dom('[data-test-error]').hasText('Something went wrong: The server is down');
  });
});

module('@emberx/router | Declaring the application route', function () {
  test('it takes no path or indexRoute of its own', function (assert) {
    assert.throws(
      () => Router.start([{ name: 'application', path: '/app', route: ApplicationRoute }]),
      /The application route is above every route and has no path of its own; remove path: '\/app'/,
    );
    assert.throws(
      () => Router.start([{ name: 'application', route: ApplicationRoute, indexRoute: HomeRoute }]),
      /The application route takes no indexRoute; declare the page at "\/" as a route of its own/,
    );
  });

  test('declaring it twice is reported, and the later declaration is the one used', function (assert) {
    class OtherApplicationRoute extends Route {}
    const error = console.error;
    console.error = (message) => assert.step(message);

    try {
      Router.start([
        { name: 'application', route: ApplicationRoute },
        { name: 'application', route: OtherApplicationRoute },
      ]);
    } finally {
      console.error = error;
    }

    assert.strictEqual(Router.owner.routes.application.route, OtherApplicationRoute);
    assert.verifySteps([
      '@emberx/router: The application route is declared twice. The later declaration replaces the earlier one.',
    ]);
  });
});
