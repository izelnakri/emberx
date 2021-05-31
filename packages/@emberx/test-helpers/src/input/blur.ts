import { didRender } from '@emberx/component';
import inputs, { Target } from 'browser-inputs';
import { settled } from '../wait';

export default async function blur(target: Target = document.activeElement!): Promise<void> {
  await inputs.blur(target);
  await didRender();

  await settled();
}
