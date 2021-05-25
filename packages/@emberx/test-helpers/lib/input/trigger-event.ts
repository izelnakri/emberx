import actions from 'qunit-action';

export default async function triggerEvent(
  target: Target,
  eventType: string,
  options?: object
): Promise<void> {
  return await actions.triggerEvent(target, eventType, options);

  // return settled();
}
