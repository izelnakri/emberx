function buildBasicEvent(type, options = {}) {
  const event = document.createEvent('Events');
  const bubbles = options.bubbles !== undefined ? options.bubbles : true;
  const cancelable = options.cancelable !== undefined ? options.cancelable : true;

  delete options.bubbles;
  delete options.cancelable;

  // bubbles and cancelable are readonly, so they can be set when initializing event
  event.initEvent(type, bubbles, cancelable);

  Object.assign(event, options);

  return event;
}

function buildMouseEvent(type, options = {}) {
  let event;
  const eventOpts = Object.assign({ view: window }, DEFAULT_EVENT_OPTIONS, options);

  if (MOUSE_EVENT_CONSTRUCTOR) {
    event = new MouseEvent(type, eventOpts);
  } else {
    try {
      event = document.createEvent('MouseEvents');
      event.initMouseEvent(
        type,
        eventOpts.bubbles,
        eventOpts.cancelable,
        window,
        eventOpts.detail,
        eventOpts.screenX,
        eventOpts.screenY,
        eventOpts.clientX,
        eventOpts.clientY,
        eventOpts.ctrlKey,
        eventOpts.altKey,
        eventOpts.shiftKey,
        eventOpts.metaKey,
        eventOpts.button,
        eventOpts.relatedTarget
      );
    } catch (e) {
      event = buildBasicEvent(type, options);
    }
  }
  return event;
}

function buildKeyboardEvent(type, options = {}) {
  const eventOpts = assign({}, DEFAULT_EVENT_OPTIONS, options);
  let event;
  let eventMethodName;
  try {
    event = new KeyboardEvent(type, eventOpts);
    // Property definitions are required for B/C for keyboard event usage
    // If this properties are not defined, when listening for key events
    // keyCode/which will be 0. Also, keyCode and which now are string
    // and if app compare it with === with integer key definitions,
    // there will be a fail.
    //
    // https://w3c.github.io/uievents/#interface-keyboardevent
    // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
    Object.defineProperty(event, 'keyCode', {
      get() {
        return parseInt(eventOpts.keyCode);
      },
    });
    Object.defineProperty(event, 'which', {
      get() {
        return parseInt(eventOpts.which);
      },
    });
    return event;
  } catch (e) {
    // left intentionally blank
  }
  try {
    event = document.createEvent('KeyboardEvents');
    eventMethodName = 'initKeyboardEvent';
  } catch (e) {
    // left intentionally blank
  }
  if (!event) {
    try {
      event = document.createEvent('KeyEvents');
      eventMethodName = 'initKeyEvent';
    } catch (e) {
      // left intentionally blank
    }
  }
  if (event && eventMethodName) {
    event[eventMethodName](
      type,
      eventOpts.bubbles,
      eventOpts.cancelable,
      window,
      eventOpts.ctrlKey,
      eventOpts.altKey,
      eventOpts.shiftKey,
      eventOpts.metaKey,
      eventOpts.keyCode,
      eventOpts.charCode
    );
  } else {
    event = buildBasicEvent(type, options);
  }
  return event;
}

function buildFileEvent(type, element, options = {}) {
  const event = buildBasicEvent(type);
  const files = options.files;

  if (Array.isArray(files)) {
    Object.defineProperty(files, 'item', {
      value(index) {
        return typeof index === 'number' ? this[index] : null;
      },
    });
    Object.defineProperty(element, 'files', {
      value: files,
      configurable: true,
    });
  }
  Object.defineProperty(event, 'target', {
    value: element,
  });

  return event;
}

// =====================================================================
//
// =====================================================================

const FORM_CONTROL_TAGS = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'];

export default function isFormControl(element) {
  return (
    !isDocument(element) &&
    FORM_CONTROL_TAGS.indexOf(element.tagName) > -1 &&
    element.type !== 'hidden'
  );
}

export function isElement(target) {
  return target.nodeType === Node.ELEMENT_NODE;
}

export function isDocument(target) {
  return target.nodeType === Node.DOCUMENT_NODE;
}
