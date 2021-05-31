import { didRender } from '@emberx/component';
import inputs, { Target } from 'browser-inputs';
import type { KeyboardEventType } from './fire-event';
import { settled } from '../wait';

export interface KeyModifiers {
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
}

const DEFAULT_MODIFIERS: KeyModifiers = Object.freeze({
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  metaKey: false,
});

export default async function triggerKeyEvent(
  target: Target,
  eventType: KeyboardEventType,
  key: number | string,
  modifiers: KeyModifiers = DEFAULT_MODIFIERS
): Promise<void> {
  await inputs.triggerKeyEvent(target, eventType, key, modifiers);
  await didRender();

  await settled();
}
