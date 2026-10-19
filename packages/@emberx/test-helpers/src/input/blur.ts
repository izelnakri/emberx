import { settled } from '../wait.ts';
import { getElement, type Target } from './dom.ts';
import { blurElement } from './focus.ts';

/** Unfocuses `target`, the focused element by default: `blur`, then `focusout`. */
export default async function blur(target: Target = document.activeElement!): Promise<void> {
  const element = getElement(target);
  if (!element) throw new Error(`Element not found when calling \`blur('${target}')\`.`);

  blurElement(element);

  await settled();
}
