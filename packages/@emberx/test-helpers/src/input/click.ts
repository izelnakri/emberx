import { didRender } from '@emberx/component';
import inputs, { Target } from 'browser-inputs';

export default async function click(target: Target, _options: MouseEventInit = {}): Promise<void> {
  await inputs.click(target, _options);
  await didRender();

  // return settled();
}
