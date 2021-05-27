import inputs, { Target } from 'browser-inputs';

export default async function doubleClick(
  target: Target,
  _options: MouseEventInit = {}
): Promise<void> {
  return await inputs.doubleClick(target, _options);

  // return settled();
}
