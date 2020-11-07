import { getElement, isElement } from './index';
import fireEvent from './fire-event';

/**
  Scrolls DOM element or selector to the given coordinates.

  scrollTo('#my-long-div', 0, 0); // scroll to top
  scrollTo('#my-long-div', 0, 100); // scroll down
*/
export default function scrollTo(
  target: string | HTMLElement,
  x: number,
  y: number
): Promise<void> {
  if (!target) {
    throw new Error('Must pass an element or selector to `scrollTo`.');
  } else if (x === undefined || y === undefined) {
    throw new Error('Must pass both x and y coordinates to `scrollTo`.');
  }

  const element = getElement(target);
  if (!element) {
    throw new Error(`Element not found when calling \`scrollTo('${target}')\`.`);
  } else if (!isElement(element)) {
    throw new Error(
      `"target" must be an element, but was a ${element.nodeType} when calling \`scrollTo('${target}')\`.`
    );
  }

  element.scrollTop = y;
  element.scrollLeft = x;

  fireEvent(element, 'scroll');

  // return settled();
}
