import { getElement, isFormControl } from './index';
import { __click__ } from './click';
import fireEvent from './fire-event';

export default async function tap(target: Target, options: object = {}): Promise<void> {
  if (!target) {
    throw new Error('Must pass an element or selector to `tap`.');
  }

  const element = getElement(target);
  if (!element) {
    throw new Error(`Element not found when calling \`tap('${target}')\`.`);
  } else if (isFormControl(element) && element.disabled) {
    throw new Error(`Can not \`tap\` disabled ${element}`);
  }

  const touchstartEv = fireEvent(element, 'touchstart', options);
  const touchendEv = fireEvent(element, 'touchend', options);

  if (!touchstartEv.defaultPrevented && !touchendEv.defaultPrevented) {
    __click__(element, options);
  }

  // return settled();
}
