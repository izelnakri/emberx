import { didRender } from '@emberx/component';
import inputs, { type Target } from 'browser-inputs';
import { settled } from '../wait.ts';

export default async function tap(target: Target, options: object = {}): Promise<void> {
  await inputs.tap(target, options);
  await didRender();

  await settled();
}
