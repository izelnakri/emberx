import { decamelize } from '../../../src/string/index';
import { module, test } from 'qunit';

module('emberx/string | decamelize', () => {
  test('decamelizes strings', async (assert) => {
    testThis(assert, 'my favorite items', 'my favorite items', 'does nothing with normal string');
    testThis(assert, 'css-class-name', 'css-class-name', 'does nothing with dasherized string');
    testThis(assert, 'action_name', 'action_name', 'does nothing with underscored string');
    testThis(
      assert,
      'innerHTML',
      'inner_html',
      'converts a camelized string into all lower case separated by underscores.'
    );
    testThis(assert, 'size160Url', 'size160_url', 'decamelizes strings with numbers');
    testThis(
      assert,
      'PrivateDocs/OwnerInvoice',
      'private_docs/owner_invoice',
      'decamelize namespaced classified string'
    );
    testThis(
      assert,
      'privateDocs/ownerInvoice',
      'private_docs/owner_invoice',
      'decamelize namespaced camelized string'
    );
  });
});

function testThis(assert, given, expected, description) {
  assert.deepEqual(decamelize(given), expected, description);
}
