import { module, test } from 'qunitx';
import { camelize } from '@emberx/string';

module('@emberx/string | camelize', () => {
  test('camelizes strings', async (assert) => {
    assert.equal(camelize('my favorite items'), 'myFavoriteItems', 'camelize normal string');
    assert.equal(camelize('I Love Ramen'), 'iLoveRamen', 'camelize capitalized string');
    assert.equal(camelize('css-class-name'), 'cssClassName', 'camelize dasherized string');
    assert.equal(camelize('action_name'), 'actionName', 'camelize underscored string');
    assert.equal(camelize('action.name'), 'actionName', 'camelize dot notation string');
    assert.equal(camelize('innerHTML'), 'innerHTML', 'does nothing with camelcased string');
    assert.equal(
      camelize('PrivateDocs/OwnerInvoice'),
      'privateDocs/ownerInvoice',
      'camelize namespaced classified string'
    );
    assert.equal(
      camelize('private_docs/owner_invoice'),
      'privateDocs/ownerInvoice',
      'camelize namespaced underscored string'
    );
    assert.equal(
      camelize('private-docs/owner-invoice'),
      'privateDocs/ownerInvoice',
      'camelize namespaced dasherized string'
    );
  });
});
