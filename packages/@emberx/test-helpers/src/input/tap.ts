import { didRender } from '@emberx/component';
import inputs, { Target } from 'browser-inputs';
import { settled } from '../wait';

export default async function tap(target: Target, options: object = {}): Promise<void> {
  await inputs.tap(target, options);
  await didRender();

  await settled();
}
