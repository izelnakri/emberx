import { hbs } from '@glimmerx/component';
import { module, test } from 'qunit';
import { render } from '../../src/test-helpers';
import { setupRenderingTest } from '../../src/test-helpers/setup';

import LinkTo from '../../src/components/LinkTo';

module('<LinkTo> test', function (hooks) {
  setupRenderingTest(hooks);

  test('it works for a basic route without params', async function (assert) {
    await render(hbs`<LinkTo @route="public.index">Something</LinkTo>`);

    assert.dom('a[href="/"]').hasText('Something');
  });
});
