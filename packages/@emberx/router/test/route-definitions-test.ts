import { module, test } from 'qunitx';
import Router, { Route, LinkTo, NotFoundRoute as NotFoundPage, hbs } from '@emberx/router';
import { visit, render, currentURL, currentRouteName, setupRenderingTest } from '@emberx/test-helpers';

class HomeRoute extends Route {
  static template = hbs`<h1 data-test-title>Home</h1>`;
}
class PostsRoute extends Route {
  static template = hbs`<h1 data-test-title>Posts</h1>`;
}
class PostRoute extends Route {
  static template = hbs`<h1 data-test-title>Post {{@params.post_id}}</h1>`;
}
class NewCommentRoute extends Route {
  static template = hbs`<h1 data-test-title>New comment on post {{@params.post_id}}</h1>`;
}
class UserRoute extends Route {
  static template = hbs`<h1 data-test-title>User {{@params.userId}}</h1>`;
}
class ReportsRoute extends Route {
  static template = hbs`<h1 data-test-title>Reports</h1>`;
}
class BlogPostsRoute extends Route {
  static template = hbs`<h1 data-test-title>Blog posts</h1>`;
}
class PageRoute extends Route {
  static template = hbs`<h1 data-test-title>Page {{@params.slug}}</h1>`;
}
class NotFoundRoute extends Route {
  static template = hbs`<h1 data-test-title>Nothing here</h1>`;
}

