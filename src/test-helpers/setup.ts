import { setContext } from './context';

declare global {
  interface Window {
    resume: any;
    resumeTest: any;
  }
}

interface QUnitHooks {
  before: (assert) => {};
  beforeEach: (assert) => {};
  afterEach: (assert) => {};
  after: (assert) => {};
}

export function setupTest(hooks: QUnitHooks): void {
  hooks.before(function (assert) {
    this.resumeTest = function resumeTest() {
      if (!window.resume) {
        console.info('Testing has not been paused. There is nothing to resume.');
      }

      window.resume();
      window.resumeTest = window.resume = undefined;
    };

    this.pauseTest = function pauseTest() {
      assert.timeout(-1); // prevent the test from timing out
      console.info('Testing paused. Use `resumeTest()` to continue.'); // eslint-disable-line no-console

      return new Promise((resolve) => {
        window.resume = resolve;
        window.resumeTest = this.resumeTest;
      });
    };
  });
}

export function setupRenderingTest(hooks: QUnitHooks): void {
  setupTest(hooks);

  hooks.beforeEach(async function () {
    // TODO: implement owner lookup for services
    // this.owner = await import('../index');
    setContext(this);
  });
}

// TODO: also set this.owner, this.owner.lookup
export function setupApplicationTest(hooks: QUnitHooks): void {
  setupTest(hooks);

  hooks.beforeEach(async function () {
    // TODO: implement owner lookup for services
    this.router = await import('../index');
    setContext(this);
  });

  // console.log('setupApplicationTest called', hooks);
}
