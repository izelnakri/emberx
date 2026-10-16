import { didRender } from '@emberx/component';
import inputs, { type Target } from 'browser-inputs';
import { settled } from '../wait.ts';

export default async function focus(target: Target): Promise<void> {
  await inputs.focus(target);
  await didRender();

  await settled();
}
