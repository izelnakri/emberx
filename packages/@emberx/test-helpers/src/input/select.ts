import { didRender } from '@emberx/component';
import inputs, { Target } from 'browser-inputs';

export default async function select(
  target: Target,
  options: string | string[],
  keepPreviouslySelected = false
): Promise<void> {
  await inputs.select(target, options, keepPreviouslySelected);
  await didRender();

  // return settled();
}
