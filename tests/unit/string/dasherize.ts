import { module, test } from 'qunitx';
import { dasherize } from '../../../src/string/index';

module('emberx/string | classify', () => {
  test('classifies strings', async (assert) => {
    testThis(assert, 'my favorite items', 'my-favorite-items', 'dasherize normal string');
    testThis(assert, 'css-class-name', 'css-class-name', 'does nothing with dasherized string');
    testThis(assert, 'action_name', 'action-name', 'dasherize underscored string');
    testThis(assert, 'innerHTML', 'inner-html', 'dasherize camelcased string');
    testThis(
      assert,
      'toString',
      'to-string',
      'dasherize string that is the property name of Object.prototype'
    );
    testThis(
      assert,
      'PrivateDocs/OwnerInvoice',
      'private-docs/owner-invoice',
      'dasherize namespaced classified string'
    );
    testThis(
      assert,
      'privateDocs/ownerInvoice',
      'private-docs/owner-invoice',
      'dasherize namespaced camelized string'
    );
    testThis(
      assert,
      'private_docs/owner_invoice',
      'private-docs/owner-invoice',
      'dasherize namespaced underscored string'
    );
  });
});

function testThis(assert, given, expected, description) {
  assert.deepEqual(dasherize(given), expected, description);
}
