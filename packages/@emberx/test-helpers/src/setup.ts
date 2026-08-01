import { Owner } from '@emberx/router';
import { setContext } from './context';

declare global {
  interface Window {
    resume: any;
    resumeTest: any;
  }
}

/**
 * The per-test object QUnit constructs and applies every hook against. emberx
 * hangs its own fixtures off it — `element`, `owner`, `Router`, `pauseTest`,
 * `resumeTest` — and test bodies hang arbitrary state off it too, hence the
 * index signature.
 */
interface TestContext {
  [propName: string]: any;
}

/**
 * The slice of QUnit's `assert` that emberx reaches for. QUnit ships no types
 * here (these packages declare no ambient `@types`), so the contract is
 * restated rather than imported.
 */
interface QUnitAssert {
  timeout(duration: number): void;
}

type QUnitHookCallback = (this: TestContext, assert: QUnitAssert) => void | Promise<void>;

interface QUnitHooks {
  before: (callback: QUnitHookCallback) => void;
  beforeEach: (callback: QUnitHookCallback) => void;
  afterEach: (callback: QUnitHookCallback) => void;
  after: (callback: QUnitHookCallback) => void;
}

export function setupTest(hooks: QUnitHooks, _startRouter?: () => unknown): void {
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

    // NOTE: #qunit-fixture is part of the QUnit test page; its absence is a
    // broken harness, and this already throws today. The assertion says so.
    document.getElementById('qunit-fixture')!.after(container);
    container.appendChild(containerPage);

    this.element = containerPage;
    this.owner = Owner;
  });

  hooks.afterEach(function () {
    // NOTE: created by the `beforeEach` above, so it is present by construction.
    document.getElementById('ember-testing-container')!.remove();
  });
}

export function setupRenderingTest(hooks: QUnitHooks, startRouter?: () => unknown): void {
  setupTest(hooks, startRouter);

  hooks.beforeEach(function () {
    if (startRouter) {
      this.Router = startRouter();
    }
  });
}

export function setupApplicationTest(hooks: QUnitHooks, startRouter?: () => unknown): void {
  setupRenderingTest(hooks, startRouter);
}

export default {
  setupTest,
  setupRenderingTest,
  setupApplicationTest,
};
