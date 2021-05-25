import actions from 'qunit-action';

export default async function fillIn(target: Target, text: string): Promise<void> {
  return await actions.fillIn(target, text);
  // return settled();
}
