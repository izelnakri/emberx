/**
 * Where an error the app throws while a test drives it goes: in an `@action`
 * an event ran, or in the promise of an async one, which settled() waits for.
 * Without a handler it fails the helper that caused it; with one, as Ember's
 * setupOnerror sets, the test asserts on it instead:
 *
 *   setupOnerror((error) => assert.equal(error.message, 'Not allowed'));
 *   await click('[data-test-delete]');
 */
import { setOnerror } from '@emberx/component';

let handler: ((error: unknown) => void) | undefined;
/** What `@action`s threw since settled() last looked. */
const THROWN: unknown[] = [];

/** Sends the errors the app throws to `onerror` until resetOnerror(), which each test's teardown calls. */
export function setupOnerror(onerror: (error: unknown) => void): void {
  handler = onerror;
}

export function resetOnerror(): void {
  handler = undefined;
}

/** Catches what `@action`s throw, for settled() to report, while a test runs. */
export function catchActionErrors(): void {
  setOnerror((error) => THROWN.push(error));
}

export function stopCatchingActionErrors(): void {
  setOnerror(undefined);
  THROWN.length = 0;
}

/** Reports what `@action`s threw since the last call. */
export function reportThrownErrors(): void {
  THROWN.splice(0).forEach(reportError);
}

/** Gives `error` to the handler setupOnerror() set, or throws it. */
export function reportError(error: unknown): void {
  if (!handler) throw error;

  handler(error);
}
