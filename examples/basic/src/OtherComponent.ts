import Component, { setComponentTemplate } from '@emberx/component';
import { precompileTemplate } from '@glimmer/core';

export default class OtherComponent extends Component {}

setComponentTemplate(
  precompileTemplate(`<b>Counter Val: {{@count}}</b>`, { strictMode: true }),
  OtherComponent
);
