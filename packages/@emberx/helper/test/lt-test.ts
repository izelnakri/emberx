import { module, test } from 'qunitx';
import { hbs } from '@emberx/component';
import { setupRenderingTest, render } from '@emberx/test-helpers';

module('@emberx/helper | "lt" helper', function (hooks) {
  setupRenderingTest(hooks);

  module("'lt' tests'", function (hooks) {
    test('boolean values', async function (assert) {
      await render(hbs`[{{lt true true}}] [{{lt true false}}] [{{lt false true}}] [{{lt false false}}]`);

      assert.equal(
        this.element.textContent,
        '[false] [false] [true] [false]',
        'value should be "[false] [false] [true] [false]"'
      );
    });

    test('integer values', async function (assert) {
      await render(hbs`[{{lt 1 1}}] [{{lt 1 0}}] [{{lt 0 1}}] [{{lt 0 0}}]`);

      assert.equal(
        this.element.textContent,
        '[false] [false] [true] [false]',
        'value should be "[false] [false] [true] [false]"'
      );
    });

    test('decimal values', async function (assert) {
      await render(hbs`[{{lt 19.2 19.2}}] [{{lt 19.2 3.55}}] [{{lt 3.55 19.2}}] [{{lt 3.55 3.55}}]`);

      assert.equal(
        this.element.textContent,
        '[false] [false] [true] [false]',
        'value should be "[false] [false] [true] [false]"'
      );
    });

    test('integers in strings 1', async function (assert) {
      await render(
        hbs`[{{lt '1' '1' forceNumber=true}}] [{{lt '1' '0' forceNumber=true}}] [{{lt '0' '1' forceNumber=true}}] [{{lt '0' '0' forceNumber=true}}]`
      );

      assert.equal(
        this.element.textContent,
        '[false] [false] [true] [false]',
        'value should be "[false] [false] [true] [false]"'
      );
    });

    test('integers in strings 2', async function (assert) {
      await render(
        hbs`[{{lt '102' '102' forceNumber=true}}] [{{lt '102' '98' forceNumber=true}}] [{{lt '98' '102' forceNumber=true}}] [{{lt '98' '98' forceNumber=true}}]`
      );

      assert.equal(
        this.element.textContent,
        '[false] [false] [true] [false]',
        'value should be "[false] [false] [true] [false]"'
      );
    });

    test('decimals in strings', async function (assert) {
      await render(
        hbs`[{{lt '19.2' '19.2' forceNumber=true}}] [{{lt '19.2' '3.55' forceNumber=true}}] [{{lt '3.55' '19.2' forceNumber=true}}] [{{lt '3.55' '3.55' forceNumber=true}}]`
      );

      assert.equal(
        this.element.textContent,
        '[false] [false] [true] [false]',
        'value should be "[false] [false] [true] [false]"'
      );
    });
  });

  module("'lte' tests'", function (hooks) {
    test('boolean values', async function (assert) {
      await render(hbs`[{{lte true true}}] [{{lte true false}}] [{{lte false true}}] [{{lte false false}}]`);

      assert.equal(
        this.element.textContent,
        '[true] [false] [true] [true]',
        'value should be "[false] [false] [true] [true]"'
      );
    });

    test('integer values', async function (assert) {
      await render(hbs`[{{lte 1 1}}] [{{lte 1 0}}] [{{lte 0 1}}] [{{lte 0 0}}]`);

      assert.equal(
        this.element.textContent,
        '[true] [false] [true] [true]',
        'value should be "[false] [false] [true] [true]"'
      );
    });

    test('decimal values', async function (assert) {
      await render(hbs`[{{lte 19.2 19.2}}] [{{lte 19.2 3.55}}] [{{lte 3.55 19.2}}] [{{lte 3.55 3.55}}]`);

      assert.equal(
        this.element.textContent,
        '[true] [false] [true] [true]',
        'value should be "[false] [false] [true] [true]"'
      );
    });

    test('integers in strings 1', async function (assert) {
      await render(
        hbs`[{{lte '1' '1' forceNumber=true}}] [{{lte '1' '0' forceNumber=true}}] [{{lte '0' '1' forceNumber=true}}] [{{lte '0' '0' forceNumber=true}}]`
      );

      assert.equal(
        this.element.textContent,
        '[true] [false] [true] [true]',
        'value should be "[false] [false] [true] [true]"'
      );
    });

    test('integers in strings 2', async function (assert) {
      await render(
        hbs`[{{lte '102' '102' forceNumber=true}}] [{{lte '102' '98' forceNumber=true}}] [{{lte '98' '102' forceNumber=true}}] [{{lte '98' '98' forceNumber=true}}]`
      );

      assert.equal(
        this.element.textContent,
        '[true] [false] [true] [true]',
        'value should be "[false] [false] [true] [true]"'
      );
    });

    test('decimals in strings', async function (assert) {
      await render(
        hbs`[{{lte '19.2' '19.2' forceNumber=true}}] [{{lte '19.2' '3.55' forceNumber=true}}] [{{lte '3.55' '19.2' forceNumber=true}}] [{{lte '3.55' '3.55' forceNumber=true}}]`
      );

      assert.equal(
        this.element.textContent,
        '[true] [false] [true] [true]',
        'value should be "[false] [false] [true] [true]"'
      );
    });
  });
});
