import Router from '../src/router';

// TODO: also set this.owner, this.owner.lookup
export function setupApplicationTest(hooks) {
  hooks.before(function (assert) {
    let resume;
    this.resumeTest = function resumeTest() {
      if (!global.resume) {
        console.info('Testing has not been paused. There is nothing to resume.');
      }

      resume();
      global.resumeTest = resume = undefined;
    };

    this.pauseTest = function pauseTest() {
      assert.timeout(-1); // prevent the test from timing out
      console.info('Testing paused. Use `resumeTest()` to continue.'); // eslint-disable-line no-console

      return new Promise((resolve) => {
        resume = resolve;
        global.resumeTest = this.resumeTest;
      }, 'TestAdapter paused promise');
    };
  });

  hooks.beforeEach(async function (assert) {
    this.router = await import('../src/index');
    console.log('beforeEach finished');
  });

  // console.log('setupApplicationTest called', hooks);
}
