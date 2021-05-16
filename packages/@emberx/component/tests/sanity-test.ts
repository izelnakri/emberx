import Component from '@emberx/component';
import { module, test } from 'qunitx';

module('@emberx/component', function (hooks) {
  test('can import', function (assert) {
    assert.ok(Component);
    console.log(Component);
  });
});
