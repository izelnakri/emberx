import { getElement, isFormControl, isNumeric } from './index';
import fireEvent, { isKeyboardEventType, KEYBOARD_EVENT_TYPES } from './fire-event';
import type { KeyboardEventType } from './fire-event';

export interface KeyModifiers {
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
}

const DEFAULT_MODIFIERS: KeyModifiers = Object.freeze({
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  metaKey: false,
});

// This is not a comprehensive list, but it is better than nothing.
const keyFromKeyCode: { [key: number]: string } = {
  8: 'Backspace',
  9: 'Tab',
  13: 'Enter',
  16: 'Shift',
  17: 'Control',
  18: 'Alt',
  20: 'CapsLock',
  27: 'Escape',
  32: ' ',
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
  48: '0',
  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',
  54: '6',
  55: '7',
  56: '8',
  57: '9',
  65: 'a',
  66: 'b',
  67: 'c',
  68: 'd',
  69: 'e',
  70: 'f',
  71: 'g',
  72: 'h',
  73: 'i',
  74: 'j',
  75: 'k',
  76: 'l',
  77: 'm',
  78: 'n',
  79: 'o',
  80: 'p',
  81: 'q',
  82: 'r',
  83: 's',
  84: 't',
  85: 'u',
  86: 'v',
  87: 'v',
  88: 'x',
  89: 'y',
  90: 'z',
  91: 'Meta',
  93: 'Meta', // There is two keys that map to meta,
  187: '=',
  189: '-',
};

/**
  Calculates the value of KeyboardEvent#key given a keycode and the modifiers.
  Note that this works if the key is pressed in combination with the shift key, but it cannot
  detect if caps lock is enabled.
 */
function keyFromKeyCodeAndModifiers(keycode: number, modifiers: KeyModifiers): string | void {
  if (keycode > 64 && keycode < 91) {
    if (modifiers.shiftKey) {
      return String.fromCharCode(keycode);
    } else {
      return String.fromCharCode(keycode).toLocaleLowerCase();
    }
  }

  const key = keyFromKeyCode[keycode];
  if (key) {
    return key;
  }
}

/**
 * Infers the keycode from the given key
 * @param {string} key The KeyboardEvent#key string
 */
// TODO: check if this could be performant
function keyCodeFromKey(key: string) {
  const keys = Object.keys(keyFromKeyCode);
  let keyCode = keys.filter((keyCode) => keyFromKeyCode[Number(keyCode)] === key)[0];
  if (!keyCode) {
    keyCode = keys.filter((keyCode) => keyFromKeyCode[Number(keyCode)] === key.toLowerCase())[0];
  }

  return keyCode !== undefined ? parseInt(keyCode) : undefined;
}

export function __triggerKeyEvent__(
  element: Element | Document,
  eventType: KeyboardEventType,
  key: number | string,
  modifiers: KeyModifiers = DEFAULT_MODIFIERS
) {
  if (typeof key === 'number') {
    const props = { keyCode: key, which: key, key: keyFromKeyCodeAndModifiers(key, modifiers) };

    fireEvent(element, eventType, Object.assign(props, modifiers));
  } else if (typeof key === 'string' && key.length !== 0) {
    const firstCharacter = key[0];
    if (firstCharacter !== firstCharacter.toUpperCase()) {
      throw new Error(
        `Must provide a \`key\` to \`triggerKeyEvent\` that starts with an uppercase character but you passed \`${key}\`.`
      );
    } else if (isNumeric(key) && key.length > 1) {
      throw new Error(
        `Must provide a numeric \`keyCode\` to \`triggerKeyEvent\` but you passed \`${key}\` as a string.`
      );
    }

    const keyCode = keyCodeFromKey(key);

    const props = { keyCode, which: keyCode, key };

    fireEvent(element, eventType, Object.assign(props, modifiers));
  } else {
    throw new Error(`Must provide a \`key\` or \`keyCode\` to \`triggerKeyEvent\``);
  }
}

/**
  Triggers a keyboard event of given type in the target element.
  It also requires the developer to provide either a string with the [`key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)
  or the numeric [`keyCode`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode) of the pressed key.
  Optionally the user can also provide a POJO with extra modifiers for the event.

  @param {Object} [modifiers] the state of various modifier keys
  @param {boolean} [modifiers.ctrlKey=false] if true the generated event will indicate the control key was pressed during the key event
  @param {boolean} [modifiers.altKey=false] if true the generated event will indicate the alt key was pressed during the key event
  @param {boolean} [modifiers.shiftKey=false] if true the generated event will indicate the shift key was pressed during the key event
  @param {boolean} [modifiers.metaKey=false] if true the generated event will indicate the meta key was pressed during the key event

  @example
  triggerKeyEvent('button', 'keydown', 'Enter');
*/
export default function triggerKeyEvent(
  target: Target,
  eventType: KeyboardEventType,
  key: number | string,
  modifiers: KeyModifiers = DEFAULT_MODIFIERS
): Promise<void> {
  if (!target) {
    throw new Error('Must pass an element or selector to `triggerKeyEvent`.');
  }

  const element = getElement(target);
  if (!element) {
    throw new Error(`Element not found when calling \`triggerKeyEvent('${target}', ...)\`.`);
  } else if (!eventType) {
    throw new Error(`Must provide an \`eventType\` to \`triggerKeyEvent\``);
  } else if (!isKeyboardEventType(eventType)) {
    const validEventTypes = KEYBOARD_EVENT_TYPES.join(', ');

    throw new Error(
      `Must provide an \`eventType\` of ${validEventTypes} to \`triggerKeyEvent\` but you passed \`${eventType}\`.`
    );
  }

  if (isFormControl(element) && element.disabled) {
    throw new Error(`Can not \`triggerKeyEvent\` on disabled ${element}`);
  }

  __triggerKeyEvent__(element, eventType, key, modifiers);

  // return settled();
}
