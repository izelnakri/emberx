import { loc } from '../../../src/string/index';
import { getStrings, setStrings } from '../../../src/string/lib/string-registry';
import { module, test } from 'qunitx';

module('emberx/string | loc', (hooks) => {
  let oldString;

  hooks.beforeEach(() => {
    oldString = getStrings();
    setStrings({
      '_Hello World': 'Bonjour le monde',
      '_Hello %@': 'Bonjour %@',
      '_Hello %@ %@': 'Bonjour %@ %@',
      '_Hello %@# %@#': 'Bonjour %@2 %@1',
    });
  });

  hooks.afterEach(() => {
    setStrings(oldString);
  });

  test('loc strings', async (assert) => {
    testThis(
      assert,
      '_Hello World',
      [],
      'Bonjour le monde',
      `loc('_Hello World') => 'Bonjour le monde'`
    );
    testThis(
      assert,
      '_Hello %@ %@',
      ['John', 'Doe'],
      'Bonjour John Doe',
      `loc('_Hello %@ %@', ['John', 'Doe']) => 'Bonjour John Doe'`
    );
    testThis(
      assert,
      '_Hello %@# %@#',
      ['John', 'Doe'],
      'Bonjour Doe John',
      `loc('_Hello %@# %@#', ['John', 'Doe']) => 'Bonjour Doe John'`
    );
    testThis(
      assert,
      '_Not In Strings',
      [],
      '_Not In Strings',
      `loc('_Not In Strings') => '_Not In Strings'`
    );
  });

  test('loc works with argument form', async (assert) => {
    assert.equal(loc('_Hello %@', 'John'), 'Bonjour John');
    assert.equal(loc('_Hello %@ %@', ['John'], 'Doe'), 'Bonjour John Doe');
  });
});

function testThis(assert, given, args, expected, description) {
  assert.deepEqual(loc(given, args), expected, description);
}
