import actions from 'qunit-action';

export default async function doubleClick(
  target: Target,
  _options: MouseEventInit = {}
): Promise<void> {
  return await actions.doubleClick(target, _options);

  // return settled();
}
