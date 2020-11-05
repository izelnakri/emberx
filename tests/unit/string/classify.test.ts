import { module, test } from 'qunit';
import { classify } from '../../../src/string/index';

module('emberx/string | classify', () => {
  test('classifies strings', async (assert) => {
    testThis(assert, 'my favorite items', 'MyFavoriteItems', 'classify normal string');
    testThis(assert, 'css-class-name', 'CssClassName', 'classify dasherized string');
    testThis(assert, 'action_name', 'ActionName', 'classify underscored string');
    testThis(
      assert,
      'privateDocs/ownerInvoice',
      'PrivateDocs/OwnerInvoice',
      'classify namespaced camelized string'
    );
    testThis(
      assert,
      'private_docs/owner_invoice',
      'PrivateDocs/OwnerInvoice',
      'classify namespaced underscored string'
    );
    testThis(
      assert,
      'private-docs/owner-invoice',
      'PrivateDocs/OwnerInvoice',
      'classify namespaced dasherized string'
    );
    testThis(assert, '-view-registry', '_ViewRegistry', 'classify prefixed dasherized string');
    testThis(
      assert,
      'components/-text-field',
      'Components/_TextField',
      'classify namespaced prefixed dasherized string'
    );
    testThis(assert, '_Foo_Bar', '_FooBar', 'classify underscore-prefixed underscored string');
    testThis(assert, '_Foo-Bar', '_FooBar', 'classify underscore-prefixed dasherized string');
    testThis(
      assert,
      '_foo/_bar',
      '_Foo/_Bar',
      'classify underscore-prefixed-namespaced underscore-prefixed string'
    );
    testThis(
      assert,
      '-foo/_bar',
      '_Foo/_Bar',
      'classify dash-prefixed-namespaced underscore-prefixed string'
    );
    testThis(
      assert,
      '-foo/-bar',
      '_Foo/_Bar',
      'classify dash-prefixed-namespaced dash-prefixed string'
    );
    testThis(assert, 'InnerHTML', 'InnerHTML', 'does nothing with classified string');
    testThis(assert, '_FooBar', '_FooBar', 'does nothing with classified prefixed string');
  });
});

function testThis(assert, given, expected, description) {
  assert.deepEqual(classify(given), expected, description);
}
