import { settled } from '../wait.ts';
import { findTarget, isFocusable, type Target } from './dom.ts';
import fireEvent from './fire-event.ts';

type Focusable = Element | Document;

/** Focuses `target`, blurring what had the focus, with the events a user's focus fires. */
export default async function focus(target: Target): Promise<void> {
  const element = findTarget('focus', target, { disabled: false });
  if (!isFocusable(element)) throw new Error(`${element} is not focusable`);

  focusElement(element);

  await settled();
}

/**
 * What focusing `element` does in a browser: the previously focused element
 * blurs, then `focus` and `focusin` fire on it. Focusing what cannot take the
 * focus only blurs the previous element.
 */
export function focusElement(element: Focusable): void {
  const { activeElement } = document;
  const previous = activeElement && activeElement !== element && isFocusable(activeElement) ? activeElement : null;

  if (!isFocusable(element)) {
    if (previous) blurElement(previous, null);
    return;
  }

  // A browser whose window has no focus fires no focus events of its own, so they are fired here instead.
  const browserIsNotFocused = !document.hasFocus();
  if (previous && browserIsNotFocused) blurElement(previous, element);

  element.focus();

  if (browserIsNotFocused) {
    fireEvent(element, 'focus', { bubbles: false });
    fireEvent(element, 'focusin');
  }
}

/** What unfocusing `element` does in a browser: `blur` and `focusout`, which name `relatedTarget`, if any. */
export function blurElement(element: Focusable, relatedTarget: Focusable | null = null): void {
  if (!isFocusable(element)) throw new Error(`${element} is not focusable`);

  // A browser whose window has no focus fires no blur events of its own, nor does blur() name a relatedTarget.
  const browserIsNotFocused = !document.hasFocus();
  if (relatedTarget === null) element.blur();

  if (browserIsNotFocused || relatedTarget !== null) {
    fireEvent(element, 'blur', { bubbles: false, relatedTarget });
    fireEvent(element, 'focusout', { relatedTarget });
  }
}
