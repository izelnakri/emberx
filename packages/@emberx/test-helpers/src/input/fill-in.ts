import { didRender } from '@emberx/component';
import inputs, { Target } from 'browser-inputs';

export default async function fillIn(target: Target, text: string): Promise<void> {
  await inputs.fillIn(target, text);
  await didRender();
  // return settled();
}
