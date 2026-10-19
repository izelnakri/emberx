import { settled } from '../wait.ts';
import { getElement, isFormControl, type Target } from './dom.ts';
import fireEvent from './fire-event.ts';

/**
 * Fires an event of `eventType` on `target`, or on the window, with `options`
 * as its properties.
 *
 * A file input takes the files a user picked as `change` with
 * `{ files: [new File(['Ember Rules!'], 'ember-rules.txt')] }`, and a drop zone
 * a dropped file as `drop` with `{ dataTransfer: { files: [...] } }`.
 */
export default async function triggerEvent(target: Target, eventType: string, options?: object): Promise<void> {
  if (!target) throw new Error('Must pass an element or selector to `triggerEvent`.');
  if (!eventType) throw new Error(`Must provide an \`eventType\` to \`triggerEvent\``);

  const element = target instanceof Window ? target : getElement(target);
  if (!element) throw new Error(`Element not found when calling \`triggerEvent('${target}', ...)\`.`);
  if (isFormControl(element) && element.disabled) throw new Error(`Can not \`triggerEvent\` on disabled ${element}`);

  fireEvent(element, eventType, options);

  await settled();
}
