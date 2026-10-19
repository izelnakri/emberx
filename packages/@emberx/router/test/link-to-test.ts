import { module, test } from 'qunitx';
import { hbs } from '@emberx/component';
import { render, click, currentURL, visit, waitFor } from '@emberx/test-helpers';
import startRouter from '@examples/blog/start-router.ts';
import { LinkTo } from '@emberx/router';
import setupTest from './helpers/index.ts';
import setupMockServer from './helpers/setup-mock-server.ts';

// TODO: make @replace={{true}} tests
module('@emberx/router | <LinkTo> tests', function (hooks) {
  setupTest(hooks, startRouter);
  setupMockServer(hooks);

  test('it throws when @route param is missing', async function (assert) {
    try {
      await render(hbs`<LinkTo>Something</LinkTo>`, { LinkTo });
    } catch (error) {
      assert.equal(error.message, '<LinkTo /> component missing @route argument');
    }
  });

  test('it works for a basic route without params', async function (assert) {
    await render(hbs`<LinkTo @route="public.index" data-test-link>Something</LinkTo>`, { LinkTo });

    assert.dom('a[href="/"]').hasText('Something');
    assert.equal(currentURL(), undefined);

    await click('[data-test-link]');

    assert.equal(currentURL(), '/');
  });

  test('it works for a route with @model as object', async function (assert) {
    this.blogPost = { slug: '0d469c09-b6f6-4bce-999a-b7b528f86aac' };

    await render(hbs`<LinkTo @route="public.blog-post" @model={{this.blogPost}} data-test-link>Go to post</LinkTo>`, {
      LinkTo,
    });

    assert.dom('a').hasText('Go to post');
    assert.dom('a').hasAttribute('href', '/0d469c09-b6f6-4bce-999a-b7b528f86aac');
    assert.equal(currentURL(), undefined);

    await click('[data-test-link]');

    assert.equal(currentURL(), '/0d469c09-b6f6-4bce-999a-b7b528f86aac');
  });

  test('it works for a route with @model as object helper', async function (assert) {
    await render(
      hbs`<LinkTo @route="public.blog-post" @model={{hash slug="0d469c09-b6f6-4bce-999a-b7b528f86aac"}} data-test-link>Go to post</LinkTo>`,
      {
        LinkTo,
      },
    );

    assert.dom('a').hasText('Go to post');
    assert.dom('a').hasAttribute('href', '/0d469c09-b6f6-4bce-999a-b7b528f86aac');
    assert.equal(currentURL(), undefined);

    await click('[data-test-link]');

    assert.equal(currentURL(), '/0d469c09-b6f6-4bce-999a-b7b528f86aac');
  });

  test('it works for a route with @model as value instead of object', async function (assert) {
    this.blogPost = { slug: '0d469c09-b6f6-4bce-999a-b7b528f86aac' }; // 'public.blog-post' => /:slug

    await render(
      hbs`<LinkTo @route="public.blog-post" @model={{this.blogPost.slug}} data-test-link>Go to post</LinkTo>`,
      {
        LinkTo,
      },
    );

    assert.dom('a').hasText('Go to post');
    assert.dom('a').hasAttribute('href', '/0d469c09-b6f6-4bce-999a-b7b528f86aac');
    assert.equal(currentURL(), undefined);

    await click('[data-test-link]');

    assert.equal(currentURL(), '/0d469c09-b6f6-4bce-999a-b7b528f86aac');
  });

  test('it works for a route with multiple @models as array', async function (assert) {
    this.user = { id: 620, firstName: 'Izel', lastName: 'Nakri' };
    this.post = { id: 22, title: 'Emberx is coming!' };

    this.models = [this.user.id, this.post.id]; // TODO: move this to array

    await render(
      hbs`<LinkTo @route="preview.user.posts.post" @models={{this.models}} data-test-link>Go to post {{this.post.id}}</LinkTo>`,
      { LinkTo },
    );

    assert.dom('a').hasText(`Go to post ${this.post.id}`);
    assert.dom('a').hasAttribute('href', `/preview/${this.user.id}/posts/${this.post.id}`);
    assert.equal(currentURL(), undefined);

    await click('[data-test-link]');

    assert.equal(currentURL(), `/preview/${this.user.id}/posts/${this.post.id}`);
  });

  test('it works for a route with multiple @models as array helper', async function (assert) {
    this.user = { id: 620, firstName: 'Izel', lastName: 'Nakri' };
    this.post = { id: 22, title: 'Emberx is coming!' };

    await render(
      hbs`<LinkTo @route="preview.user.posts.post" @models={{array this.user.id this.post.id}} data-test-link>Go to post {{this.post.id}}</LinkTo>`,
      { LinkTo },
    );

    assert.dom('a').hasText(`Go to post ${this.post.id}`);
    assert.dom('a').hasAttribute('href', `/preview/${this.user.id}/posts/${this.post.id}`);
    assert.equal(currentURL(), undefined);

    await click('[data-test-link]');

    assert.equal(currentURL(), `/preview/${this.user.id}/posts/${this.post.id}`);
  });

  test('a click on what the link holds follows the link', async function (assert) {
    await render(hbs`<LinkTo @route="public.index"><span data-test-label>Home</span></LinkTo>`, { LinkTo });

    await click('[data-test-label]');

    assert.equal(currentURL(), '/');
  });

  test('a click with a modifier key, for a new tab or window, is left to the browser', async function (assert) {
    await render(hbs`<LinkTo @route="public.index" data-test-link>Home</LinkTo>`, { LinkTo });
    let prevented: boolean | undefined;
    // After the link's own listener: notes what it did, and keeps the test page where it is.
    document.addEventListener(
      'click',
      (event) => {
        prevented = event.defaultPrevented;
        event.preventDefault();
      },
      { once: true },
    );

    await click('[data-test-link]', { metaKey: true });

    assert.false(prevented);
    assert.equal(currentURL(), undefined);
  });

  test('the active link says it is the current page, and a disabled one that it is disabled', async function (assert) {
    await visit('/');
    await render(
      hbs`<LinkTo @route="public.index" data-test-home>Home</LinkTo><LinkTo @route="login" @disabled={{true}} data-test-login>Login</LinkTo>`,
      { LinkTo },
    );

    assert.dom('[data-test-home]').hasAttribute('aria-current', 'page');
    assert.dom('[data-test-login]').doesNotHaveAttribute('aria-current');
    assert.dom('[data-test-login]').hasAttribute('aria-disabled', 'true');
    assert.dom('[data-test-home]').doesNotHaveAttribute('aria-disabled');
  });

  test('it can @preventDefault with certain behavior', async function (assert) {
    assert.expect(5);

    this.something = 'something';
    this.testCall = (value) => assert.equal(value, 'something');

    await render(
      hbs`<LinkTo @route='login' {{on "click" (fn this.testCall this.something)}} @preventDefault={{true}} data-test-link>Trigger</LinkTo>`,
      { LinkTo },
    );

    assert.dom('a').hasText('Trigger');
    assert.dom('a').hasAttribute('href', '/login');
    assert.equal(currentURL(), undefined);

    await click('[data-test-link]');

    assert.equal(currentURL(), undefined);
  });

  test('it can have @query argument that appends queryParams to routes', async function (assert) {
    this.blogPost = { slug: '0d469c09-b6f6-4bce-999a-b7b528f86aac' }; // 'public.blog-post' => /:slug

    await render(
      hbs`
      <LinkTo @route="public.blog-post" @model={{this.blogPost.slug}} @query={{hash page=1 per_page=20}} data-test-link>
        Go to post
      </LinkTo>
    `,
      { LinkTo },
    );

    assert.dom('a').hasText('Go to post');
    assert.dom('a').hasAttribute('href', '/0d469c09-b6f6-4bce-999a-b7b528f86aac?page=1&per_page=20');
    assert.equal(currentURL(), undefined);

    await click('[data-test-link]');

    assert.equal(currentURL(), '/0d469c09-b6f6-4bce-999a-b7b528f86aac?page=1&per_page=20');
  });

  module('Complex route generation from dynamic @model', function () {
    test('it works for a route with @model as object', async function (assert) {
      this.user = { id: 620, firstName: 'Izel', lastName: 'Nakri' };

      await render(
        hbs`<LinkTo @route="preview.user" @model={{this.user}} data-test-link>Go to user {{this.user.id}}</LinkTo>`,
        { LinkTo },
      );

      assert.dom('a').hasText(`Go to user ${this.user.id}`);
      assert.dom('a').hasAttribute('href', `/preview/${this.user.id}`);
      assert.equal(currentURL(), undefined);

      await click('[data-test-link]');

      assert.equal(currentURL(), `/preview/${this.user.id}`);
    });

    test('it works for a route with @model as object with camelCased keys and underscored route segment', async function (assert) {
      this.user = { id: 620, userId: 30, firstName: 'Izel', lastName: 'Nakri' };

      await render(
        hbs`<LinkTo @route="preview.user" @model={{this.user}} data-test-link>Go to user {{this.user.userId}}</LinkTo>`,
        { LinkTo },
      );

      assert.dom('a').hasText(`Go to user ${this.user.userId}`);
      assert.dom('a').hasAttribute('href', `/preview/${this.user.userId}`);
      assert.equal(currentURL(), undefined);

      await click('[data-test-link]');

      assert.equal(currentURL(), `/preview/${this.user.userId}`);
    });

    test('it works for a route with @model as object with underscored keys and underscored route segment', async function (assert) {
      this.user = { id: 620, user_id: 30, first_name: 'Izel', last_name: 'Nakri' };

      await render(
        hbs`<LinkTo @route="preview.user" @model={{this.user}} data-test-link>Go to user {{this.user.user_id}}</LinkTo>`,
        { LinkTo },
      );

      assert.dom('a').hasText(`Go to user ${this.user.user_id}`);
      assert.dom('a').hasAttribute('href', `/preview/${this.user.user_id}`);
      assert.equal(currentURL(), undefined);

      await click('[data-test-link]');

      assert.equal(currentURL(), `/preview/${this.user.user_id}`);
    });
  });

  module('<LinkTo/> transition class test', function () {
    test('only active links should have the correct active and loading classes', async function (assert) {
      await visit('/preview/11');

      assert.equal(currentURL(), '/preview/11');

      assert.dom('a.active').exists({ count: 1 });
      assert.dom('a.active').hasText('All users comments');
      assert.dom('a[href="/preview/11?reviewed=true"]').hasNoClass('loading');

      const promise = visit('/preview/12?reviewed=true&status=complete');

      await waitFor('.loading');

      assert.dom('a[href="/preview/12?reviewed=true&status=complete"]').hasClass('loading');

      await promise;

      assert.dom('a[href="/preview/12?reviewed=true&status=complete"]').hasNoClass('loading');
      assert.equal(currentURL(), '/preview/12?reviewed=true&status=complete');

      assert.dom('a.active').exists({ count: 1 });

      assert.dom('a.active').hasText('Last reviewed comments of user 12');
    });

    test('links show the route a transition is leaving and the one it is entering, until it is done', async function (assert) {
      await visit('/preview/11');

      assert.dom('.ember-transitioning-in').doesNotExist();
      assert.dom('.ember-transitioning-out').doesNotExist('an active link at rest is not transitioning out');

      const promise = visit('/preview/12?reviewed=true&status=complete');

      await waitFor('.ember-transitioning-in');

      assert.dom('.ember-transitioning-in').exists({ count: 1 });
      assert.dom('.ember-transitioning-in').hasText('Last reviewed comments of user 12');
      assert.dom('.ember-transitioning-out').exists({ count: 1 });
      assert.dom('.ember-transitioning-out').hasText('All users comments');

      await promise;

      assert.dom('.ember-transitioning-in').doesNotExist();
      assert.dom('.ember-transitioning-out').doesNotExist();
      assert.dom('a.active').hasText('Last reviewed comments of user 12');
    });
  });
});
