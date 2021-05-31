import { didRender, getAsyncActionsQueue } from '@emberx/component';
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

// NOTE: build a new waiting system? (Should only have route transition and request waiting?
export async function settled() {
  await Promise.all(getAsyncActionsQueue());
  await didRender();
}

export async function wait(timeout: number = 500): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(() => resolve(null), timeout);
  });
}

// export function isSettled() {
//   return;
// }

// export function getSettledState() {
//   return;
