import actions from 'qunit-action';

export default async function scrollTo(
  target: string | HTMLElement,
  x: number,
  y: number
): Promise<void> {
  return await actions.scrollTo(target, x, y);

  // return settled();
}
