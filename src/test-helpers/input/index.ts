// import click from './click';

type inputElement = string; // or DomNode

export async function blur(element: inputElement): Promise<void> {
  if (!isFocusable(element)) {
    throw new Error(`${target} is not focusable`);
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

export async function click(target: inputElement): Promise<void> {
  if (!target) {
    throw new Error('Must pass an element or selector to `click`.');
  }

  const element = getElement(target);

  if (!element) {
    throw new Error(`Element not found when calling \`click('${target}')\`.`);
  }

  const isDisabledFormControl = isFormControl(element) && element.disabled;

  if (!isDisabledFormControl) {
    fireEvent(element, 'mousedown', options);
    if (isFocusable(element)) {
      __focus__(element);
    }
    fireEvent(element, 'mouseup', options);
    fireEvent(element, 'click', options);
  }

  // return settled();
}

export async function doubleClick(element: inputElement): Promise<void> {
  fireEvent(element, 'mousedown', options);
  if (isFocusable(element)) {
    __focus__(element);
  }
  fireEvent(element, 'mouseup', options);
  fireEvent(element, 'click', options);
  fireEvent(element, 'mousedown', options);
  fireEvent(element, 'mouseup', options);
  fireEvent(element, 'click', options);
  fireEvent(element, 'dblclick', options);
  // NOTE: await settled();
}

export async function fillIn(element: inputElement, value: string): Promise<void> {
  return;
}

export async function typeIn(element: inputElement, value: string): Promise<void> {
  return;
}

export async function focus(element: inputElement): Promise<void> {
  return;
}

export async function tap(element: inputElement): Promise<void> {
  return;
}

export async function triggerEvent(element: inputElement): Promise<void> {
  return;
}

export async function triggerKeyEvent(element: inputElement): Promise<void> {
  return;
}

export default {
  blur,
  click,
  doubleClick,
  fillIn,
  typeIn,
  focus,
  tap,
  triggerEvent,
  triggerKeyEvent,
};
