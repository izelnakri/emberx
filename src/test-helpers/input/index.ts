import click from './click';
import blur from './blur';
import focus from './focus';
import doubleClick from './double-click';

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

export function isElement(target: any): target is Element {
  return target.nodeType === Node.ELEMENT_NODE;
}

export function isDocument(target: any): target is Document {
  return target.nodeType === Node.DOCUMENT_NODE;
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

export async function fillIn(element: inputElement, value: string): Promise<void> {
  return;
}

export async function typeIn(element: inputElement, value: string): Promise<void> {
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
