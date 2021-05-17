import { module, test } from 'qunitx';
import { dasherize } from '@emberx/string';

module('emberx/string | dasherize', () => {
  test('classifies strings', async (assert) => {
    assert.equal(dasherize('my favorite items'), 'my-favorite-items', 'dasherize normal string');
    assert.equal(
      dasherize('css-class-name'),
      'css-class-name',
      'does nothing with dasherized string'
    );
    assert.equal(dasherize('action_name'), 'action-name', 'dasherize underscored string');
    assert.equal(dasherize('innerHTML'), 'inner-html', 'dasherize camelcased string');
    assert.equal(
      dasherize('toString'),
      'to-string',
      'dasherize string that is the property name of Object.prototype'
    );
    assert.equal(
      dasherize('PrivateDocs/OwnerInvoice'),
      'private-docs/owner-invoice',
      'dasherize namespaced classified string'
    );
    assert.equal(
      dasherize('privateDocs/ownerInvoice'),
      'private-docs/owner-invoice',
      'dasherize namespaced camelized string'
    );
    assert.equal(
      dasherize('private_docs/owner_invoice'),
      'private-docs/owner-invoice',
      'dasherize namespaced underscored string'
    );
  });
});
