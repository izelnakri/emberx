import { module, test } from 'qunitx';
import Router, { Route, hbs } from '@emberx/router';
import { visit, currentURL, currentRouteName, settled } from '@emberx/test-helpers';
import setupTest from './helpers/index.ts';

class HomeRoute extends Route {
  static template = hbs`<h1 data-test-title>Home</h1>`;
}

class PostsRoute extends Route {
  static template = hbs`<h1 data-test-title>Posts, page {{@queryParams.page}}</h1>`;
}

class PostRoute extends Route {
  static model({ post_id }) {
    return { title: `Post ${post_id}` };
  }

  static template = hbs`<h1 data-test-title>{{this.model.title}}</h1>`;
}

module('@emberx/router | Back and forward buttons', function (hooks) {
  let pageURL: string;

  hooks.beforeEach(function () {
    pageURL = `${location.pathname}${location.search}${location.hash}`;
    // A router under test leaves the address bar alone, so it starts from the
    // test page's own URL; going back to `/` is only a change from elsewhere.
    window.history.replaceState(null, '', '/tests');
  });
  hooks.afterEach(function () {
    window.history.replaceState(window.history.state, '', pageURL);
  });
  setupTest(hooks, startRouter);

  test('going back and forward renders the route the browser went to', async function (assert) {
    await visit('/');
    await visit('/posts/1');

    await goThroughHistoryTo('/');

    assert.equal(currentURL(), '/');
    assert.equal(currentRouteName(), 'home');
    assert.dom('[data-test-title]').hasText('Home');

    await goThroughHistoryTo('/posts/1');

    assert.equal(currentURL(), '/posts/1');
    assert.equal(currentRouteName(), 'posts.post');
    assert.dom('[data-test-title]').hasText('Post 1');
  });

  test('the routes get the params and query params of the URL the browser went to', async function (assert) {
    await visit('/posts/1');

    await goThroughHistoryTo('/posts?page=2');

    assert.dom('[data-test-title]').hasText('Posts, page 2');

    await goThroughHistoryTo('/posts/7');

    assert.dom('[data-test-title]').hasText('Post 7');
  });

  test('the browser already shows the URL, so the router does not change it again', async function (assert) {
    const router = this.owner.lookup('service:router');

    await visit('/posts/1');

    for (const method of ['updateURL', 'replaceURL']) {
      const original = router[method];
      router[method] = function (url) {
        assert.step(`${method} ${url}`);

        return original.call(this, url);
      };
    }

    await goThroughHistoryTo('/posts/2');

    assert.equal(currentURL(), '/posts/2');
    assert.verifySteps([], 'no history entry is added or replaced');
  });

  test('only the router started last follows the browser', async function (assert) {
    const firstRouter = this.owner.lookup('service:router');
    const handleURL = firstRouter.handleURL;
    firstRouter.handleURL = function (url) {
      assert.step(`first router: ${url}`);

      return handleURL.call(this, url);
    };

    this.Router = startRouter();
    await visit('/');
    await goThroughHistoryTo('/posts/3');

    assert.notStrictEqual(this.owner.lookup('service:router'), firstRouter);
    assert.dom('[data-test-title]').hasText('Post 3');
    assert.verifySteps([], 'the router it replaced stopped listening');
  });
});

function startRouter() {
  return Router.start([
    { path: '/', name: 'home', route: HomeRoute },
    { path: '/posts', name: 'posts', route: PostsRoute },
    { path: '/posts/:post_id', name: 'posts.post', route: PostRoute },
  ]);
}

/**
 * What the browser does on back or forward: the URL changes first, then
 * popstate fires. Tests never push history entries, so the URL is set by hand.
 */
async function goThroughHistoryTo(url: string) {
  window.history.replaceState(null, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));

  await Router.owner.lookup('service:router').activeTransition?.followRedirects();
  await settled();
}
