import Router from '@emberx/router';
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

    this.element = containerPage;
  });

  hooks.afterEach(function () {
    document.getElementById('ember-testing-container').remove();
  });
}

export function setupRenderingTest(hooks: QUnitHooks, startRouter?: any): void {
  setupTest(hooks);

  hooks.beforeEach(function () {
    Router.reset();
    if (startRouter) {
      this.Router = startRouter();
      this.owner = this.Router.owner;
    }
  });

  hooks.afterEach(function () {
    this.Router ? this.Router.reset() : null;
  });
}

// TODO: also set this.owner, this.owner.lookup
export function setupApplicationTest(hooks: QUnitHooks, startRouter?: any): void {
  setupRenderingTest(hooks, startRouter);
}

export default {
  setupTest,
  setupRenderingTest,
  setupApplicationTest,
};
