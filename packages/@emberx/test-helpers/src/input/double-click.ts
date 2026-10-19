import { settled } from '../wait.ts';
import { DEFAULT_CLICK_OPTIONS, clickElement } from './click.ts';
import { findTarget, type Target } from './dom.ts';
import fireEvent from './fire-event.ts';

/** Double-clicks `target`: two clicks, then `dblclick`, with `options` for the MouseEvents. */
export default async function doubleClick(target: Target, options: MouseEventInit = {}): Promise<void> {
  const element = findTarget('doubleClick', target);
  const mouseOptions = { ...DEFAULT_CLICK_OPTIONS, ...options };

  clickElement(element, mouseOptions);
  fireEvent(element, 'mousedown', mouseOptions);
  fireEvent(element, 'mouseup', mouseOptions);
  fireEvent(element, 'click', mouseOptions);
  fireEvent(element, 'dblclick', mouseOptions);

  await settled();
}
