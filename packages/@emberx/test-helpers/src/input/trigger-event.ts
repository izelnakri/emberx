import { didRender } from '@emberx/component';
import inputs, { Target } from 'browser-inputs';

export default async function triggerEvent(
  target: Target,
  eventType: string,
  options?: object
): Promise<void> {
  await inputs.triggerEvent(target, eventType, options);
  await didRender();

  // return settled();
}
