import { didRender } from '@emberx/component';
import inputs, { type Target } from 'browser-inputs';
import { settled } from '../wait.ts';

export default async function click(target: Target, _options: MouseEventInit = {}): Promise<void> {
  await inputs.click(target, _options);
  await didRender();

  await settled();
}
