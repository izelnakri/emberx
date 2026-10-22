# @emberx/test-helpers - UI test methods for the browser

Fast & mature native browser user input simulators for frontend testing. Extracted from ember.js. These methods are
`@action` promise aware, so when user inputs fire `@action` methods of emberx component or routers, they get waited
without any additional need for wait code:

```
// Input helpers:
import {
  blur, click, doubleClick, fillIn, fireEvent, focus, scrollTo, select, tap,
  triggerEvent, triggerKeyEvent, typeIn
} from '@emberx/test-helpers';

// async blur(target, relatedTarget?)
// async click(target, mouseEventOptions?);
// async doubleClick(target, mouseEventOptions?);
// async fillIn(target, text);
// fireEvent(element, eventType, options?);
// async focus(target);
// async scrollTo(target, x, y);
// async select(target, optionsToSelect, keepPreviouslySelected = false);
// async tap(target, mouseEventOptions?);
// async triggerEvent(target, eventType, options?);
// async triggerKeyEvent(target, keyboardEventType, keyCode, keyModifier? = DEFAULT_MODIFIERS);
// async typeIn(target, text, optionsForDelay?);

// Setup & URL helpers:
import {
  setupTest, setupRenderingTest, setupApplicationTest,
  render, rerender, clearRender, visit, currentURL, currentRouteName, hbs
} from '@emberx/test-helpers';
// async rerender();     waits for the render a tracked change scheduled
// async clearRender();  empties what render() rendered
// Each setup*Test() sets up qunit-dom's assert.dom(selector), which looks in #ember-testing, and types it on
// QUnitX's assert. `Assert` is that type, for a helper that takes one: function assertGreets(assert: Assert) {}
import { module, test } from 'qunitx';
import Router, { Route } from '@emberx/router';

module('@emberx/test-helpers | url helpers', function (hooks) {
  class IndexRoute extends Route {
    static template = hbs`
      <h1 data-test-route-title="index">This is from Index Route</h1>
    `;
  }

  class BasicRoute extends Route {
    static template = hbs`
      <h1 data-test-route-title="basic">This is from Basic Route</h1>
    `;
  }

  setupRenderingTest(hooks, () => {
    return Router.start([
      {
        path: '/',
        name: 'index',
        route: IndexRoute,
      },
      {
        path: '/basic',
        name: 'basic',
        route: BasicRoute,
      },
    ]);
  });

  test('visit, currentRouteName, currentURL works consequently', async function (assert) {
    assert.equal(currentURL(), undefined);
    assert.equal(currentRouteName(), undefined);

    await visit('/');

    assert.dom('[data-test-route-title]').hasText('This is from Index Route');
    assert.equal(currentURL(), '/');
    assert.equal(currentRouteName(), 'index');
  });
});

// Waiters and Query methods:
import { wait, waitFor, waitUntil, settled, isSettled, getSettledState, find, findAll } from '@emberx/test-helpers';
// async settled();    pending @action promises, router transitions, test waiters' work
//                     (@waitFor, waitForPromise and buildWaiter, from @emberx/component) and the renders they cause
// isSettled();        nothing settled() waits for is under way
// getSettledState();  { hasPendingActions, pendingActionCount, hasPendingTransitions, hasPendingWaiters }

// Errors: what an @action throws, or an async one rejects with, fails the helper that ran it.
import { setupOnerror, resetOnerror } from '@emberx/test-helpers';
// setupOnerror((error) => assert.equal(error.message, 'Not allowed'));  the test takes them instead
// resetOnerror();     each test's teardown calls it

// Debugging: stop a test to look at the page, and carry on with resumeTest(),
// which is also on window while paused. Run with `qunitx <test file> --open`.
import { pauseTest, resumeTest } from '@emberx/test-helpers';
// async pauseTest();  or this.pauseTest() inside a test
// resumeTest();       or this.resumeTest()
```
