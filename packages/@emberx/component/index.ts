// TODO: Only thing missing is actual registration on ProgramSymbolTable: @glimmer/syntax/dist/modules/es2017/lib/v2-a/normalize.js
import Component from '@glimmer/component';
import { setComponentTemplate, getOwner, templateOnlyComponent } from '@glimmer/core';
import createTemplate from './create-template';

export default class EmberXComponent<Args extends {} = {}> extends Component<Args> {
  static setTemplate(sourceCode) {
    let scope = this.includes || {};
    let opCode = createTemplate(sourceCode || ``, { strictMode: true }, scope);

    setComponentTemplate(opCode, this);

    return opCode;
  }

  constructor(owner: object, args: Args) {
    super(owner, args);
  }
}

export { setComponentTemplate, getOwner, templateOnlyComponent };
