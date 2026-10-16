import { module, test } from 'qunitx';
import Router, { Route, hbs, action, service, tracked } from '@emberx/router';
import { visit, click, fillIn, currentURL, wait } from '@emberx/test-helpers';
import setupTest from '../helpers/index.ts';
import { setupHookSteps, step } from '../helpers/routes/logged-route.ts';

const POSTS = [
  { id: 1, title: 'Compilers are the New Frameworks' },
  { id: 2, title: 'Adventures in Microbenchmarking' },
];

// What pages all over the app do the same way lives in a service.
class Sharing {
  share(post, medium) {
    step(`sharing service: "${post.title}" on ${medium}`);
  }
}

class AboutRoute extends Route {
  static template = hbs`<h1 data-test-title>About</h1>`;
}

// The grandparent: what every page of the blog can send it.
class BlogRoute extends Route {
  static model() {
    return { name: 'The emberx blog' };
  }

  @action
  subscribe(email) {
    step(`blog: subscribed ${email} to ${this.model.name}`);
  }

  @action
  share(post, medium) {
    step(`blog: shared "${post.title}" by ${medium}`);
  }
}

// The parent: shares on Mastodon itself, and leaves every other medium to the blog.
class PostsRoute extends Route {
  @tracked shares = 0;

  static model() {
    return POSTS;
  }

  @action
  share(post, medium) {
    if (medium !== 'mastodon') {
      return true;
    }

    this.shares++;
    step(`posts: shared "${post.title}" on mastodon (${this.shares} so far)`);
  }

  @action
  willTransition(transition) {
    step(`posts: leaving for ${transition.targetName}`);
  }
}

// What /blog/posts shows. It has no actions of its own: it sends them up.
class PostsIndexRoute extends Route {
  static model() {
    return this.modelFor('blog.posts');
  }

  get firstPost() {
    return this.model[0];
  }

  static template = hbs`
    <h1 data-test-title>Posts</h1>

    <button type="button" data-test-mastodon {{on "click" (fn this.send "share" this.firstPost "mastodon")}}>Mastodon</button>
    <button type="button" data-test-email {{on "click" (fn this.send "share" this.firstPost "email")}}>Email</button>
    <button type="button" data-test-subscribe {{on "click" (fn this.send "subscribe" "reader@example.com")}}>Subscribe</button>
  `;
}

// A page made of its own template only: no components.
class PostRoute extends Route {
  @service sharing;

  @tracked isLiked = false;
  @tracked draft = '';

  static model({ post_id }) {
    return POSTS.find((post) => post.id === Number(post_id));
  }

  @action
  toggleLike() {
    this.isLiked = !this.isLiked;
  }

  @action
  updateDraft(event) {
    this.draft = event.target.value;
  }

  @action
  async saveComment() {
    await wait(20);
    step(`post: saved "${this.draft}"`);
    this.draft = '';
  }

  @action
  shareWith(medium) {
    this.sharing.share(this.model, medium);
  }

  @action
  willTransition(transition) {
    step(`post: leaving for ${transition.targetName}`);

    if (this.draft) {
      transition.abort();
    }
  }

  static template = hbs`
    <h1 data-test-title>{{this.model.title}}</h1>

    <button type="button" data-test-like {{on "click" this.toggleLike}}>{{if this.isLiked "Liked" "Like"}}</button>
    <textarea data-test-draft value={{this.draft}} {{on "input" this.updateDraft}}></textarea>
    <button type="button" data-test-save {{on "click" this.saveComment}}>Comment</button>
    <button type="button" data-test-share {{on "click" (fn this.shareWith "mastodon")}}>Share</button>
    <button type="button" data-test-subscribe {{on "click" (fn this.send "subscribe" "reader@example.com")}}>Subscribe</button>
  `;
}

// Written the Ember way: none of these methods is called by the emberx router.
class EmberStyleRoute extends Route {
  @action
  error() {}

  @action
  loading() {}

  didTransition() {}
}

