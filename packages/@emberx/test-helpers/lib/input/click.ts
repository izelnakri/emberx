import actions from 'qunit-action';

export default async function click(
  target: nodeQuery,
  _options: MouseEventInit = {}
): Promise<void> {
  return await actions.click(target, _options);

  // return settled();
}
