import fireEvent from './fire-event.ts';
import { getElement, isFocusable } from './index.ts';

export function __blur__(element: HTMLElement | Element | Document | SVGElement): void {
  if (!isFocusable(element)) {
    throw new Error(`${element} is not focusable`);
  }

  const browserIsNotFocused = document.hasFocus && !document.hasFocus();

  // makes `document.activeElement` be `body`.
  // If the browser is focused, it also fires a blur event
  element.blur();

  // Chrome/Firefox does not trigger the `blur` event if the window
  // does not have focus. If the document does not have focus then
  // fire `blur` event via native event.
  if (browserIsNotFocused) {
    fireEvent(element, 'blur', { bubbles: false });
    fireEvent(element, 'focusout');
  }
}

export default function blur(target: Target = document.activeElement!): Promise<void> {
  const element = getElement(target);

  if (!element) {
    throw new Error(`Element not found when calling \`blur('${target}')\`.`);
  }

  __blur__(element);

  // return settled();
}