module('@emberx/router | Actions on a page', function (hooks) {
  setupTest(hooks, () => {
    Router.addServices({ sharing: new Sharing() });

    return Router.start([
      { path: '/about', name: 'about', route: AboutRoute },
      { path: '/blog', name: 'blog', route: BlogRoute },
      { path: '/blog/posts', name: 'blog.posts', route: PostsRoute, indexRoute: PostsIndexRoute },
      { path: '/blog/posts/:post_id', name: 'blog.posts.post', route: PostRoute },
      { path: '/ember-style', name: 'ember-style', route: EmberStyleRoute },
    ]);
  });
  setupHookSteps(hooks);

  module("the page's own actions", function () {
    test('a page changes what it shows with @action methods and @tracked fields of its route', async function (assert) {
      await visit('/blog/posts/1');

      assert.dom('[data-test-like]').hasText('Like');

      await click('[data-test-like]');

      assert.dom('[data-test-like]').hasText('Liked');
    });

    test('click() waits for an async page action to finish', async function (assert) {
      await visit('/blog/posts/1');
      await fillIn('[data-test-draft]', 'Great post');
      await click('[data-test-save]');

      assert.verifySteps(['post: saved "Great post"']);
      assert.dom('[data-test-draft]').hasValue('');
    });

    test('a page action reaches what pages all over the app share through a service', async function (assert) {
      await visit('/blog/posts/2');
      await click('[data-test-share]');

      assert.verifySteps(['sharing service: "Adventures in Microbenchmarking" on mastodon']);
    });
  });

  module('actions sent to the routes above a page', function () {
    test('an index page sends an action to its parent route', async function (assert) {
      await visit('/blog/posts');
      await click('[data-test-mastodon]');

      assert.verifySteps(['posts: shared "Compilers are the New Frameworks" on mastodon (1 so far)']);
    });

    test('a parent that returns true passes the action on to its own parent', async function (assert) {
      await visit('/blog/posts');
      await click('[data-test-email]');

      assert.verifySteps(['blog: shared "Compilers are the New Frameworks" by email']);
    });

    test('a route without the action is skipped: it reaches the nearest route above that has it', async function (assert) {
      await visit('/blog/posts');
      await click('[data-test-subscribe]');

      await visit('/blog/posts/2');
      await click('[data-test-subscribe]');

      assert.verifySteps([
        'blog: subscribed reader@example.com to The emberx blog',
        'posts: leaving for blog.posts.post',
        'blog: subscribed reader@example.com to The emberx blog',
      ]);
    });

    test('a route above the page keeps its state across the pages under it, and starts afresh once entered again', async function (assert) {
      await visit('/blog/posts');
      await click('[data-test-mastodon]');
      await click('[data-test-mastodon]');

      await visit('/blog/posts/2');
      this.owner.lookup('service:router').send('share', POSTS[1], 'mastodon');

      await visit('/about');
      await visit('/blog/posts');
      await click('[data-test-mastodon]');

      assert.verifySteps([
        'posts: shared "Compilers are the New Frameworks" on mastodon (1 so far)',
        'posts: shared "Compilers are the New Frameworks" on mastodon (2 so far)',
        'posts: leaving for blog.posts.post',
        'posts: shared "Adventures in Microbenchmarking" on mastodon (3 so far)',
        'post: leaving for about',
        'posts: shared "Compilers are the New Frameworks" on mastodon (1 so far)',
      ]);
    });

    test('router.send sends an action from anywhere, and returns what the action that handled it returned', async function (assert) {
      const router = this.owner.lookup('service:router');

      await visit('/blog/posts');

      assert.strictEqual(router.send('share', POSTS[1], 'mastodon'), undefined);
      assert.throws(() => router.send('print'), /Nothing handles the action 'print'/);
      assert.verifySteps(['posts: shared "Adventures in Microbenchmarking" on mastodon (1 so far)']);
    });
  });

  module('willTransition', function () {
    test('the page on screen hears willTransition before the router leaves it', async function (assert) {
      await visit('/blog/posts/1');
      await visit('/blog/posts');

      assert.equal(currentURL(), '/blog/posts');
      assert.verifySteps(['post: leaving for blog.posts.index'], 'the page handled it, so it went no further');
    });

    test('willTransition reaches the routes above a page that has none of its own', async function (assert) {
      await visit('/blog/posts');
      await visit('/about');

      assert.verifySteps(['posts: leaving for about']);
    });

    test('willTransition can abort the transition, to keep unsaved changes', async function (assert) {
      await visit('/blog/posts/1');
      await fillIn('[data-test-draft]', 'Half written');

      await assert.rejects(visit('/blog/posts'), /TransitionAborted/);

      assert.equal(currentURL(), '/blog/posts/1');
      assert.dom('[data-test-draft]').hasValue('Half written', 'the page and its draft are still there');

      await click('[data-test-save]');
      await visit('/blog/posts');

      assert.equal(currentURL(), '/blog/posts');
      assert.verifySteps([
        'post: leaving for blog.posts.index',
        'post: saved "Half written"',
        'post: leaving for blog.posts.index',
      ]);
    });
  });

  test('a route class reads the model of an active route between transitions with modelFor', async function (assert) {
    await visit('/blog/posts/1');

    assert.deepEqual(PostRoute.modelFor('blog.posts'), POSTS);
    assert.deepEqual(PostRoute.modelFor('blog.posts.post'), POSTS[0]);
  });

  test('a route with Ember route methods gets a warning for each, once', async function (assert) {
    const warn = console.warn;
    console.warn = (message) => assert.step(message);

    try {
      await visit('/ember-style');
      await visit('/about');
      await visit('/ember-style');
    } finally {
      console.warn = warn;
    }

    assert.verifySteps([
      '@emberx/router: EmberStyleRoute has an "error" method, which the router does not call. Instead, catch the error in its model hooks, or declare an errorRoute.',
      '@emberx/router: EmberStyleRoute has a "loading" method, which the router does not call. Instead, declare a loadingRoute, or time transitions with router.on(\'routeWillChange\').',
      "@emberx/router: EmberStyleRoute has a \"didTransition\" method, which the router does not call. Instead, use router.on('routeDidChange'), or the page's constructor.",
    ]);
  });
});
