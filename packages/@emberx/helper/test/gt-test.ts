import { module, test } from 'qunitx';
import { hbs } from '@emberx/component';
import { gt, gte } from '@emberx/helper';
import { setupRenderingTest, render } from '@emberx/test-helpers';

module('@emberx/helper | "gt" helper', function (hooks) {
  setupRenderingTest(hooks);

  module("'gt' tests'", function (hooks) {
    test('boolean values', async function (assert) {
      await render(hbs`[{{gt true true}}] [{{gt true false}}] [{{gt false true}}] [{{gt false false}}]`, {
        gt,
      });

      assert.equal(
        this.element.textContent,
        '[false] [true] [false] [false]',
        'value should be "[false] [true] [false] [false]"'
      );
    });

    test('integer values', async function (assert) {
      await render(hbs`[{{gt 1 1}}] [{{gt 1 0}}] [{{gt 0 1}}] [{{gt 0 0}}]`, { gt });

      assert.equal(
        this.element.textContent,
        '[false] [true] [false] [false]',
        'value should be "[false] [true] [false] [false]"'
      );
    });

    test('decimal values', async function (assert) {
      await render(hbs`[{{gt 19.2 19.2}}] [{{gt 19.2 3.55}}] [{{gt 3.55 19.2}}] [{{gt 3.55 3.55}}]`, { gt });

      assert.equal(
        this.element.textContent,
        '[false] [true] [false] [false]',
        'value should be "[false] [true] [false] [false]"'
      );
    });

    test('integers in strings 1', async function (assert) {
      await render(
        hbs`[{{gt '1' '1' forceNumber=true}}] [{{gt '1' '0' forceNumber=true}}] [{{gt '0' '1' forceNumber=true}}] [{{gt '0' '0' forceNumber=true}}]`,
        { gt }
      );

      assert.equal(
        this.element.textContent,
        '[false] [true] [false] [false]',
        'value should be "[false] [true] [false] [false]"'
      );
    });

    test('integers in strings 2', async function (assert) {
      await render(
        hbs`[{{gt '102' '102' forceNumber=true}}] [{{gt '102' '98' forceNumber=true}}] [{{gt '98' '102' forceNumber=true}}] [{{gt '98' '98' forceNumber=true}}]`,
        { gt }
      );

      assert.equal(
        this.element.textContent,
        '[false] [true] [false] [false]',
        'value should be "[false] [true] [false] [false]"'
      );
    });

    test('decimals in strings', async function (assert) {
      await render(
        hbs`[{{gt '19.2' '19.2' forceNumber=true}}] [{{gt '19.2' '3.55' forceNumber=true}}] [{{gt '3.55' '19.2' forceNumber=true}}] [{{gt '3.55' '3.55' forceNumber=true}}]`,
        { gt }
      );

      assert.equal(
        this.element.textContent,
        '[false] [true] [false] [false]',
        'value should be "[false] [true] [false] [false]"'
      );
    });
  });

  module("'gte' tests'", function (hooks) {
    test('boolean values', async function (assert) {
      await render(hbs`[{{gte true true}}] [{{gte true false}}] [{{gte false true}}] [{{gte false false}}]`, {
        gte,
      });

      assert.equal(
        this.element.textContent,
        '[true] [true] [false] [true]',
        'value should be "[false] [true] [false] [true]"'
      );
    });

    test('integer values', async function (assert) {
      await render(hbs`[{{gte 1 1}}] [{{gte 1 0}}] [{{gte 0 1}}] [{{gte 0 0}}]`, { gte });

      assert.equal(
        this.element.textContent,
        '[true] [true] [false] [true]',
        'value should be "[true] [true] [false] [true]"'
      );
    });

    test('decimal values', async function (assert) {
      await render(hbs`[{{gte 19.2 19.2}}] [{{gte 19.2 3.55}}] [{{gte 3.55 19.2}}] [{{gte 3.55 3.55}}]`, {
        gte,
      });

      assert.equal(
        this.element.textContent,
        '[true] [true] [false] [true]',
        'value should be "[true] [true] [false] [true]"'
      );
    });

    test('integers in strings 1', async function (assert) {
      await render(
        hbs`[{{gte '1' '1' forceNumber=true}}] [{{gte '1' '0' forceNumber=true}}] [{{gte '0' '1' forceNumber=true}}] [{{gte '0' '0' forceNumber=true}}]`,
        { gte }
      );

      assert.equal(
        this.element.textContent,
        '[true] [true] [false] [true]',
        'value should be "[true] [true] [false] [true]"'
      );
    });

    test('integers in strings 2', async function (assert) {
      await render(
        hbs`[{{gte '102' '102' forceNumber=true}}] [{{gte '102' '98' forceNumber=true}}] [{{gte '98' '102' forceNumber=true}}] [{{gte '98' '98' forceNumber=true}}]`,
        { gte }
      );

      assert.equal(
        this.element.textContent,
        '[true] [true] [false] [true]',
        'value should be "[true] [true] [false] [true]"'
      );
    });

    test('decimals in strings', async function (assert) {
      await render(
        hbs`[{{gte '19.2' '19.2' forceNumber=true}}] [{{gte '19.2' '3.55' forceNumber=true}}] [{{gte '3.55' '19.2' forceNumber=true}}] [{{gte '3.55' '3.55' forceNumber=true}}]`,
        { gte }
      );

      assert.equal(
        this.element.textContent,
        '[true] [true] [false] [true]',
        'value should be "[true] [true] [false] [true]"'
      );
    });
  });
});
