import { settled } from '../wait.ts';
import { findTarget, isSelectElement, type Target } from './dom.ts';
import fireEvent from './fire-event.ts';
import { focusElement } from './focus.ts';

/**
 * Selects the option, or options for a `multiple` select, whose value is
 * `options`, deselecting the others unless `keepPreviouslySelected`, then
 * fires `input` and `change`.
 */
export default async function select(
  target: Target,
  options: string | string[],
  keepPreviouslySelected = false,
): Promise<void> {
  if (!target) throw new Error('Must pass an element or selector to `select`.');
  if (options === undefined || options === null) {
    throw new Error('Must provide an `option` or `options` to select when calling `select`.');
  }

  const element = findTarget('select', target, { disabled: false });
  const values = Array.isArray(options) ? options : [options];

  if (!isSelectElement(element)) {
    throw new Error(`Element is not a HTMLSelectElement when calling \`select('${target}')\`.`);
  } else if (element.disabled) {
    throw new Error(`Element is disabled when calling \`select('${target}')\`.`);
  } else if (!element.multiple && values.length > 1) {
    throw new Error(
      `HTMLSelectElement \`multiple\` attribute is set to \`false\` but multiple options were passed when calling \`select('${target}')\`.`,
    );
  }

  focusElement(element);
  for (const option of element.options) {
    if (values.includes(option.value)) option.selected = true;
    else if (!keepPreviouslySelected) option.selected = false;
  }
  fireEvent(element, 'input');
  fireEvent(element, 'change');

  await settled();
}
