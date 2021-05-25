import actions from 'qunit-action';

export default async function focus(target: Target): Promise<void> {
  return await actions.focus(target);

  // return settled();
}
