// TODO: Only thing missing is actual registration on ProgramSymbolTable: @glimmer/syntax/dist/modules/es2017/lib/v2-a/normalize.js
import Component from '@glimmer/component';
import {
  setComponentTemplate,
  getOwner,
  templateOnlyComponent,
  renderComponent as glimmerRenderComponent,
  RenderComponentOptions,
} from '@glimmer/core';
import createTemplate from './create-template';

export default class EmberXComponent<Args extends {} = {}> extends Component<Args> {
  static compiled = false;
  static includes = {};
  static setTemplate(sourceCode: string) {
    let scope = this.includes || {};
    let opCode: any = createTemplate(sourceCode || ``, { strictMode: true }, scope);

    setComponentTemplate(opCode, this);

    return opCode;
  }

  constructor(owner: object, args: Args) {
    super(owner, args);
  }
}

async function renderComponent(
  ComponentClass: EmberXComponent,
  options: RenderComponentOptions
): Promise<void>;
async function renderComponent(
  ComponentClass: EmberXComponent,
  element: HTMLElement
): Promise<void>;
async function renderComponent(
  ComponentClass: EmberXComponent,
  optionsOrElement: RenderComponentOptions | HTMLElement
): Promise<void> {
  const options: RenderComponentOptions =
    optionsOrElement instanceof HTMLElement ? { element: optionsOrElement } : optionsOrElement;

  traverseAndCompileAllComponents(ComponentClass);

  return glimmerRenderComponent(ComponentClass, options);
}

function hbs(sourceCode: string) {
  return sourceCode[0];
}

export { setComponentTemplate, getOwner, templateOnlyComponent, renderComponent, hbs };

function traverseAndCompileAllComponents(ComponentClass: EmberXComponent) {
  if ('compiled' in ComponentClass && !ComponentClass.compiled) {
    ComponentClass.setTemplate(ComponentClass.template);
    ComponentClass.compiled = true;

    Object.entries(ComponentClass.includes).forEach(([key, value]) =>
      traverseAndCompileAllComponents(value)
    );
  }
}
