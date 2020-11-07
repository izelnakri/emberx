import { getElement, isFormControl, fireEvent, nodeQuery, isFocusable } from './index.ts';
import fireEvent from './fire-event.ts';

export function __click__(element: Element | Document, options: MouseEventInit): void {
  fireEvent(element, 'mousedown', options);

  if (isFocusable(element)) {
    __focus__(element);
  }

  fireEvent(element, 'mouseup', options);
  fireEvent(element, 'click', options);
}

export default async function (target: nodeQuery): Promise<void> {
  if (!target) {
    throw new Error('Must pass an element or selector to `click`.');
  }

  const element = getElement(target);

  if (!element) {
    throw new Error(`Element not found when calling \`click('${target}')\`.`);
  } else if (isFormControl(element) && element.disabled) {
    throw new Error(`Can not \`click\` disabled ${element}`);
  }

  __click__(element, options);

  // return settled();
}
