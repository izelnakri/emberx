import { getElement, isFormControl, isContentEditable, guardForMaxlength } from './index';
import fireEvent from './fire-event';
import { __focus__ } from './focus';

/**
  Fill the provided text into the `value` property (or set `.innerHTML` when
  the target is a content editable element) then trigger `change` and `input`
  events on the specified target.
*/
export default function fillIn(target: Target, text: string): Promise<void> {
  if (!target) {
    throw new Error('Must pass an element or selector to `fillIn`.');
  }

  const element = getElement(target) as Element | HTMLElement;
  if (!element) {
    throw new Error(`Element not found when calling \`fillIn('${target}')\`.`);
  } else if (typeof text === 'undefined' || text === null) {
    throw new Error('Must provide `text` when calling `fillIn`.');
  } else if (isFormControl(element)) {
    if (element.disabled) {
      throw new Error(`Can not \`fillIn\` disabled '${target}'.`);
    }

    if ('readOnly' in element && element.readOnly) {
      throw new Error(`Can not \`fillIn\` readonly '${target}'.`);
    }

    guardForMaxlength(element, text, 'fillIn');

    __focus__(element);

    element.value = text;
  } else if (isContentEditable(element)) {
    __focus__(element);

    element.innerHTML = text;
  } else {
    throw new Error('`fillIn` is only usable on form controls or contenteditable elements.');
  }

  fireEvent(element, 'input');
  fireEvent(element, 'change');

  // return settled();
}
