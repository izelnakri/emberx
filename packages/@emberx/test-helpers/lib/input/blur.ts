import actions from 'qunit-action';

export default async function blur(target: nodeQuery = document.activeElement!): Promise<void> {
  return await actions.blur(target);

  // return settled();
}
