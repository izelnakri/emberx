import actions from 'qunit-action';

export default async function select(
  target: Target,
  options: string | string[],
  keepPreviouslySelected = false
): Promise<void> {
  return await actions.select(target, options, keepPreviouslySelected);

  // return settled();
}
