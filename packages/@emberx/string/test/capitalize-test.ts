import { module, test } from 'qunitx';
import { capitalize } from '@emberx/string';

module('@emberx/string | capitalize', () => {
  test('capitalizes strings', async (assert) => {
    assert.equal(capitalize('my favorite items'), 'My favorite items', 'capitalize normal string');
    assert.equal(capitalize('css-class-name'), 'Css-class-name', 'capitalize dasherized string');
    assert.equal(capitalize('action_name'), 'Action_name', 'capitalize underscored string');
    assert.equal(capitalize('innerHTML'), 'InnerHTML', 'capitalize camelcased string');
    assert.equal(
      capitalize('Capitalized string'),
      'Capitalized string',
      'does nothing with capitalized string'
    );
    assert.equal(
      capitalize('privateDocs/ownerInvoice'),
      'PrivateDocs/OwnerInvoice',
      'capitalize namespaced camelized string'
    );
    assert.equal(
      capitalize('private_docs/owner_invoice'),
      'Private_docs/Owner_invoice',
      'capitalize namespaced underscored string'
    );
    assert.equal(
      capitalize('private-docs/owner-invoice'),
      'Private-docs/Owner-invoice',
      'capitalize namespaced dasherized string'
    );
    assert.equal(capitalize('šabc'), 'Šabc', 'capitalize string with accent character');
  });
});
