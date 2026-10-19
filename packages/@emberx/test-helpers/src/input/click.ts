import { settled } from '../wait.ts';
import { findTarget, isWindow, type Target } from './dom.ts';
import fireEvent from './fire-event.ts';
import { focusElement } from './focus.ts';

/** The primary button, pressed. */
export const DEFAULT_CLICK_OPTIONS = { buttons: 1, button: 0 };

/**
 * Clicks `target`: `mousedown`, the focus moving to it, `mouseup` and `click`,
 * with `options` for the MouseEvents (`{ shiftKey: true }`).
 */
export default async function click(target: Target, options: MouseEventInit = {}): Promise<void> {
  clickElement(findTarget('click', target), { ...DEFAULT_CLICK_OPTIONS, ...options });

  await settled();
}

export function clickElement(element: Element | Document, options: MouseEventInit): void {
  fireEvent(element, 'mousedown', options);
  if (!isWindow(element)) focusElement(element);
  fireEvent(element, 'mouseup', options);
  fireEvent(element, 'click', options);
}
