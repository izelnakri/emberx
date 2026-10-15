import { hbs } from '@emberx/component';
import { getContext } from './context.ts';
import { setupTest, setupRenderingTest, setupApplicationTest } from './setup.ts';
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
} from './input/index.ts';
import render, { rerender, clearRender } from './render.ts';
import { find, findAll } from './query.ts';
import { currentRouteName, currentURL, visit } from './url.ts';
import { wait, waitFor, waitUntil, settled, isSettled, getSettledState } from './wait.ts';
import { pauseTest, resumeTest } from './pause.ts';

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
  getSettledState,
  hbs,
  isSettled,
  pauseTest,
  resumeTest,
  scrollTo,
  select,
  tap,
  triggerEvent,
  triggerKeyEvent,
  typeIn,
  render,
  rerender,
  clearRender,
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
  getSettledState,
  hbs,
  isSettled,
  pauseTest,
  resumeTest,
  scrollTo,
  select,
  tap,
  triggerEvent,
  triggerKeyEvent,
  typeIn,
  render,
  rerender,
  clearRender,
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

export type { SettledState } from './wait.ts';
