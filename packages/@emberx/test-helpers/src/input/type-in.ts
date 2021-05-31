import { didRender } from '@emberx/component';
import inputs, { Target } from 'browser-inputs';
import { settled } from '../wait';

interface TypeInOptions {
  delay?: number;
}

export default async function typeIn(
  target: Target,
  text: string,
  options: TypeInOptions = {}
): Promise<void | Event> {
  await inputs.typeIn(target, text, options);
  await didRender();

  await settled();
}
