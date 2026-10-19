import { resetRendering } from '@emberx/component';
import Router, { Route, hbs, service } from '@emberx/router';
import { renderURLToString } from '@emberx/ssr';
import { module, test } from 'qunitx';

const POSTS = {
  1: { title: 'Compilers are the New Frameworks' },
  2: { title: 'Adventures in Microbenchmarking' },
};

class HomeRoute extends Route {
  static template = hbs`<h1>Home</h1>`;
}

class PostRoute extends Route {
  static async model({ post_id }) {
    await new Promise((resolve) => setTimeout(resolve, 5));
    if (!POSTS[post_id]) throw new Error(`No post ${post_id}`);

    return POSTS[post_id];
  }

  static template = hbs`<h1>{{this.model.title}}</h1><p>Post {{@params.post_id}}</p>`;
}

class OldPostRoute extends Route {
  static beforeModel() {
    return this.router.transitionTo('/posts/1');
  }
}

// Reads the session of the request it renders for, in its model hook and in its template.
class AccountRoute extends Route {
  @service session;

  static async model() {
    await new Promise((resolve) => setTimeout(resolve, this.session.delay));

    return { greeting: `Hello ${this.session.user}` };
  }

  static template = hbs`<h1>{{this.model.greeting}}</h1><p>{{this.session.user}}'s account</p>`;
}

class PostErrorRoute extends Route {
  static template = hbs`<h1>Something went wrong: {{this.model.message}}</h1>`;
}

module('@emberx/ssr | renderURLToString', function (hooks) {
  hooks.beforeEach(function () {
    Router.LOG_ROUTES = false;
    Router.LOG_MODELS = false;
    startRouter();
  });
  hooks.afterEach(function () {
    Router.reset();
    resetRendering();
  });

  test('renders the page a URL shows, after its model hooks', async function (assert) {
    const html = await renderURLToString('/posts/1', { hydratable: false });

    assert.equal(html, '<h1>Compilers are the New Frameworks</h1><p>Post 1</p>');
  });

  test('follows redirects to the page they end on', async function (assert) {
    assert.equal(
      await renderURLToString('/old-post', { hydratable: false }),
      '<h1>Compilers are the New Frameworks</h1><p>Post 1</p>',
    );
  });

  test('renders the error substate a failed model hook ends on', async function (assert) {
    assert.equal(
      await renderURLToString('/posts/9', { hydratable: false }),
      '<h1>Something went wrong: No post 9</h1>',
    );
  });

  test('renders URLs requested at once together, each to its own page', async function (assert) {
    const finished: string[] = [];
    const render = (url: string) =>
      renderURLToString(url, { hydratable: false }).then((html) => {
        finished.push(url);
        return html;
      });
    const pages = await Promise.all([render('/posts/1'), render('/'), render('/posts/2')]);

    assert.deepEqual(pages, [
      '<h1>Compilers are the New Frameworks</h1><p>Post 1</p>',
      '<h1>Home</h1>',
      '<h1>Adventures in Microbenchmarking</h1><p>Post 2</p>',
    ]);
    assert.equal(finished[0], '/', 'the page with no model to wait for is not held up by the ones before it');
  });

  test("each render's routes and pages find the services it was given", async function (assert) {
    const pages = await Promise.all([
      renderURLToString('/account', { hydratable: false, services: { session: { user: 'Ada', delay: 10 } } }),
      renderURLToString('/account', { hydratable: false, services: { session: { user: 'Grace', delay: 0 } } }),
    ]);

    assert.deepEqual(pages, ["<h1>Hello Ada</h1><p>Ada's account</p>", "<h1>Hello Grace</h1><p>Grace's account</p>"]);
  });

  test("the router Router.start() started is left as it was, the app's services with it", async function (assert) {
    const router = Router.owner.lookup('service:router');
    Router.addServices({ session: { user: 'Visitor', delay: 0 } });

    await renderURLToString('/account', { services: { session: { user: 'Ada', delay: 0 } } });

    assert.strictEqual(Router.owner.lookup('service:router'), router);
    assert.equal(Router.owner.lookup('service:session').user, 'Visitor');
    assert.equal(router.currentURL, undefined, 'it went nowhere');
  });

  test("the router's first render in a browser hydrates the page it rendered", async function (assert) {
    const html = await renderURLToString('/posts/2');
    // The page's container, as a browser receives it: created here unless a
    // test setup already made one with the id the router renders into.
    const router = Router.owner.lookup('service:router');
    const id = router.testing ? 'ember-testing' : 'app';
    const existing = document.getElementById(id);
    const element = existing ?? document.body.appendChild(Object.assign(document.createElement('div'), { id }));
    element.innerHTML = html;
    const heading = element.querySelector('h1');

    // The browser's own router, started on the page the server sent.
    startRouter();
    await Router.visit('/posts/2');

    assert.strictEqual(element.querySelector('h1'), heading, 'the same node, not a new one');
    assert.equal(heading!.textContent, 'Adventures in Microbenchmarking');
    assert.notOk(element.innerHTML.includes('%+b'), 'the markers are gone');
    // A container the page had already is torn down with the router; clearing
    // it here would remove nodes Ember's teardown still means to remove.
    if (!existing) element.remove();
  });

  test('needs a started router', async function (assert) {
    Router.reset();

    await assert.rejects(renderURLToString('/'), /needs Router.start\(\) to have started a router first/);
  });
});

/** The app's router, started the same way on the server and in the browser. */
function startRouter() {
  return Router.start(
    [
      { path: '/', route: HomeRoute },
      { path: '/posts/:post_id', route: PostRoute, errorRoute: PostErrorRoute },
      { path: '/old-post', route: OldPostRoute },
      { path: '/account', route: AccountRoute },
    ],
    { location: 'none' },
  );
}
