import { decamelize } from '@emberx/string';
import { module, test } from 'qunitx';

module('emberx/string | decamelize', () => {
  test('decamelizes strings', async (assert) => {
    assert.equal(
      decamelize('my favorite items'),
      'my favorite items',
      'does nothing with normal string'
    );
    assert.equal(
      decamelize('css-class-name'),
      'css-class-name',
      'does nothing with dasherized string'
    );
    assert.equal(decamelize('action_name'), 'action_name', 'does nothing with underscored string');
    assert.equal(
      decamelize('innerHTML'),
      'inner_html',
      'converts a camelized string into all lower case separated by underscores.'
    );
    assert.equal(decamelize('size160Url'), 'size160_url', 'decamelizes strings with numbers');
    assert.equal(
      decamelize('PrivateDocs/OwnerInvoice'),
      'private_docs/owner_invoice',
      'decamelize namespaced classified string'
    );
    assert.equal(
      decamelize('privateDocs/ownerInvoice'),
      'private_docs/owner_invoice',
      'decamelize namespaced camelized string'
    );
  });
});
