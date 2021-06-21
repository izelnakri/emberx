import { hbs } from '@emberx/component';
import { getContext } from './context';
import { setupTest, setupRenderingTest, setupApplicationTest } from './setup';
import {
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
} from './input';
import render from './render';
import { find, findAll } from './query';
import { currentRouteName, currentURL, visit } from './url';
import { wait, waitFor, waitUntil, settled } from './wait';

export {
  blur,
  click,
  currentRouteName,
  currentURL,
  doubleClick,
  fillIn,
  find,
  findAll,
  fireEvent,
  focus,
  getContext,
  hbs,
  scrollTo,
  select,
  tap,
  triggerEvent,
  triggerKeyEvent,
  typeIn,
  render,
  settled,
  setupTest,
  setupRenderingTest,
  setupApplicationTest,
  wait,
  waitFor,
  waitUntil,
  visit,
};

export default {
  blur,
  click,
  currentRouteName,
  currentURL,
  doubleClick,
  fillIn,
  find,
  findAll,
  fireEvent,
  focus,
  getContext,
  hbs,
  scrollTo,
  select,
  tap,
  triggerEvent,
  triggerKeyEvent,
  typeIn,
  render,
  settled,
  setupTest,
  setupRenderingTest,
  setupApplicationTest,
  wait,
  waitFor,
  waitUntil,
  visit,
};

//     -   [blur][2]
//     -   [click][3]
//     -   [doubleClick][4]
//     -   [fillIn][5]
//     -   [focus][6]
//     -   [tap][7]
//     -   [triggerEvent][8]
//     -   [triggerKeyEvent][9]
//     -   [typeIn][10]
// -   [DOM Query Helpers][11]
//     -   [find][12]
//     -   [findAll][13]
//     -   [getRootElement][14]
// -   [Rendering Helpers][19]
//     -   [render][20]
//     -   [clearRender][21]
// -   [Wait Helpers][22]
//     -   [waitFor][23]
//     -   [waitUntil][24]
//     -   [settled][25]
//     -   [isSettled][26]
//     -   [getSettledState][27]
