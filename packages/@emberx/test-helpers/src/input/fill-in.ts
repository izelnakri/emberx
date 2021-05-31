import { didRender } from '@emberx/component';
import inputs, { Target } from 'browser-inputs';
import { settled } from '../wait';

export default async function fillIn(target: Target, text: string): Promise<void> {
  await inputs.fillIn(target, text);
  await didRender();

  await settled();
}
