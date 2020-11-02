import { hbs } from '@glimmerx/component';
import { module, test } from 'qunit';
import { render } from '../../src/test-helpers';
import { setupRenderingTest } from '../../src/test-helpers/setup';
import Application from '../../examples/blog/index';

import LinkTo from '../../src/LinkTo';

// NOTE: in future also check against currentURL(), spy on this.router.recognizer.generate with right params
// TODO: also test with different @tagName for td's
// TODO: check preventDefault argument
module('<LinkTo> test', function (hooks) {
  setupRenderingTest(hooks, Application);

  test('it throws when @route param is missing', async function (assert) {
    assert.throws(
      async () => await render(hbs`<LinkTo>Something</LinkTo>`),
      (error) => assert.equals(error.toString(), '<LinkTo /> component missing @route argument'),
      'it throws when @route param is missing'
    );
  });

  test('it works for a basic route without params', async function (assert) {
    await render(hbs`<LinkTo @route="public.index">Something</LinkTo>`);

    assert.dom('a[href="/"]').hasText('Something');
  });

  test('it works for a route with @model as object', async function (assert) {
    this.blogPost = { slug: '0d469c09-b6f6-4bce-999a-b7b528f86aac' };

    await render(hbs`<LinkTo @route="public.blog-post" @model={{@blogPost}}>Go to post</LinkTo>`);

    assert.dom('a').hasText('Go to post');
    assert.dom('a').hasAttribute('href', '/0d469c09-b6f6-4bce-999a-b7b528f86aac');
    // assert.dom('p').hasText('Route slug is: 0d469c09-b6f6-4bce-999a-b7b528f86aac');
  });
});
