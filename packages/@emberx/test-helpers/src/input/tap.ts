import { settled } from '../wait.ts';
import { clickElement } from './click.ts';
import { findTarget, type Target } from './dom.ts';
import fireEvent from './fire-event.ts';

/** Taps `target`: `touchstart`, `touchend`, then a click, unless either touch event's default was prevented. */
export default async function tap(target: Target, options: object = {}): Promise<void> {
  const element = findTarget('tap', target);
  const touchstart = fireEvent(element, 'touchstart', options);
  const touchend = fireEvent(element, 'touchend', options);

  if (!touchstart.defaultPrevented && !touchend.defaultPrevented) clickElement(element, options);

  await settled();
}
