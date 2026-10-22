import Router, { Owner } from '@emberx/router';
import { setup as setupDOMAssertions, type Assert as DOMAssert } from 'qunit-dom';
import type QUnitxAssert from 'qunitx/assert';
import { resetRendering } from '@emberx/component';
import { setContext } from './context.ts';
import { pauseTest, resumeTest } from './pause.ts';
import { catchActionErrors, resetOnerror, stopCatchingActionErrors } from './onerror.ts';

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

// qunit-dom's `assert.dom`, which setupTest() adds to every test's assert, on QUnitX's Assert type: qunit-dom
// types it on QUnit's global Assert only.
declare module 'qunitx/assert' {
  export default interface Assert extends DOMAssert {}
}

type QUnitHookCallback = (this: TestContext, assert: QUnitAssert) => void | Promise<void>;

interface QUnitHooks {
  before: (callback: QUnitHookCallback) => void;
  beforeEach: (callback: QUnitHookCallback) => void;
  afterEach: (callback: QUnitHookCallback) => void;
  after: (callback: QUnitHookCallback) => void;
}

/** A test's `assert`: QUnitX's, with qunit-dom's `assert.dom`. */
export type Assert = QUnitxAssert;

export function setupTest(hooks: QUnitHooks, _startRouter?: () => unknown): void {
  hooks.beforeEach(async function (assert) {
    setContext(this, assert);
    // `assert.dom(selector)`, which looks in #ember-testing unless given another root.
    setupDOMAssertions(assert as unknown as QUnitxAssert);

    this.pauseTest = pauseTest;
    this.resumeTest = resumeTest;

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
    Router.testing = true;
    catchActionErrors();
  });

  hooks.afterEach(function () {
    Router.testing = false;
    resetOnerror();
    stopCatchingActionErrors();
    // NOTE: created by the `beforeEach` above, so it is present by construction.
    document.getElementById('ember-testing-container')!.remove();
    // Each test starts with a fresh renderer, so a render that threw in one test
    // cannot replay its error in the next.
    resetRendering();
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
