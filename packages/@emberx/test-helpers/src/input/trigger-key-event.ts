import { settled } from '../wait.ts';
import {
  KEYBOARD_EVENT_TYPES,
  findTarget,
  isFormControl,
  isKeyboardEventType,
  isNumeric,
  type KeyboardEventType,
  type Target,
} from './dom.ts';
import fireEvent from './fire-event.ts';

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

/** The keys a keyCode names, beyond the letters: not every one, but the ones tests press. */
const KEYS: Record<number, string> = {
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
  ...Object.fromEntries(Array.from({ length: 10 }, (_, digit) => [48 + digit, String(digit)])),
  ...Object.fromEntries(Array.from({ length: 26 }, (_, letter) => [65 + letter, String.fromCharCode(97 + letter)])),
  91: 'Meta',
  93: 'Meta',
  187: '=',
  189: '-',
};

/**
 * Fires a keyboard event of `eventType` (`keydown`, `keypress` or `keyup`) on
 * `target`, for the key a [`key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)
 * string (`'Enter'`) or a numeric `keyCode` (13) names, with `modifiers` held:
 * `triggerKeyEvent('input', 'keydown', 'Enter', { shiftKey: true })`.
 */
export default async function triggerKeyEvent(
  target: Target,
  eventType: KeyboardEventType,
  key: number | string,
  modifiers: KeyModifiers = DEFAULT_MODIFIERS,
): Promise<void> {
  if (!target) throw new Error('Must pass an element or selector to `triggerKeyEvent`.');

  const element = findTarget('triggerKeyEvent', target, { disabled: false });
  if (!eventType) {
    throw new Error(`Must provide an \`eventType\` to \`triggerKeyEvent\``);
  } else if (!isKeyboardEventType(eventType)) {
    throw new Error(
      `Must provide an \`eventType\` of ${KEYBOARD_EVENT_TYPES.join(', ')} to \`triggerKeyEvent\` but you passed \`${eventType}\`.`,
    );
  } else if (isFormControl(element) && element.disabled) {
    throw new Error(`Can not \`triggerKeyEvent\` on disabled ${element}`);
  }

  keyEvent(element, eventType, key, modifiers);

  await settled();
}

export function keyEvent(
  element: Element | Document,
  eventType: KeyboardEventType,
  key: number | string,
  modifiers: KeyModifiers = DEFAULT_MODIFIERS,
): void {
  if (typeof key === 'number') {
    fireEvent(element, eventType, { keyCode: key, which: key, key: keyFromKeyCode(key, modifiers), ...modifiers });
  } else if (typeof key === 'string' && key.length !== 0) {
    if (key[0] !== key[0].toUpperCase()) {
      throw new Error(
        `Must provide a \`key\` to \`triggerKeyEvent\` that starts with an uppercase character but you passed \`${key}\`.`,
      );
    } else if (isNumeric(key) && key.length > 1) {
      throw new Error(
        `Must provide a numeric \`keyCode\` to \`triggerKeyEvent\` but you passed \`${key}\` as a string.`,
      );
    }

    const keyCode = keyCodeFromKey(key);
    fireEvent(element, eventType, { keyCode, which: keyCode, key, ...modifiers });
  } else {
    throw new Error(`Must provide a \`key\` or \`keyCode\` to \`triggerKeyEvent\``);
  }
}

/** KeyboardEvent#key for a keyCode: a letter is upper case with shift held, though caps lock goes unseen. */
function keyFromKeyCode(keyCode: number, modifiers: KeyModifiers): string | undefined {
  const key = KEYS[keyCode];
  return keyCode >= 65 && keyCode <= 90 && modifiers.shiftKey ? key.toUpperCase() : key;
}

function keyCodeFromKey(key: string): number | undefined {
  const keyCodes = Object.keys(KEYS).map(Number);
  return (
    keyCodes.find((keyCode) => KEYS[keyCode] === key) ?? keyCodes.find((keyCode) => KEYS[keyCode] === key.toLowerCase())
  );
}
