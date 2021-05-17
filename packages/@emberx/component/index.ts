import Component from '@glimmer/component';
import {
  getOwner,
  setOwner,
  renderComponent,
  // precompileTemplate,
  setComponentTemplate,
  templateOnlyComponent,
} from '@glimmer/core';
import { tracked } from '@glimmer/tracking';
import { on, action } from '@glimmer/modifier';
// import Component, {
//   getOwner,
//   setOwner,
//   renderComponent,
//   precompileTemplate,
//   setComponentTemplate,
//   templateOnlyComponent,
//   tracked,
//   on,
//   action,
// } from './glimmer';

export default class EmberXComponent<Args extends {} = {}> extends Component<Args> {
  constructor(owner: object, args: Args) {
    super(owner, args);
  }
}

function hbs(sourceCode: string, scope: object, component: EmberXComponent) {
  // return { sourceCode, scope };
  // TODO: this doesnt work due to babel linter error:
  // setComponentTemplate(
  //   precompileTemplate(`<p>ok</p>`, {
  //     strictMode: true,
  //     scope: {},
  //   }),
  //   component
  // );
}

export {
  renderComponent,
  // precompileTemplate,
  setComponentTemplate,
  templateOnlyComponent,
  hbs,
  getOwner,
  setOwner,
  tracked,
  on,
  action,
};
