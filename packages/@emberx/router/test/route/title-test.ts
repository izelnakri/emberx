import { module, test } from 'qunitx';
import Router, { Route, hbs } from '@emberx/router';
import { visit, setupRenderingTest } from '@emberx/test-helpers';

const POSTS = { 1: { title: 'Compilers are the New Frameworks' } };

class ApplicationRoute extends Route {
  static title = 'Blog';
}

class AboutRoute extends Route {
  static template = hbs`<h1>About</h1>`;
}

class PostRoute extends Route {
  static title(post) {
    return `${post.title} | ${this.name}`;
  }

  static model({ post_id }) {
    if (!POSTS[post_id]) throw new Error(`No post ${post_id}`);

    return POSTS[post_id];
  }

  static template = hbs`<h1>{{this.model.title}}</h1>`;
}

class PostErrorRoute extends Route {
  static title = 'Something went wrong';
  static template = hbs`<h1>{{this.model.message}}</h1>`;
}

module('@emberx/router | Page titles', function (hooks) {
  setupRenderingTest(hooks, () =>
    Router.start([
      { name: 'application', route: ApplicationRoute },
      { path: '/about', route: AboutRoute },
      { path: '/posts/:post_id', route: PostRoute, errorRoute: PostErrorRoute },
    ]),
  );

  test('the deepest route that has a title names the page, a function of its model with the route as `this`', async function (assert) {
    const router = Router.owner.lookup('service:router');

    await visit('/about');
    assert.equal(router.currentTitle, 'Blog', "the application route's, as the about page has none");

    await visit('/posts/1');
    assert.equal(router.currentTitle, 'Compilers are the New Frameworks | PostRoute');
  });

  test("an error substate's title names the page it shows", async function (assert) {
    await visit('/posts/9');

    assert.equal(Router.owner.lookup('service:router').currentTitle, 'Something went wrong');
  });

  test('under test, the document keeps its own title', async function (assert) {
    const title = document.title;

    await visit('/posts/1');

    assert.equal(document.title, title);
  });
});
