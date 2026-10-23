import { getAssert } from './context.ts';

/** `window`, which has `resumeTest` while a test is paused. Not a global declaration, which JSR does not allow. */
type WindowWithResumeTest = Window & { resumeTest?: () => void };

let resume: (() => void) | undefined;

/**
 * The longest a timer waits, about 24 days: a timeout that never comes. QUnit
 * turns the timeout off for 0 or less, but qunitx under node and Deno takes
 * only a positive duration.
 */
const NO_TIMEOUT = 2 ** 31 - 1;

/**
  Stops the running test where it is, so the page it rendered can be inspected
  and clicked around in, until `resumeTest()` is called. The test timeout is
  turned off meanwhile. While paused, `resumeTest` is also on `window`, to call
  from the browser console.

  Run the test in a visible browser to see it: `qunitx test/some-test.ts --open`.

  @example
  ```ts ignore
  import { visit, pauseTest } from '@emberx/test-helpers';

  test('the checkout page', async function (assert) {
    await visit('/checkout');
    await pauseTest(); // resumeTest() in the console carries on from here

    assert.dom('[data-test-total]').hasText('$42');
  });
  ```
*/
export function pauseTest(): Promise<void> {
  getAssert()?.timeout(NO_TIMEOUT);
  console.info('Testing paused. Use `resumeTest()` to continue.');

  return new Promise((resolve) => {
    resume = resolve;
    (window as WindowWithResumeTest).resumeTest = resumeTest;
  });
}

/** Resumes a test stopped with `pauseTest()`. Throws when no test is paused. */
export function resumeTest(): void {
  if (!resume) {
    throw new Error('Testing has not been paused. There is nothing to resume.');
  }

  const resolve = resume;

  resume = undefined;
  (window as WindowWithResumeTest).resumeTest = undefined;
  resolve();
}
