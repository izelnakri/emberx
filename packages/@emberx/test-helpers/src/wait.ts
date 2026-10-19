import { didRender, getAsyncActionsQueue } from '@emberx/component';
import { Owner } from '@emberx/router';
import { find, findAll } from './query.ts';

const TIMEOUTS = [0, 1, 2, 5, 7];
const MAX_TIMEOUT = 10;

type Falsy = false | 0 | '' | null | undefined;

export interface Options {
  timeout?: number;
  count?: number | null;
  timeoutMessage?: string;
}

/**
  Wait for the provided callback to return a truthy value.

  @example
  ```ts
  import assert from 'node:assert/strict';
  import { find, waitUntil } from '@emberx/test-helpers';

  document.body.innerHTML = '<p class="status">loading</p>';
  setTimeout(() => (find('.status')!.textContent = 'loaded'), 50);

  await waitUntil(() => find('.status')!.textContent!.includes('loaded'), { timeout: 2000 });

  assert.equal(find('.status')!.textContent, 'loaded');
  ```
*/
export function waitUntil<T>(callback: () => T | void | Falsy, options: Options = {}): Promise<T> {
  const timeout = 'timeout' in options ? (options.timeout as number) : 1000;
  const timeoutMessage = 'timeoutMessage' in options ? options.timeoutMessage : 'waitUntil timed out';

  // creating this error eagerly so it has the proper invocation stack
  const waitUntilTimedOut = new Error(timeoutMessage);

  return new Promise(function (resolve, reject) {
    let time = 0;

    function scheduleCheck(timeoutsIndex: number) {
      let interval = TIMEOUTS[timeoutsIndex];
      if (interval === undefined) {
        interval = MAX_TIMEOUT;
      }

      window.setTimeout(function () {
        time += interval;

        let value: T | void | Falsy;
        try {
          value = callback();
        } catch (error) {
          return reject(error);
        }

        if (value) {
          resolve(value);
        } else if (time < timeout) {
          scheduleCheck(timeoutsIndex + 1);
        } else {
          return reject(waitUntilTimedOut);
        }
      }, interval);
    }

    scheduleCheck(0);
  });
}

/**
  Used to wait for a particular selector to appear in the DOM. Due to the fact
  that it does not wait for general settledness, this is quite useful for testing
  interim DOM states (e.g. loading states, pending promises, etc).

  @example
  Waiting until a selector is rendered:

  ```ts
  import assert from 'node:assert/strict';
  import { waitFor } from '@emberx/test-helpers';

  setTimeout(() => document.body.insertAdjacentHTML('beforeend', '<p class="ready">ready</p>'), 50);

  const element = (await waitFor('.ready', { timeout: 2000 })) as Element;

  assert.equal(element.textContent, 'ready');
  ```
*/
export function waitFor(selector: string, options: Options = {}): Promise<Element | Element[]> {
  return Promise.resolve().then(() => {
    if (!selector) {
      throw new Error('Must pass a selector to `waitFor`.');
    }

    let { timeout = 1000, count = null, timeoutMessage } = options;
    if (!timeoutMessage) {
      timeoutMessage = `waitFor timed out waiting for selector "${selector}"`;
    }

    let callback: () => Element | Element[] | void | null;
    if (count !== null) {
      callback = () => {
        const elements = findAll(selector) as Array<HTMLElement>;
        if (elements.length === count) {
          return Array.from(elements);
        }

        return;
      };
    } else {
      callback = () => find(selector);
    }

    return waitUntil(callback, { timeout, timeoutMessage });
  });
}

/** What settled() is waiting on: see getSettledState(). */
export interface SettledState {
  /** An `@action` returned a promise that has not settled yet. */
  hasPendingActions: boolean;
  pendingActionCount: number;
  /** A router transition, including its redirects, is under way. */
  hasPendingTransitions: boolean;
}

/**
  What async work is still under way, as settled() sees it: pending `@action`
  promises and router transitions. For finding out what a test that hangs on
  `await settled()` is waiting for.

  Rendering is not in it: emberx cannot tell from outside the renderer whether
  a render is scheduled. settled() still waits for one.
*/
export function getSettledState(): SettledState {
  const pendingActionCount = getAsyncActionsQueue().size;

  return {
    hasPendingActions: pendingActionCount > 0,
    pendingActionCount,
    hasPendingTransitions: !!routerService()?.activeTransition,
  };
}

/** Whether nothing settled() waits for is under way. Rendering aside, see getSettledState(). */
export function isSettled(): boolean {
  const { hasPendingActions, hasPendingTransitions } = getSettledState();

  return !hasPendingActions && !hasPendingTransitions;
}

/**
  Resolves once every pending `@action` promise and router transition has
  finished, and the renders they caused are done. Work that starts more work,
  an action that transitions for example, is waited for too.
*/
export async function settled(): Promise<void> {
  await Promise.all(getAsyncActionsQueue());
  // Only waits: whether the transition succeeded is for the test to check.
  await routerService()
    ?.activeTransition?.followRedirects()
    .catch(() => {});
  await didRender();

  // The work just awaited may have started more; each round awaits first, so the stack never grows.
  if (!isSettled()) {
    return settled();
  }
}

export async function wait(timeout: number = 500): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(() => resolve(null), timeout);
  });
}

function routerService() {
  return Owner.lookup('service:router') as { activeTransition?: any } | undefined;
}
