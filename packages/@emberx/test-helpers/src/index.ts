import Component, { renderComponent } from '@emberx/component';
import { getContext } from './context';
import { setupTest, setupRenderingTest, setupApplicationTest } from './setup';
import { fn, hash, array, get, concat, on } from '@glimmer/runtime';
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

interface FreeObject {
  [propName: string]: any;
}

export function render(
  templateString: string,
  includes: object = {}
): Promise<void> {
  let context = getContext();
  let targetServices = context.owner ? context.owner.services : {}; // TODO: probably improve this: get resolver from QUnit.config object

  class TemplateOnlyComponent<Args extends FreeObject = {}> extends Component<Args> {
    static includes = Object.assign(includes, {
      fn,
      hash,
      array,
      get,
      concat,
      on,
    });

    constructor(owner: object, args: Args) {
      super(owner, args);
      Object.keys(context).forEach((key: string) => {
        // @ts-ignore
        this[key] = context[key];
      }); // NOTE: this isnt ideal for performance in testing, but backwards compatible with existing ember testing
    }
  }

  TemplateOnlyComponent.setTemplate(templateString);

  return renderComponent(TemplateOnlyComponent, {
    element: document.getElementById('ember-testing') as HTMLElement,
    owner: {
      services: targetServices,
    },
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
