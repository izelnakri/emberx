import { settled } from '../wait.ts';
import { findTarget, isElement, type Target } from './dom.ts';
import fireEvent from './fire-event.ts';

/** Scrolls `target` to `x` and `y`, then fires `scroll`: `scrollTo('#feed', 0, 100)`. */
export default async function scrollTo(target: Target, x: number, y: number): Promise<void> {
  if (!target) throw new Error('Must pass an element or selector to `scrollTo`.');
  if (x === undefined || y === undefined) throw new Error('Must pass both x and y coordinates to `scrollTo`.');

  const element = findTarget('scrollTo', target, { disabled: false });
  if (!isElement(element)) {
    throw new Error(
      `"target" must be an element, but was a ${element.nodeType} when calling \`scrollTo('${target}')\`.`,
    );
  }

  element.scrollTop = y;
  element.scrollLeft = x;
  fireEvent(element, 'scroll');

  await settled();
}
