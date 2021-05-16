import { renderComponent } from '@glimmer/core';
import { getContext } from './context';
import { setupTest, setupRenderingTest, setupApplicationTest } from './setup';
import { tracked } from '@glimmer/tracking';
import Intl from '../../examples/blog/services/intl';
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
import { find, findAll } from './query';
import { waitFor, waitUntil, settled } from './wait';
// import { service } from '@glimmerx/service';

export function visit(path: string): Promise<void> {
  const context = getContext();

  return context.router.visit(path);
}

export function currentRouteName(): string {
  const context = getContext();
  const routes = context.router.default.currentRouteInfos;

  return routes[routes.length - 1].name;
}

export function currentURL(): string {
  const context = getContext();

  return context.router.path;
}

export function render(template: any, services?: object | undefined): Promise<any> {
  const context = getContext();
  const targetServices = context.services || services; // TODO: get resolver from QUnit.config object

  return renderComponent(template, {
    element: document.getElementById('ember-testing'),
    args: context,
    services: context,
  });
}

export {
  blur,
  click,
  doubleClick,
  fillIn,
  find,
  findAll,
  fireEvent,
  focus,
  scrollTo,
  select,
  tap,
  triggerEvent,
  triggerKeyEvent,
  typeIn,
  settled,
  setupTest,
  setupRenderingTest,
  setupApplicationTest,
  waitFor,
  waitUntil,
};

export default {
  blur,
  click,
  doubleClick,
  fillIn,
  find,
  findAll,
  fireEvent,
  focus,
  scrollTo,
  select,
  tap,
  triggerEvent,
  triggerKeyEvent,
  typeIn,
  visit,
  currentRouteName,
  currentURL,
  render,
  settled,
  setupTest,
  setupRenderingTest,
  setupApplicationTest,
  waitFor,
  waitUntil,
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
