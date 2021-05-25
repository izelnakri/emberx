import actions from 'qunit-action';

export default async function tap(target: Target, options: object = {}): Promise<void> {
  return await actions.tap(target, options);

  // return settled();
}