module('@emberx/router | Route definitions', function () {
  module('a name from the path', function (hooks) {
    setupRenderingTest(hooks, () => {
      return Router.start([
        { path: '/', route: HomeRoute },
        { path: '/posts', route: PostsRoute },
        { path: '/posts/:post_id', route: PostRoute },
        { path: '/posts/:post_id/comments/new', route: NewCommentRoute },
        { path: '/users/:userId', route: UserRoute },
        { path: '/admin/reports', route: ReportsRoute },
        { path: '/blog-posts', route: BlogPostsRoute },
        { path: '/pages/:slug', route: PageRoute },
        { path: '/*path', route: NotFoundRoute },
      ]);
    });

    test('a route declared without a name gets one: each path segment is a name segment', function (assert) {
      const routes = Router.owner.routes;

      assert.strictEqual(routes['index'].route, HomeRoute);
      assert.strictEqual(routes['posts'].route, PostsRoute);
      assert.strictEqual(routes['posts.post'].route, PostRoute, 'a dynamic segment loses its _id');
      assert.strictEqual(routes['posts.post.comments.new'].route, NewCommentRoute);
      assert.strictEqual(routes['users.user'].route, UserRoute, 'and its Id');
      assert.strictEqual(routes['admin.reports'].route, ReportsRoute);
      assert.strictEqual(routes['blog-posts'].route, BlogPostsRoute);
      assert.strictEqual(routes['pages.slug'].route, PageRoute);
      assert.strictEqual(routes['not-found'].route, NotFoundRoute, 'a catch-all is the not-found route');
    });

    test('the parent routes a path implies are created without a class', async function (assert) {
      const router = this.owner.lookup('service:router');

      assert.strictEqual(Router.owner.routes['admin'].route, undefined);

      await visit('/admin/reports');

      assert.dom('[data-test-title]').hasText('Reports');
      assert.deepEqual(
        router.state.routeInfos.map((routeInfo) => routeInfo.name),
        ['application', 'admin', 'admin.reports'],
      );
    });

    test('visiting, transitions, urlFor and LinkTo work with the names from paths', async function (assert) {
      const router = this.owner.lookup('service:router');

      await visit('/posts/3/comments/new');

      assert.equal(currentRouteName(), 'posts.post.comments.new');
      assert.dom('[data-test-title]').hasText('New comment on post 3');

      await router.transitionTo('users.user', 7);
      await visit('/pages/about-us');

      assert.dom('[data-test-title]').hasText('Page about-us');
      assert.equal(router.urlFor('posts.post', 2), '/posts/2');
      assert.equal(router.urlFor('index'), '/');

      await render(hbs`<LinkTo @route="users.user" @model={{7}} data-test-link>User 7</LinkTo>`, { LinkTo });

      assert.dom('[data-test-link]').hasAttribute('href', '/users/7');
    });

    test('a URL no route matches goes to the catch-all route', async function (assert) {
      await visit('/nowhere/at/all');

      assert.equal(currentRouteName(), 'not-found');
      assert.equal(currentURL(), '/nowhere/at/all');
      assert.dom('[data-test-title]').hasText('Nothing here');
    });
  });

  module('a route loaded when it is first entered', function (hooks) {
    const imports: string[] = [];
    // What `() => import('./routes/posts.ts')` returns, counted.
    const load = (name: string, RouteClass: typeof Route) => () => {
      imports.push(name);
      return Promise.resolve({ default: RouteClass });
    };
    const loadPosts = load('posts', PostsRoute);
    const loadPost = load('post', PostRoute);

    setupRenderingTest(hooks, () => {
      imports.length = 0;
      return Router.start([
        { path: '/', route: HomeRoute },
        { path: '/posts', route: loadPosts },
        { path: '/posts/:post_id', route: loadPost },
      ]);
    });

    test('is imported on its first visit, once, and its class then takes its place', async function (assert) {
      assert.deepEqual(imports, [], 'nothing is imported when the router starts');

      await visit('/posts');
      assert.dom('[data-test-title]').hasText('Posts');
      assert.deepEqual(imports, ['posts']);
      assert.strictEqual(Router.owner.routes['posts'].route, PostsRoute);

      await visit('/');
      await visit('/posts/2');
      await visit('/posts');
      assert.dom('[data-test-title]').hasText('Posts');
      assert.deepEqual(imports, ['posts', 'post'], 'each route is imported once');
    });

    test('a link to it has its URL before it is imported', async function (assert) {
      await render(hbs`<LinkTo @route="posts.post" @model={{3}} data-test-link>Post 3</LinkTo>`, { LinkTo });

      assert.dom('[data-test-link]').hasAttribute('href', '/posts/3');
      assert.deepEqual(imports, []);
    });
  });

  module('a route that is its own indexRoute', function (hooks) {
    let pages = 0;
    class UserRoute extends Route {
      static template = hbs`<h1 data-test-title>User {{@params.user_id}}</h1>`;

      constructor(owner: object, args: object) {
        super(owner, args);
        pages++;
      }
    }

    setupRenderingTest(hooks, () => {
      pages = 0;
      return Router.start([{ path: '/users/:user_id', route: UserRoute, indexRoute: UserRoute }]);
    });

    test('renders its page once a transition', async function (assert) {
      await visit('/users/1');

      assert.dom('[data-test-title]').hasText('User 1');
      assert.equal(pages, 1);
    });
  });

  module('without a catch-all', function (hooks) {
    setupRenderingTest(hooks, () => Router.start([{ path: '/', route: HomeRoute }]));

    test('a URL no route matches shows the page NotFoundRoute renders', async function (assert) {
      await visit('/nowhere/at/all');

      assert.equal(currentRouteName(), 'not-found');
      assert.strictEqual(Router.owner.routes['not-found'].route, NotFoundPage);
      assert.dom('[data-test-not-found] h1').hasText('Page not found');
      assert.dom('[data-test-not-found] p').hasText('There is no page at /nowhere/at/all.');
      assert.equal(this.owner.lookup('service:router').currentTitle, 'Page not found');
    });
  });

  module('without a catch-all, with resolve', function (hooks) {
    class AppNotFoundRoute extends NotFoundPage {
      static template = hbs`<h1 data-test-title>Lost? Try the home page.</h1>`;
    }

    setupRenderingTest(hooks, () =>
      Router.start([{ path: '/', route: HomeRoute }], {
        resolve: (name) => (name === 'not-found' ? { default: AppNotFoundRoute } : undefined),
      }),
    );

    test('the not-found route it finds replaces NotFoundRoute', async function (assert) {
      await visit('/nowhere');

      assert.dom('[data-test-title]').hasText('Lost? Try the home page.');
      assert.equal(this.owner.lookup('service:router').currentTitle, 'Page not found', 'its title is inherited');
    });
  });

  module('a name given', function (hooks) {
    setupRenderingTest(hooks);

    test('a name in the definition is used instead of the one from its path', function (assert) {
      Router.start([{ path: '/articles/:id', name: 'posts.post', route: PostRoute }]);

      assert.strictEqual(Router.owner.routes['posts.post'].route, PostRoute);
      assert.notOk(Router.owner.routes['articles.id'], 'no route named after the path');
    });
  });

  module('a route declared twice', function (hooks) {
    setupRenderingTest(hooks);

    test('the same name twice is reported, and the later declaration is the one used', function (assert) {
      const errors = consoleErrorsOf(() =>
        Router.start([
          { path: '/posts', name: 'posts', route: PostsRoute },
          { path: '/articles', name: 'posts', route: BlogPostsRoute },
        ]),
      );

      assert.deepEqual(errors, [
        '@emberx/router: The route "posts" is declared twice, at "/posts" and at "/articles". The later declaration replaces the earlier one.',
      ]);
      assert.strictEqual(Router.owner.routes['posts'].route, BlogPostsRoute);
    });

    test('the same path twice, with names from it, is reported', function (assert) {
      const errors = consoleErrorsOf(() =>
        Router.start([
          { path: '/posts', route: PostsRoute },
          { path: '/posts', route: BlogPostsRoute },
        ]),
      );

      assert.deepEqual(errors, [
        '@emberx/router: The route "posts" is declared twice, at "/posts". The later declaration replaces the earlier one.',
      ]);
    });

    test('one path under two names is reported: only one of them could be visited', function (assert) {
      const errors = consoleErrorsOf(() =>
        Router.start([
          { path: '/posts', name: 'posts', route: PostsRoute },
          { path: '/posts/', name: 'articles', route: BlogPostsRoute },
        ]),
      );

      assert.deepEqual(errors, [
        '@emberx/router: "/posts" is the path of both "posts" and "articles", so only one of them can be visited. Give each route its own path.',
      ]);
    });

    test('a child declared before its parent, or a Router.map() route given its class, is no duplicate', function (assert) {
      const errors = consoleErrorsOf(() => {
        Router.start([
          { path: '/posts/:post_id', route: PostRoute },
          { path: '/posts', route: PostsRoute },
        ]);
        Router.start([{ path: '/admin/reports', name: 'admin.reports', route: ReportsRoute }], function () {
          this.route('admin', function () {
            this.route('reports');
          });
        });
      });

      assert.deepEqual(errors, []);
      assert.strictEqual(Router.owner.routes['admin.reports'].route, ReportsRoute);
    });
  });
});

/** Runs `callback` and returns what it logged with console.error. */
function consoleErrorsOf(callback: () => void): string[] {
  const errors: string[] = [];
  const error = console.error;
  console.error = (message) => errors.push(message);

  try {
    callback();
  } finally {
    console.error = error;
  }

  return errors;
}
