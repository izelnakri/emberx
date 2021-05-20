import { templateFactory } from '@glimmer/opcode-compiler';
import Component, { setComponentTemplate } from '@emberx/component';
import { precompile } from '@glimmer/compiler';

export default class OtherComponent extends Component {}

setComponentTemplate(
  templateFactory(JSON.parse(precompile(`<b>Counter Val: {{@count}}</b>`, { strictMode: true }))),
  OtherComponent
);
