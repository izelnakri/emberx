import { getElement, isSelectElement } from './index';
import { __focus__ } from './focus';
import fireEvent from './fire-event';

/**
  Set the `selected` property true for the provided option the target is a
  select element (or set the select property true for multiple options if the
  multiple attribute is set true on the HTMLSelectElement) then trigger
  `change` and `input` events on the specified target.

  @example
  <caption>
    Emulating selecting an option or multiple options using `select`
  </caption>

  select('select', 'apple');
  select('select', ['apple', 'orange']);
  select('select', ['apple', 'orange'], true);
*/
export default function select(
  target: Target,
  options: string | string[],
  keepPreviouslySelected = false
): Promise<void> {
  if (!target) {
    throw new Error('Must pass an element or selector to `select`.');
  } else if (typeof options === 'undefined' || options === null) {
    throw new Error('Must provide an `option` or `options` to select when calling `select`.');
  }

  const element = getElement(target);
  if (!element) {
    throw new Error(`Element not found when calling \`select('${target}')\`.`);
  } else if (!isSelectElement(element)) {
    throw new Error(`Element is not a HTMLSelectElement when calling \`select('${target}')\`.`);
  } else if (element.disabled) {
    throw new Error(`Element is disabled when calling \`select('${target}')\`.`);
  }

  options = Array.isArray(options) ? options : [options];

  if (!element.multiple && options.length > 1) {
    throw new Error(
      `HTMLSelectElement \`multiple\` attribute is set to \`false\` but multiple options were passed when calling \`select('${target}')\`.`
    );
  }

  __focus__(element);

  for (let i = 0; i < element.options.length; i++) {
    const elementOption = element.options.item(i);

    if (elementOption) {
      if (options.indexOf(elementOption.value) > -1) {
        elementOption.selected = true;
      } else if (!keepPreviouslySelected) {
        elementOption.selected = false;
      }
    }
  }

  fireEvent(element, 'input');
  fireEvent(element, 'change');

  // return settled();
}
