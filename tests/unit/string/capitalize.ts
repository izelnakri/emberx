import { module, test } from 'qunitx';
import { capitalize } from '../../../src/string/index';

module('emberx/string | capitalize', () => {
  test('capitalizes strings', async (assert) => {
    testThis(assert, 'my favorite items', 'My favorite items', 'capitalize normal string');
    testThis(assert, 'css-class-name', 'Css-class-name', 'capitalize dasherized string');
    testThis(assert, 'action_name', 'Action_name', 'capitalize underscored string');
    testThis(assert, 'innerHTML', 'InnerHTML', 'capitalize camelcased string');
    testThis(
      assert,
      'Capitalized string',
      'Capitalized string',
      'does nothing with capitalized string'
    );
    testThis(
      assert,
      'privateDocs/ownerInvoice',
      'PrivateDocs/OwnerInvoice',
      'capitalize namespaced camelized string'
    );
    testThis(
      assert,
      'private_docs/owner_invoice',
      'Private_docs/Owner_invoice',
      'capitalize namespaced underscored string'
    );
    testThis(
      assert,
      'private-docs/owner-invoice',
      'Private-docs/Owner-invoice',
      'capitalize namespaced dasherized string'
    );
    testThis(assert, 'šabc', 'Šabc', 'capitalize string with accent character');
  });
});

function testThis(assert, given, expected, description) {
  assert.deepEqual(capitalize(given), expected, description);
}
