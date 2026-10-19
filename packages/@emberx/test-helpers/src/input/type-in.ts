import { settled } from '../wait.ts';
import {
  findTarget,
  guardForMaxlength,
  isContentEditable,
  isDocument,
  isFormControl,
  type FormControl,
  type HTMLElementContentEditable,
  type Target,
} from './dom.ts';
import fireEvent from './fire-event.ts';
import { focusElement } from './focus.ts';
import { keyEvent } from './trigger-key-event.ts';

interface TypeInOptions {
  /** The milliseconds between one character and the next: 50 by default. */
  delay?: number;
}

/**
 * Types `text` into `target`, a form control or a contenteditable element, one
 * character at a time: `keydown`, `keypress`, the character added, `input` and
 * `keyup` for each, then `change`. fillIn sets the whole text at once instead.
 */
export default async function typeIn(target: Target, text: string, options: TypeInOptions = {}): Promise<void> {
  const element = findTarget('typeIn', target, { disabled: false });

  if (isDocument(element) || (!isFormControl(element) && !isContentEditable(element))) {
    throw new Error('`typeIn` is only usable on form controls or contenteditable elements.');
  } else if (text === undefined || text === null) {
    throw new Error('Must provide `text` when calling `typeIn`.');
  } else if (isFormControl(element)) {
    if (element.disabled) throw new Error(`Can not \`typeIn\` disabled '${target}'.`);
    if ('readOnly' in element && element.readOnly) throw new Error(`Can not \`typeIn\` readonly '${target}'.`);
  }

  focusElement(element);
  for (const character of text) {
    await new Promise((resolve) => setTimeout(resolve, options.delay ?? 50));
    typeCharacter(element, character);
  }
  fireEvent(element, 'change');

  await settled();
}

function typeCharacter(element: FormControl | HTMLElementContentEditable, character: string): void {
  const key = character.toUpperCase();
  const modifiers = { shiftKey: character === key && character !== character.toLowerCase() };

  keyEvent(element, 'keydown', key, modifiers);
  keyEvent(element, 'keypress', key, modifiers);
  if (isFormControl(element)) {
    guardForMaxlength(element, element.value + character, 'typeIn');
    element.value += character;
  } else {
    element.innerHTML += character;
  }
  fireEvent(element, 'input');
  keyEvent(element, 'keyup', key, modifiers);
}
