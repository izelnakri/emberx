import inputs, { Target } from 'browser-inputs';

export default async function blur(target: Target = document.activeElement!): Promise<void> {
  return await inputs.blur(target);

  // return settled();
}
