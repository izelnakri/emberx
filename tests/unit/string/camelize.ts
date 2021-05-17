import { module, test } from 'qunitx';
import { camelize } from '@emberx/string';

module('emberx/string | camelize', () => {
  test('camelizes strings', async (assert) => {
    testThis(assert, 'my favorite items', 'myFavoriteItems', 'camelize normal string');
    testThis(assert, 'I Love Ramen', 'iLoveRamen', 'camelize capitalized string');
    testThis(assert, 'css-class-name', 'cssClassName', 'camelize dasherized string');
    testThis(assert, 'action_name', 'actionName', 'camelize underscored string');
    testThis(assert, 'action.name', 'actionName', 'camelize dot notation string');
    testThis(assert, 'innerHTML', 'innerHTML', 'does nothing with camelcased string');
    testThis(
      assert,
      'PrivateDocs/OwnerInvoice',
      'privateDocs/ownerInvoice',
      'camelize namespaced classified string'
    );
    testThis(
      assert,
      'private_docs/owner_invoice',
      'privateDocs/ownerInvoice',
      'camelize namespaced underscored string'
    );
    testThis(
      assert,
      'private-docs/owner-invoice',
      'privateDocs/ownerInvoice',
      'camelize namespaced dasherized string'
    );
  });
});

function testThis(assert, given, expected, description) {
  assert.deepEqual(camelize(given), expected, description);
}
