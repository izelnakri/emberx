import { module, test } from 'qunitx';
import { underscore } from '../../../src/string/index';

module('emberx/string | underscore', () => {
  test('@test String underscore tests', async (assert) => {
    assert.deepEqual(underscore('my favorite items'), 'my_favorite_items', 'with normal string');
    assert.deepEqual(underscore('css-class-name'), 'css_class_name', 'with dasherized string');
    assert.deepEqual(
      underscore('action_name'),
      'action_name',
      'does nothing with underscored string'
    );
    assert.deepEqual(underscore('innerHTML'), 'inner_html', 'with camelcased string');

    assert.deepEqual(
      underscore('PrivateDocs/OwnerInvoice'),
      'private_docs/owner_invoice',
      'underscore namespaced classified string'
    );

    assert.deepEqual(
      underscore('privateDocs/ownerInvoice'),
      'private_docs/owner_invoice',
      'underscore namespaced camelized string'
    );
    assert.deepEqual(
      underscore('private-docs/owner-invoice'),
      'private_docs/owner_invoice',
      'underscore namespaced dasherized string'
    );
  });
});
