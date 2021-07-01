# @emberx/test-helpers - UI test methods for the browser and node.js

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
  render, visit, currentURL, currentRouteName
} from '@emberx/test-helpers';
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
import {
  wait, waitUntil, settled, find, findAll
  render, visit, currentURL, currentRouteName
} from '@emberx/test-helpers';
```
