import Component, { createTemplate, loadTemplateCompiler } from '@emberx/component';
import { module, test } from 'qunitx';

module('@emberx/component | createTemplate', function (_hooks) {
  test('it returns a correct templateFactory', async function (assert) {
    await loadTemplateCompiler();
    const templateFactory = createTemplate(`<h1>Hello world</h1>`, { strictMode: true }, {});

    assert.deepEqual(Object.keys(templateFactory), ['__id', '__meta']);

    class SomeComponent extends Component {}

    const anotherFactory = createTemplate(
      `<SomeComponent /><h1>Hello world</h1><SomeComponent />`,
      { strictMode: true },
      { SomeComponent },
    );

    assert.deepEqual(Object.keys(anotherFactory), ['__id', '__meta']);
  });
});
