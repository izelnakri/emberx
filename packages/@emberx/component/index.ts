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
    // this can mutate for service
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function service(...args) {
  debugger;
  const [target, key, descriptor] = args;

  if (!key || !descriptor) {
    throw new Error(
      `You attempted to use @service with an argument, you can only use it with the owners exact service name. Example: @tracked locale`
    );
  }

  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: false,
    get() {
      let owner = getOwner(this);
      if (owner && owner.services) {
        return owner.services[key];
      }

      return {};
    },
  });

  return target[key];
}

function hbs(sourceCode: string) {
  return sourceCode[0];
}

export { setComponentTemplate, getOwner, templateOnlyComponent, renderComponent, hbs, service };

function traverseAndCompileAllComponents(ComponentClass: EmberXComponent) {
  if ('compiled' in ComponentClass && !ComponentClass.compiled) {
    ComponentClass.setTemplate(ComponentClass.template);
    ComponentClass.compiled = true;

    Object.entries(ComponentClass.includes).forEach(([key, value]) =>
      traverseAndCompileAllComponents(value)
    );
  }
}
