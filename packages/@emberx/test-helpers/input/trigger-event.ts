import { getElement, isFormControl } from './index';
import fireEvent from './fire-event';

/**
 * Triggers an event on the specified target.
 *
 * @example
 * Using `triggerEvent` to upload a file
 *
 * When using `triggerEvent` to upload a file the `eventType` must be `change` and you must pass the
 * `options` param as an object with a key `files` containing an array of
 * [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob).
 *
 * triggerEvent(
 *   'input.fileUpload',
 *   'change',
 *   { files: [new Blob(['Ember Rules!'])] }
 * );
 *
 * @example
 * Using `triggerEvent` to upload a dropped file
 *
 * When using `triggerEvent` to handle a dropped (via drag-and-drop) file, the `eventType` must be `drop`. Assuming your `drop` event handler uses the [DataTransfer API](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer),
 * you must pass the `options` param as an object with a key of `dataTransfer`. The `options.dataTransfer` object should have a `files` key, containing an array of [File](https://developer.mozilla.org/en-US/docs/Web/API/File).
 *
 * triggerEvent(
 *   '[data-test-drop-zone]',
 *   'drop',
 *   {
 *     dataTransfer: {
 *       files: [new File(['Ember Rules!'], 'ember-rules.txt')]
 *     }
 *   }
 * )
 */
export default async function triggerEvent(
  target: Target,
  eventType: string,
  options?: object
): Promise<void> {
  if (!target) {
    throw new Error('Must pass an element or selector to `triggerEvent`.');
  } else if (!eventType) {
    throw new Error(`Must provide an \`eventType\` to \`triggerEvent\``);
  }

  const element = getWindowOrElement(target);
  if (!element) {
    throw new Error(`Element not found when calling \`triggerEvent('${target}', ...)\`.`);
  } else if (isFormControl(element) && element.disabled) {
    throw new Error(`Can not \`triggerEvent\` on disabled ${element}`);
  }

  fireEvent(element, eventType, options);

  // return settled();
}

export function getWindowOrElement(target: Target): Element | Document | Window | null {
  if (target instanceof Window) {
    return target as Window;
  }

  return getElement(target);
}
