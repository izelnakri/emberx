import inputs, { Target } from 'browser-inputs';

export default async function focus(target: Target): Promise<void> {
  return await inputs.focus(target);

  // return settled();
}
