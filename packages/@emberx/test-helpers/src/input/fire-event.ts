import { isDocument, isElement, isKeyboardEventType, isMouseEventType } from './dom.ts';
import type { KeyboardEventType, MouseEventType } from './dom.ts';

export type { KeyboardEventType, MouseEventType } from './dom.ts';

const DEFAULT_EVENT_OPTIONS = { bubbles: true, cancelable: true };

/**
 * Dispatches an event of `eventType` on `element`, as a browser would build it:
 * a KeyboardEvent, a MouseEvent at the element's top left corner, a `change`
 * that selects `options.files` on a file input, or a plain Event. Returns the
 * event, unless `element` is something a mouse cannot point at.
 */
function fireEvent(element: Element | Document | Window, eventType: KeyboardEventType, options?: any): Event;
function fireEvent(element: Element | Document | Window, eventType: MouseEventType, options?: any): Event | void;
function fireEvent(element: Element | Document | Window, eventType: string, options?: any): Event;
function fireEvent(element: Element | Document | Window, eventType: string, options: any = {}): Event | void {
  if (!element) throw new Error('Must pass an element to `fireEvent`');

  const event = buildEvent(element, eventType, options);
  if (!event) return;

  element.dispatchEvent(event);
  return event;
}

export default fireEvent;

function buildEvent(element: Element | Document | Window, eventType: string, options: any): Event | void {
  if (isKeyboardEventType(eventType)) return buildKeyboardEvent(eventType, options);
  if (isMouseEventType(eventType)) {
    const rect = boundingRect(element);
    if (!rect) return;

    const x = rect.left + 1;
    const y = rect.top + 1;
    // The screen coordinates mean nothing; they only differ from the client ones, as they would.
    return new MouseEvent(eventType, {
      view: window,
      ...DEFAULT_EVENT_OPTIONS,
      screenX: x + 5,
      screenY: y + 95,
      clientX: x,
      clientY: y,
      ...options,
    });
  } else if (eventType === 'change' && (element as HTMLInputElement).files) {
    return buildFileEvent(element as HTMLInputElement, options);
  }
  return buildBasicEvent(eventType, options);
}

function boundingRect(element: Element | Document | Window): DOMRect | void {
  if (element instanceof Window) return element.document.documentElement.getBoundingClientRect();
  if (isDocument(element)) return element.documentElement.getBoundingClientRect();
  if (isElement(element)) return element.getBoundingClientRect();
}

// The window's Event: under node, the global one is node's own, which a DOM element does not dispatch.
function buildBasicEvent(type: string, { bubbles = true, cancelable = true, ...properties }: any = {}): Event {
  return Object.assign(new window.Event(type, { bubbles, cancelable }), properties);
}

function buildKeyboardEvent(type: KeyboardEventType, options: any): KeyboardEvent {
  const eventOptions = { ...DEFAULT_EVENT_OPTIONS, ...options };
  const event = new KeyboardEvent(type, eventOptions);

  // KeyboardEventInit takes neither: without them keyCode and which are 0, where code compares them to numbers.
  Object.defineProperty(event, 'keyCode', { get: () => parseInt(eventOptions.keyCode) });
  Object.defineProperty(event, 'which', { get: () => parseInt(eventOptions.which) });

  return event;
}

function buildFileEvent(element: HTMLInputElement, options: any): Event {
  if (Array.isArray(options)) {
    throw new Error(
      'Please pass an object with a files array to `triggerEvent` instead of passing the `options` param as an array to.',
    );
  }

  const event = buildBasicEvent('change');
  const files = options.files;

  if (Array.isArray(files)) {
    Object.defineProperty(files, 'item', {
      value(index: number) {
        return typeof index === 'number' ? this[index] : null;
      },
      configurable: true,
    });
    Object.defineProperty(element, 'files', { value: files, configurable: true });

    const valueProperty = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')!;
    Object.defineProperty(element, 'value', {
      configurable: true,
      get() {
        return valueProperty.get!.call(element);
      },
      set(value) {
        valueProperty.set!.call(element, value);
        // Only an empty value gets here: the setter throws for any other.
        Object.defineProperty(element, 'files', { configurable: true, value: [] });
      },
    });
  }

  Object.defineProperty(event, 'target', { value: element });

  return event;
}
