import blur from './blur';
import click from './click';
import doubleClick from './double-click';
import fillIn from './fill-in';
import fireEvent from './fire-event';
import focus from './focus';
import scrollTo from './scroll-to';
import select from './select';
import tap from './tap';
import triggerEvent from './trigger-event';
import triggerKeyEvent from './trigger-key-event';
import typeIn from './type-in';

export type nodeQuery = string | HTMLElement; // or DomNode
export type FocusableElement = HTMLAnchorElement;
export type FormControl =
  | HTMLInputElement
  | HTMLButtonElement
  | HTMLSelectElement
  | HTMLTextAreaElement;
export interface HTMLElementContentEditable extends HTMLElement {
  isContentEditable: true;
}

export function getElement(target: nodeQuery): undefined | HTMLElement {
  if (!target) {
    return target as undefined;
  } else if ((target as HTMLElement).nodeName) {
    return target as HTMLElement;
  }

  return document.querySelector(target as string);
}

export function isNumeric(input: string): boolean {
  return !isNaN(parseFloat(input)) && isFinite(Number(input));
}

export function isElement(target: any): target is Element {
  return target.nodeType === Node.ELEMENT_NODE;
}

export function isDocument(target: any): target is Document {
  return target.nodeType === Node.DOCUMENT_NODE;
}

export function isSelectElement(element: Element | Document): element is HTMLSelectElement {
  return !isDocument(element) && element.tagName === 'SELECT';
}

export function isContentEditable(element: Element): element is HTMLElementContentEditable {
  return 'isContentEditable' in element && (element as HTMLElement).isContentEditable;
}

const FORM_CONTROL_TAGS = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'];

export function isFormControl(element: Element | Document): element is FormControl {
  return (
    !isDocument(element) &&
    FORM_CONTROL_TAGS.indexOf(element.tagName) > -1 &&
    (element as HTMLInputElement).type !== 'hidden'
  );
}

const FOCUSABLE_TAGS = ['A'];

function isFocusableElement(element: Element): element is FocusableElement {
  return FOCUSABLE_TAGS.indexOf(element.tagName) > -1;
}

export function isFocusable(
  element: HTMLElement | SVGElement | Element | Document
): element is HTMLElement | SVGElement {
  if (isDocument(element)) {
    return false;
  }

  if (isFormControl(element)) {
    return !element.disabled;
  }

  if (isContentEditable(element) || isFocusableElement(element)) {
    return true;
  }

  return element.hasAttribute('tabindex');
}

// ref: https://html.spec.whatwg.org/multipage/input.html#concept-input-apply
const constrainedInputTypes = ['text', 'search', 'url', 'tel', 'email', 'password'];

function isMaxLengthConstrained(
  element: Element
): element is HTMLInputElement | HTMLTextAreaElement {
  return (
    !!Number(element.getAttribute('maxLength')) &&
    (element instanceof HTMLInputElement ||
      (element instanceof HTMLTextAreaElement && constrainedInputTypes.indexOf(element.type) > -1))
  );
}

export function guardForMaxlength(element: FormControl, text: string, testHelper: string): void {
  const maxlength = element.getAttribute('maxlength');
  if (isMaxLengthConstrained(element) && maxlength && text && text.length > Number(maxlength)) {
    throw new Error(
      `Can not \`${testHelper}\` with text: '${text}' that exceeds maxlength: '${maxlength}'.`
    );
  }
}

export {
  blur,
  click,
  doubleClick,
  fillIn,
  fireEvent,
  focus,
  scrollTo,
  select,
  tap,
  triggerEvent,
  triggerKeyEvent,
  typeIn,
};

export default {
  blur,
  click,
  doubleClick,
  fillIn,
  fireEvent,
  focus,
  scrollTo,
  select,
  tap,
  triggerEvent,
  triggerKeyEvent,
  typeIn,
};
