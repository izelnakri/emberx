import { didRender } from '@emberx/component';
import inputs, { Target } from 'browser-inputs';

export default async function focus(target: Target): Promise<void> {
  await inputs.focus(target);
  await didRender();

  // return settled();
}
