import actions from 'qunit-action';

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
  return actions.fireEvent(element, eventType, options);
}

export default fireEvent;
