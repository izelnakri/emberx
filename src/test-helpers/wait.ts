import { find, findAll } from './query';

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
  await waitUntil(function() {
    return find('.my-selector').textContent.includes('something')
  }, { timeout: 2000 })
*/
export function waitUntil<T>(callback: () => T | void | Falsy, options: Options = {}): Promise<T> {
  const timeout = 'timeout' in options ? (options.timeout as number) : 1000;
  const timeoutMessage =
    'timeoutMessage' in options ? options.timeoutMessage : 'waitUntil timed out';

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
        console.log('waitUntil call');
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
  @example
  <caption>
    Waiting until a selector is rendered:
  </caption>
  await waitFor('.my-selector', { timeout: 2000 })
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
        const elements = findAll(selector);
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

// NOTE: build a new waiting system? (Should only have route transition and request waiting?

// export function waitFor(selector, options) {
//   return;
// }

// export function waitUntil(callback, options) {
//   return;
// }

export function settled() {
  return;
}

// export function isSettled() {
//   return;
// }

// export function getSettledState() {
//   return;
// }

// -   [Wait Helpers][22]
//     -   [waitFor][23]
//     -   [waitUntil][24]
//     -   [settled][25]
//     -   [isSettled][26]
//     -   [getSettledState][27]

// ### waitFor

// Used to wait for a particular selector to appear in the DOM. Due to the fact
// that it does not wait for general settledness, this is quite useful for testing
// interim DOM states (e.g. loading states, pending promises, etc).

// #### Parameters

// -   `selector` **[string][52]** the selector to wait for
// -   `options` **[Object][56]?** the options to be used (optional, default `{}`)
//     -   `options.timeout` **[number][62]** the time to wait (in ms) for a match (optional, default `1000`)
//     -   `options.count` **[number][62]** the number of elements that should match the provided selector (null means one or more) (optional, default `null`)

// Returns **[Promise][54]&lt;([Element][53] \| [Array][64]&lt;[Element][53]>)>** resolves when the element(s) appear on the page

// ### waitUntil

// Wait for the provided callback to return a truthy value.

// This does not leverage `settled()`, and as such can be used to manage async
// while _not_ settled (e.g. "loading" or "pending" states).

// #### Parameters

// -   `callback` **[Function][65]** the callback to use for testing when waiting should stop
// -   `options` **[Object][56]?** options used to override defaults (optional, default `{}`)
//     -   `options.timeout` **[number][62]** the maximum amount of time to wait (optional, default `1000`)
//     -   `options.timeoutMessage` **[string][52]** the message to use in the reject on timeout (optional, default `'waitUntil timed out'`)

// Returns **[Promise][54]** resolves with the callback value when it returns a truthy value

// ### settled

// Returns a promise that resolves when in a settled state (see `isSettled` for
// a definition of "settled state").

// Returns **[Promise][54]&lt;void>** resolves when settled

// ### isSettled

// Checks various settledness metrics (via `getSettledState()`) to determine if things are settled or not.

// Settled generally means that there are no pending timers, no pending waiters,
// no pending AJAX requests, and no current run loop. However, new settledness
// metrics may be added and used as they become available.

// Returns **[boolean][63]** `true` if settled, `false` otherwise

// ### getSettledState

// Check various settledness metrics, and return an object with the following properties:

// -   `hasRunLoop` - Checks if a run-loop has been started. If it has, this will
//     be `true` otherwise it will be `false`.
// -   `hasPendingTimers` - Checks if there are scheduled timers in the run-loop.
//     These pending timers are primarily registered by `Ember.run.schedule`. If
//     there are pending timers, this will be `true`, otherwise `false`.
// -   `hasPendingWaiters` - Checks if any registered test waiters are still
//     pending (e.g. the waiter returns `true`). If there are pending waiters,
//     this will be `true`, otherwise `false`.
// -   `hasPendingRequests` - Checks if there are pending AJAX requests (based on
//     `ajaxSend` / `ajaxComplete` events triggered by `jQuery.ajax`). If there
//     are pending requests, this will be `true`, otherwise `false`.
// -   `hasPendingTransitions` - Checks if there are pending route transitions. If the
//     router has not been instantiated / setup for the test yet this will return `null`,
//     if there are pending transitions, this will be `true`, otherwise `false`.
// -   `pendingRequestCount` - The count of pending AJAX requests.
// -   `debugInfo` - Debug information that's combined with info return from backburner's
//     getDebugInfo method.

// Returns **[Object][56]** object with properties for each of the metrics used to determine settledness
