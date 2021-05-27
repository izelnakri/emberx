import inputs, { Target } from 'browser-inputs';

export default async function scrollTo(target: Target, x: number, y: number): Promise<void> {
  return await inputs.scrollTo(target, x, y);

  // return settled();
}
