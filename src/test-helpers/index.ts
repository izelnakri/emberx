import { getContext } from './context';
import { setupTest, setupRenderingTest, setupApplicationTest } from './setup';

export function visit(path: string): Promise<void> {
  const context = getContext();

  return context.router.default.visit(path);
}

export function currentRouteName(): string {
  const context = getContext();

  const routes = context.router.default.currentRouteInfos;

  return routes[routes.length - 1].name;
}

export function currentURL(): string {
  const context = getContext();

  return context.router.default.path;
}

export default {
  visit,
  currentRouteName,
  currentURL,
  setupTest,
  setupRenderingTest,
  setupApplicationTest,
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
