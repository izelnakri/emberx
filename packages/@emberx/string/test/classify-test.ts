import { module, test } from 'qunitx';
import { classify } from '@emberx/string';

module('emberx/string | classify', () => {
  test('classifies strings', async (assert) => {
    assert.equal(classify('my favorite items'), 'MyFavoriteItems', 'classify normal string');
    assert.equal(classify('css-class-name'), 'CssClassName', 'classify dasherized string');
    assert.equal(classify('action_name'), 'ActionName', 'classify underscored string');
    assert.equal(
      classify('privateDocs/ownerInvoice'),
      'PrivateDocs/OwnerInvoice',
      'classify namespaced camelized string'
    );
    assert.equal(
      classify('private_docs/owner_invoice'),
      'PrivateDocs/OwnerInvoice',
      'classify namespaced underscored string'
    );
    assert.equal(
      classify('private-docs/owner-invoice'),
      'PrivateDocs/OwnerInvoice',
      'classify namespaced dasherized string'
    );
    assert.equal(
      classify('-view-registry'),
      '_ViewRegistry',
      'classify prefixed dasherized string'
    );
    assert.equal(
      classify('components/-text-field'),
      'Components/_TextField',
      'classify namespaced prefixed dasherized string'
    );
    assert.equal(
      classify('_Foo_Bar'),
      '_FooBar',
      'classify underscore-prefixed underscored string'
    );
    assert.equal(classify('_Foo-Bar'), '_FooBar', 'classify underscore-prefixed dasherized string');
    assert.equal(
      classify('_foo/_bar'),
      '_Foo/_Bar',
      'classify underscore-prefixed-namespaced underscore-prefixed string'
    );
    assert.equal(
      classify('-foo/_bar'),
      '_Foo/_Bar',
      'classify dash-prefixed-namespaced underscore-prefixed string'
    );
    assert.equal(
      classify('-foo/-bar'),
      '_Foo/_Bar',
      'classify dash-prefixed-namespaced dash-prefixed string'
    );
    assert.equal(classify('InnerHTML'), 'InnerHTML', 'does nothing with classified string');
    assert.equal(classify('_FooBar'), '_FooBar', 'does nothing with classified prefixed string');
  });
});
