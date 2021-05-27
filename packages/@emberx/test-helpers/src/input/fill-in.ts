import inputs, { Target } from 'browser-inputs';

export default async function fillIn(target: Target, text: string): Promise<void> {
  return await inputs.fillIn(target, text);
  // return settled();
}
