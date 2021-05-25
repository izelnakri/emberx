import actions from 'qunit-action';

export default async function typeIn(
  target: Target,
  text: string,
  options: Options = {}
): Promise<void> {
  return await actions.typeIn(target, text, options);

  // .then(settled)
}
