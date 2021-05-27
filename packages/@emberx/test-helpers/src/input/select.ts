import inputs, { Target } from 'browser-inputs';

export default async function select(
  target: Target,
  options: string | string[],
  keepPreviouslySelected = false
): Promise<void> {
  return await inputs.select(target, options, keepPreviouslySelected);

  // return settled();
}
