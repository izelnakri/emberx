import inputs from 'browser-inputs';

export type Lit = string | number | boolean | undefined | null | void | {};
export function tuple<T extends Lit[]>(...args: T) {
  return args;
}

export const MOUSE_EVENT_TYPES = tuple(
  'click',
  'mousedown',
  'mouseup',
  'dblclick',
  'mouseenter',
  'mouseleave',
  'mousemove',
  'mouseout',
  'mouseover'
);
export const KEYBOARD_EVENT_TYPES = tuple('keydown', 'keypress', 'keyup');
export type MouseEventType = typeof MOUSE_EVENT_TYPES[number];
export type KeyboardEventType = typeof KEYBOARD_EVENT_TYPES[number];

function fireEvent(
  element: Element | Document | Window,
  eventType: KeyboardEventType,
  options?: any
): Event;
function fireEvent(
  element: Element | Document | Window,
  eventType: MouseEventType,
  options?: any
): Event | void;
function fireEvent(element: Element | Document | Window, eventType: string, options?: any): Event;
function fireEvent(
  element: Element | Document | Window,
  eventType: string,
  options = {}
): Event | void {
  return inputs.fireEvent(element, eventType, options);
}

export default fireEvent;
