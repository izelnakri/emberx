import inputs, { Target } from 'browser-inputs';

export default async function click(target: Target, _options: MouseEventInit = {}): Promise<void> {
  return await inputs.click(target, _options);

  // return settled();
}
