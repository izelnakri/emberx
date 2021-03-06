import { didRender } from '@emberx/component';
import inputs, { Target } from 'browser-inputs';
import { settled } from '../wait';

export default async function scrollTo(target: Target, x: number, y: number): Promise<void> {
  await inputs.scrollTo(target, x, y);
  await didRender();

  await settled();
}
