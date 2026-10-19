import { settled } from '../wait.ts';
import { findTarget, guardForMaxlength, isContentEditable, isFormControl, type Target } from './dom.ts';
import fireEvent from './fire-event.ts';
import { focusElement } from './focus.ts';

/**
 * Fills `text` into `target`, a form control's `value` or a contenteditable
 * element's HTML, then fires `input` and `change`.
 */
export default async function fillIn(target: Target, text: string): Promise<void> {
  const element = findTarget('fillIn', target, { disabled: false });

  if (text === undefined || text === null) throw new Error('Must provide `text` when calling `fillIn`.');
  if (isFormControl(element)) {
    if (element.disabled) throw new Error(`Can not \`fillIn\` disabled '${target}'.`);
    if ('readOnly' in element && element.readOnly) throw new Error(`Can not \`fillIn\` readonly '${target}'.`);

    guardForMaxlength(element, text, 'fillIn');
    focusElement(element);
    element.value = text;
  } else if (isContentEditable(element)) {
    focusElement(element);
    element.innerHTML = text;
  } else {
    throw new Error('`fillIn` is only usable on form controls or contenteditable elements.');
  }

  fireEvent(element, 'input');
  fireEvent(element, 'change');

  await settled();
}
