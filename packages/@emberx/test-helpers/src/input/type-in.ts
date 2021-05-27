import inputs, { Target } from 'browser-inputs';

interface TypeInOptions {
  delay?: number;
}

export default async function typeIn(
  target: Target,
  text: string,
  options: TypeInOptions = {}
): Promise<void | Event> {
  return await inputs.typeIn(target, text, options);

  // .then(settled)
}
