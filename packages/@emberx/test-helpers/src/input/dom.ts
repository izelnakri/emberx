/**
 * What the input helpers share: finding their target, and telling what kind of
 * element it is. From @ember/test-helpers, by way of browser-inputs, which
 * these helpers were built on.
 */

/** An element, or a selector for one; triggerEvent also takes the window. */
export type Target = string | Element | Document | Window;
export type FormControl = HTMLInputElement | HTMLButtonElement | HTMLSelectElement | HTMLTextAreaElement;
export interface HTMLElementContentEditable extends HTMLElement {
  isContentEditable: true;
}

export const MOUSE_EVENT_TYPES = [
  'click',
  'mousedown',
  'mouseup',
  'dblclick',
  'mouseenter',
  'mouseleave',
  'mousemove',
  'mouseout',
  'mouseover',
] as const;
export const KEYBOARD_EVENT_TYPES = ['keydown', 'keypress', 'keyup'] as const;
export type MouseEventType = (typeof MOUSE_EVENT_TYPES)[number];
export type KeyboardEventType = (typeof KEYBOARD_EVENT_TYPES)[number];

const FORM_CONTROL_TAGS = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'];
// The input types maxlength applies to: https://html.spec.whatwg.org/multipage/input.html#concept-input-apply
const MAXLENGTH_INPUT_TYPES = ['text', 'search', 'url', 'tel', 'email', 'password'];

/** The element `target` is, or the first one its selector matches. */
export function getElement(target: Target): Element | Document | null {
  if ((target as Element).nodeName) return target as Element | Document;
  if (!target || typeof target !== 'string') throw new Error('Must use an element or a selector string');

  return document.querySelector(target);
}

/**
 * The element `target` names, which a helper `name`d as such goes on to act on;
 * one that a disabled form control cannot take throws for it.
 */
export function findTarget(name: string, target: Target, { disabled = true } = {}): Element | Document {
  if (!target) throw new Error(`Must pass an element or selector to \`${name}\`.`);

  const element = getElement(target);
  if (!element) throw new Error(`Element not found when calling \`${name}('${target}')\`.`);
  if (disabled && isFormControl(element) && element.disabled) {
    throw new Error(`Can not \`${name}\` disabled ${element}`);
  }
  return element;
}

export function isWindow(target: unknown): target is Window {
  return target instanceof Window;
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

export function isContentEditable(element: Element | Document): element is HTMLElementContentEditable {
  return 'isContentEditable' in element && (element as HTMLElement).isContentEditable;
}

export function isFormControl(element: Element | Document | Window): element is FormControl {
  return (
    !isDocument(element) &&
    !isWindow(element) &&
    FORM_CONTROL_TAGS.includes(element.tagName) &&
    (element as HTMLInputElement).type !== 'hidden'
  );
}

export function isFocusable(element: Element | Document): element is HTMLElement | SVGElement {
  if (isDocument(element)) return false;
  if (isFormControl(element)) return !element.disabled;

  return isContentEditable(element) || element.tagName === 'A' || element.hasAttribute('tabindex');
}

export function isKeyboardEventType(eventType: unknown): eventType is KeyboardEventType {
  return KEYBOARD_EVENT_TYPES.includes(eventType as KeyboardEventType);
}

export function isMouseEventType(eventType: unknown): eventType is MouseEventType {
  return MOUSE_EVENT_TYPES.includes(eventType as MouseEventType);
}

export function isNumeric(input: string): boolean {
  return !isNaN(parseFloat(input)) && isFinite(Number(input));
}

/** Throws when `text` is longer than the maxlength `element` enforces. */
export function guardForMaxlength(element: FormControl, text: string, helper: string): void {
  const maxlength = element.getAttribute('maxlength');
  if (isMaxlengthConstrained(element) && maxlength && text && text.length > Number(maxlength)) {
    throw new Error(`Can not \`${helper}\` with text: '${text}' that exceeds maxlength: '${maxlength}'.`);
  }
}

function isMaxlengthConstrained(element: Element): element is HTMLInputElement | HTMLTextAreaElement {
  return (
    !!Number(element.getAttribute('maxLength')) &&
    (element instanceof HTMLTextAreaElement ||
      (element instanceof HTMLInputElement && MAXLENGTH_INPUT_TYPES.includes(element.type)))
  );
}
