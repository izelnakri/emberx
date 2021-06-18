import { module, test } from 'qunitx';
import { hbs } from '@emberx/component';
import { render, click, currentURL } from '@emberx/test-helpers';
import startApplication from '../../../../examples/blog/router';
import { LinkTo } from '@emberx/router';
import setupTest from './helpers/index';

// NOTE: in future also check against currentURL(), spy on this.router.recognizer.generate with right params
// TODO: also test with different @tagName for td's
// TODO: check preventDefault argument
module('@emberx/router | <LinkTo> tests', function (hooks) {
  setupTest(hooks, startApplication);

  test('it throws when @route param is missing', async function (assert) {
    try {
      await render(hbs`<LinkTo>Something</LinkTo>`, { LinkTo });
    } catch (error) {
      assert.equal(error.message, '<LinkTo /> component missing @route argument');
    }
  });

  test('it works for a basic route without params', async function (assert) {
    await render(hbs`<LinkTo @route="public.index">Something</LinkTo>`, { LinkTo });

    assert.dom('a[href="/"]').hasText('Something');
  });

  test('it works for a route with @model as object', async function (assert) {
    this.blogPost = { slug: '0d469c09-b6f6-4bce-999a-b7b528f86aac' }; // 'public.blog-post' => /:slug

    await render(hbs`<LinkTo @route="public.blog-post" @model={{this.blogPost}}>Go to post</LinkTo>`, {
      LinkTo,
    });

    assert.dom('a').hasText('Go to post');
    assert.dom('a').hasAttribute('href', '/0d469c09-b6f6-4bce-999a-b7b528f86aac');
    // NOTE: should I test for string manipulation for ':blog_id', ':confirmation_token'
    // TODO: assert against the url
  });

  test('it works for a rout with @model as value instead of object', async function (assert) {
    this.blogPost = { slug: '0d469c09-b6f6-4bce-999a-b7b528f86aac' }; // 'public.blog-post' => /:slug

    await render(hbs`<LinkTo @route="public.blog-post" @model={{this.blogPost.slug}}>Go to post</LinkTo>`, {
      LinkTo,
    });

    assert.dom('a').hasText('Go to post');
    assert.dom('a').hasAttribute('href', '/0d469c09-b6f6-4bce-999a-b7b528f86aac');

    // TODO: assert against the url
  });

  // test('it works for a route with @model as object with camelCased keys and underscored route segment', async function (assert) {

  // });

  test('it works for a route with multiple @models', async function (assert) {
    this.user = { id: 620, firstName: 'Izel', lastName: 'Nakri' };
    this.post = { id: 22, title: 'Emberx is coming!' };

    this.models = [this.user.id, this.post.id]; // TODO: move this to array

    await render(
      hbs`<LinkTo @route="preview.user.posts.post" @models={{this.models}}>Go to post {{this.post.id}}</LinkTo>`,
      { LinkTo }
    );

    assert.dom('a').hasText(`Go to post ${this.post.id}`);
    assert.dom('a').hasAttribute('href', `/preview/${this.user.id}/posts/${this.post.id}`);

    // TODO: assert against the url
  });

  test('it can @preventDefault with certain behavior', async function (assert) {
    assert.expect(3);

    this.something = 'something';
    this.testCall = (value) => assert.equal(value, 'something');

    await render(
      hbs`<LinkTo @route='login' {{on "click" (fn this.testCall this.something)}} @preventDefault={{false}} data-test-link-to>Trigger</LinkTo>`,
      { LinkTo }
    );

    assert.dom('a').hasText('Trigger');
    assert.dom('a').hasAttribute('href', '/login');

    await click('[data-test-link-to]');

    // TODO: assert against the url
  });

  // test('it can have a different @tagName than a tag', async function(assert) {

  // });

  // test('it can have @query argument that appends queryParams to routes', async function(assert) {

  // });
});

// If you need to trigger a full browser reload pass `@preventDefault={{false}}`:
// <LinkTo @route='photoGallery' @model={{this.aPhotoId}} @preventDefault={{false}}>

// <LinkTo @route='photoGallery' @tagName='li'>
//   Great Hamster Photos
// </LinkTo>

// ```handlebars
// <LinkTo @route='photoGallery' @query={{hash page=1 per_page=20}}>
//   Great Hamster Photos
// </LinkTo>
// ```

// This will result in:

// ```html
// <a href="/hamster-photos?page=1&per_page=20">
//   Great Hamster Photos
// </a>
// ```
// TODO: test html class names
