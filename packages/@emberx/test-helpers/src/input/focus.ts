import { didRender } from '@emberx/component';
import inputs, { Target } from 'browser-inputs';
import { settled } from '../wait';

export default async function focus(target: Target): Promise<void> {
  await inputs.focus(target);
  await didRender();

  await settled();
}
