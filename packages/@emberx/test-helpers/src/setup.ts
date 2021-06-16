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

  hooks.beforeEach(async function () {
    setContext(this);

    const container = document.createElement('div');
    const containerPage = document.createElement('div');

    container.id = 'ember-testing-container';
    containerPage.id = 'ember-testing';

    document.getElementById('qunit-fixture').after(container);
    container.appendChild(containerPage);
  });

  hooks.afterEach(function () {
    document.getElementById('ember-testing-container').remove();
  });
}

export function setupRenderingTest(hooks: QUnitHooks, Application?: any): void {
  setupTest(hooks);

  hooks.beforeEach(async function () {
    this.router = Application;
    this.services = { router: this.router };
  });
}

// TODO: also set this.owner, this.owner.lookup
export function setupApplicationTest(hooks: QUnitHooks, Application?: any): void {
  setupTest(hooks);

  hooks.beforeEach(async function () {
    // TODO: implement owner lookup for services
    this.router = Application;
  });
}

export default {
  setupTest,
  setupRenderingTest,
  setupApplicationTest,
};
