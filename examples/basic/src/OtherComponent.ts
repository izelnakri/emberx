import Component, { precompileTemplate, setComponentTemplate } from '@emberx/component';

export default class OtherComponent extends Component {}

setComponentTemplate(
  precompileTemplate(`<b>Counter Val: {{@count}}</b>`, { strictMode: true }),
  OtherComponent
);
