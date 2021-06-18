import { module, test } from 'qunitx';
import { underscore } from '@emberx/string';

module('@emberx/string | underscore', () => {
  test('@test String underscore tests', async (assert) => {
    assert.equal(underscore('my favorite items'), 'my_favorite_items', 'with normal string');
    assert.equal(underscore('css-class-name'), 'css_class_name', 'with dasherized string');
    assert.equal(underscore('action_name'), 'action_name', 'does nothing with underscored string');
    assert.equal(underscore('innerHTML'), 'inner_html', 'with camelcased string');
    assert.equal(
      underscore('PrivateDocs/OwnerInvoice'),
      'private_docs/owner_invoice',
      'underscore namespaced classified string'
    );
    assert.equal(
      underscore('privateDocs/ownerInvoice'),
      'private_docs/owner_invoice',
      'underscore namespaced camelized string'
    );
    assert.equal(
      underscore('private-docs/owner-invoice'),
      'private_docs/owner_invoice',
      'underscore namespaced dasherized string'
    );
  });
});
