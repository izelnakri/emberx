import inputs, { Target } from 'browser-inputs';

export default async function tap(target: Target, options: object = {}): Promise<void> {
  return await inputs.tap(target, options);

  // return settled();
}
