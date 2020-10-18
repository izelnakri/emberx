import Router from '../src/router.ts';

export async function visit(path) {
  console.log('calling visit');
  await Router.visit(path);
  console.log('visit called with', path);
}

export function currentRouteName() {
  console.log('currentRouteName called');
}

export function currentURL() {
  console.log('currentURL called');
}

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
// -   [Routing Helpers][15]
//     -   [visit][16]
//     -   [currentRouteName][17]
//     -   [currentURL][18]
// -   [Rendering Helpers][19]
//     -   [render][20]
//     -   [clearRender][21]
// -   [Wait Helpers][22]
//     -   [waitFor][23]
//     -   [waitUntil][24]
//     -   [settled][25]
//     -   [isSettled][26]
//     -   [getSettledState][27]
// -   [Pause Helpers][28]
//     -   [pauseTest][29]
//     -   [resumeTest][30]
