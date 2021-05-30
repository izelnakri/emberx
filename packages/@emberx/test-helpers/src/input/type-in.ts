import { didRender } from '@emberx/component';
import inputs, { Target } from 'browser-inputs';

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

  // .then(settled)
}
