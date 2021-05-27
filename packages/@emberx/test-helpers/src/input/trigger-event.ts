import inputs, { Target } from 'browser-inputs';

export default async function triggerEvent(
  target: Target,
  eventType: string,
  options?: object
): Promise<void> {
  return await inputs.triggerEvent(target, eventType, options);

  // return settled();
}
