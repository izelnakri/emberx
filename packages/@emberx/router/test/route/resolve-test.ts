import { module, test } from 'qunitx';
import Router, { Route, hbs } from '@emberx/router';
import { visit, currentURL, currentRouteName, waitFor, setupRenderingTest } from '@emberx/test-helpers';

// Settles the slow route's model, for the loading tests.
let release: (() => void) | null = null;

class PostsRoute extends Route {
  static template = hbs`<h1 data-test-title>Posts</h1>`;
}

class PostsIndexRoute extends Route {
  static template = hbs`<h1 data-test-title>Every post</h1>`;
}

class PostRoute extends Route {
  static model({ post_id }) {
    return new Promise((resolve) => (release = () => resolve({ id: post_id })));
  }

  static template = hbs`<h1 data-test-title>Post {{this.model.id}}</h1>`;
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

class AboutRoute extends Route {
  static template = hbs`<h1 data-test-title>About</h1>`;
}

class LoadingRoute extends Route {
  static template = hbs`<h1 data-test-loading>Loading...</h1>`;
}

class PostsLoadingRoute extends Route {
  static template = hbs`<h1 data-test-loading>Loading a post...</h1>`;
}

class ErrorRoute extends Route {
  static template = hbs`<h1 data-test-error>Something went wrong: {{this.model.message}}</h1>`;
}

class DeclaredLoadingRoute extends Route {
  static template = hbs`<h1 data-test-loading>Declared loading</h1>`;
}

// Route modules by file name, as `import.meta.glob('./routes/**/*.ts', { eager: true })` returns them.
const MODULES = {
  './routes/posts.ts': { default: PostsRoute },
  './routes/posts/index.ts': { default: PostsIndexRoute },
  './routes/posts/post.ts': { default: PostRoute },
  './routes/posts/loading.ts': { default: PostsLoadingRoute },
  './routes/slow_loading.ts': { default: LoadingRoute },
  './routes/broken_error.ts': { default: ErrorRoute },
  './routes/error.ts': { default: ErrorRoute },
};

module('@emberx/router | Routes found by name, with resolve', function (hooks) {
  hooks.beforeEach(function () {
    release = null;
  });

  module('a Router.map() definition', function (hooks) {
    setupRenderingTest(hooks, () => {
      return Router.start(
        [],
        function () {
          this.route('posts', function () {
            this.route('post', { path: '/:post_id' });
          });
        },
        { resolve },
      );
    });

    test('its routes, index routes included, get their classes from resolve', async function (assert) {
      await visit('/posts');

      assert.equal(currentRouteName(), 'posts.index');
      assert.dom('[data-test-title]').hasText('Every post');
      assert.strictEqual(Router.owner.routes['posts'].route, PostsRoute);
    });

    test("a parent's <name>.loading is found, and shows while a route under it loads", async function (assert) {
      await visit('/posts');

      const visiting = visit('/posts/7');
      await waitFor('[data-test-loading]');

      assert.dom('[data-test-loading]').hasText('Loading a post...');

      release!();
      await visiting;

      assert.equal(currentURL(), '/posts/7');
      assert.dom('[data-test-title]').hasText('Post 7');
    });
  });

  module('a Router.map() definition, its routes imported as a lazy glob finds them', function (hooks) {
    // `import.meta.glob('./routes/**/*.ts')`, without `eager`: a function that imports each module.
    const LAZY_MODULES = Object.fromEntries(
      Object.entries(MODULES).map(([path, module]) => [path, () => Promise.resolve(module)]),
    );

    setupRenderingTest(hooks, () => {
      return Router.start(
        [],
        function () {
          this.route('posts', function () {
            this.route('post', { path: '/:post_id' });
          });
        },
        { resolve: (name) => LAZY_MODULES[`./routes/${name.replaceAll('.', '/')}.ts`] },
      );
    });

    test('its routes are imported as they are entered', async function (assert) {
      assert.strictEqual(typeof Router.owner.routes['posts'].route, 'function');
      assert.notStrictEqual(Router.owner.routes['posts'].route, PostsRoute, 'not imported yet');

      await visit('/posts');

      assert.equal(currentRouteName(), 'posts.index');
      assert.dom('[data-test-title]').hasText('Every post');
      assert.strictEqual(Router.owner.routes['posts'].route, PostsRoute);
    });
  });

  module('route definitions', function (hooks) {
    setupRenderingTest(hooks, () => {
      return Router.start(
        [
          { path: '/slow', route: SlowRoute },
          { path: '/broken', route: BrokenRoute },
          { path: '/about', route: AboutRoute },
        ],
        { resolve },
      );
    });

    test("a route's <name>_loading is found, and shows while it loads", async function (assert) {
      await visit('/about');

      const visiting = visit('/slow');
      await waitFor('[data-test-loading]');

      assert.dom('[data-test-loading]').hasText('Loading...');

      release!();
      await visiting;

      assert.dom('[data-test-title]').hasText('Finally');
    });

    test("a route's <name>_error is found, and shows when it fails", async function (assert) {
      await visit('/broken');

      assert.equal(currentRouteName(), 'broken_error');
      assert.dom('[data-test-error]').hasText('Something went wrong: The server is down');
    });

    test('a leaf route gets no <name>.loading child, so its URLs stay its own', function (assert) {
      assert.notOk(Router.owner.routes['about.loading'], 'no child substate');
      assert.notOk(Router.owner.routes['about.index'], 'and no index route that one would bring');
      assert.ok(Router.owner.routes['error'].route, 'the top-level error substate is found');
    });
  });

  module('a declaration and resolve for the same route', function (hooks) {
    let errors: unknown[] = [];

    setupRenderingTest(hooks, () => {
      errors = [];
      const consoleError = console.error;
      console.error = (message) => errors.push(message);

      try {
        return Router.start(
          [
            { path: '/about', route: AboutRoute },
            { path: '/slow', route: SlowRoute, loadingRoute: DeclaredLoadingRoute },
          ],
          { resolve },
        );
      } finally {
        console.error = consoleError;
      }
    });

    test('the declaration wins, and nothing is reported', async function (assert) {
      await visit('/about');

      const visiting = visit('/slow');
      await waitFor('[data-test-loading]');

      assert.dom('[data-test-loading]').hasText('Declared loading');
      assert.deepEqual(errors, []);

      release!();
      await visiting;
    });
  });
});

function resolve(name: string) {
  return MODULES[`./routes/${name.replaceAll('.', '/')}.ts`];
}
