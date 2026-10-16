import { didRender } from '@emberx/component';
import inputs, { type Target } from 'browser-inputs';
import { settled } from '../wait.ts';

export default async function blur(target: Target = document.activeElement!): Promise<void> {
  await inputs.blur(target);
  await didRender();

  await settled();
}
