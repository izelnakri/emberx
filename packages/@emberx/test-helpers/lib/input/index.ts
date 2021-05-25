import blur from './blur';
import click from './click';
import doubleClick from './double-click';
import fillIn from './fill-in';
import fireEvent from './fire-event';
import focus from './focus';
import scrollTo from './scroll-to';
import select from './select';
import tap from './tap';
import triggerEvent from './trigger-event';
import triggerKeyEvent from './trigger-key-event';
import typeIn from './type-in';

export type nodeQuery = string | HTMLElement;
export type FocusableElement = HTMLAnchorElement;
export type FormControl =
  | HTMLInputElement
  | HTMLButtonElement
  | HTMLSelectElement
  | HTMLTextAreaElement;
export interface HTMLElementContentEditable extends HTMLElement {
  isContentEditable: true;
}

export {
  blur,
  click,
  doubleClick,
  fillIn,
  fireEvent,
  focus,
  scrollTo,
  select,
  tap,
  triggerEvent,
  triggerKeyEvent,
  typeIn,
};

export default {
  blur,
  click,
  doubleClick,
  fillIn,
  fireEvent,
  focus,
  scrollTo,
  select,
  tap,
  triggerEvent,
  triggerKeyEvent,
  typeIn,
};
