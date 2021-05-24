import Component from '@emberx/component';
import createTemplate from '../lib/create-template';
import { module, test } from 'qunitx';

module('@emberx/component | createTemplate', function (hooks) {
  test('it returns a correct templateFactory', function (assert) {
    let templateFactory = createTemplate(`<h1>Hello world</h1>`, { strictMode: true }, {});

    assert.deepEqual(Object.keys(templateFactory), ['__id', '__meta']);

    class SomeComponent extends Component {}

    let anotherFactory = createTemplate(
      `<SomeComponent /><h1>Hello world</h1><SomeComponent />`,
      { strictMode: true },
      { SomeComponent }
    );

    assert.deepEqual(Object.keys(anotherFactory), ['__id', '__meta']);
  });
});
