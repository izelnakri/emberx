import { module, test } from 'qunitx';
import { pauseTest, resumeTest, wait } from '@emberx/test-helpers';
import { setupRenderingTest } from './helpers/index.ts';

module('@emberx/test-helpers | pauseTest', function (hooks) {
  setupRenderingTest(hooks);

  let info;
  hooks.beforeEach(function (assert) {
    info = console.info;
    console.info = (message) => assert.step(message);
  });
  hooks.afterEach(function () {
    console.info = info;
  });

  test('pauseTest stops the test until resumeTest is called', async function (assert) {
    let resumed = false;
    const paused = pauseTest().then(() => (resumed = true));

    await wait(10);

    assert.false(resumed);
    assert.verifySteps(['Testing paused. Use `resumeTest()` to continue.']);

    resumeTest();
    await paused;

    assert.true(resumed);
  });

  test('while paused, resumeTest is on window for the browser console', async function (assert) {
    assert.strictEqual(window.resumeTest, undefined);

    const paused = pauseTest();

    assert.strictEqual(typeof window.resumeTest, 'function');

    window.resumeTest();
    await paused;

    assert.strictEqual(window.resumeTest, undefined);
    assert.verifySteps(['Testing paused. Use `resumeTest()` to continue.']);
  });

  test('pauseTest turns the test timeout off', async function (assert) {
    assert.timeout(50);

    const paused = pauseTest();

    await wait(100);
    resumeTest();
    await paused;

    assert.verifySteps(['Testing paused. Use `resumeTest()` to continue.'], 'the test outlived its 50ms timeout');
  });

  test('the test context has them as this.pauseTest and this.resumeTest', async function (assert) {
    const paused = this.pauseTest();

    this.resumeTest();
    await paused;

    assert.verifySteps(['Testing paused. Use `resumeTest()` to continue.']);
  });

  test('resumeTest throws when no test is paused', function (assert) {
    assert.throws(() => resumeTest(), /Testing has not been paused\. There is nothing to resume\./);

    const paused = pauseTest();
    resumeTest();

    assert.throws(() => resumeTest(), /There is nothing to resume/, 'nor once it has been resumed');
    assert.verifySteps(['Testing paused. Use `resumeTest()` to continue.']);

    return paused;
  });
});
