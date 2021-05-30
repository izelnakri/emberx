import { didRender } from '@emberx/component';
import inputs, { Target } from 'browser-inputs';

export default async function doubleClick(target: Target, _options: MouseEventInit = {}): Promise<void> {
  await inputs.doubleClick(target, _options);
  await didRender();

  // return settled();
}
