import Component from '@glimmer/component';
import { precompileTemplate, setComponentTemplate, templateOnlyComponent } from '@glimmer/core';
import { on } from '@glimmer/modifier';

export default class EmberXComponent extends Component {}

export function hbs(string, scope, component) {
  // TODO: this doesnt work due to babel linter error:
  // setComponentTemplate(
  //   precompileTemplate(``, {
  //     strictMode: true,
  //     scope: () => {
  //       return scope; // TODO: make this from the this scope
  //     },
  //   }),
  //   component
  // );
}
