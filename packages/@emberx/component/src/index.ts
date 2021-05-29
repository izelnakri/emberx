import Component from '@glimmer/component';
import {
  setComponentTemplate,
  getOwner,
  templateOnlyComponent,
  renderComponent as glimmerRenderComponent,
  RenderComponentOptions,
} from '@glimmer/core';
import { fn, hash, array, get, concat, on } from '@glimmer/runtime';
import createTemplate from './create-template';

export { tracked } from '@glimmer/tracking';
export { action } from '@glimmer/modifier';

interface Owner {
  [key: string]: any;
}

interface FreeObject {
  [propName: string]: any;
}

export default class EmberXComponent<Args extends FreeObject = {}> extends Component<Args> {
  static compiled = false;
  static includes = {};
  static template?: string;
  static setTemplate(sourceCode: string) {
    let scope = Object.assign(this.includes, {
      fn,
      hash,
      array,
      get,
      concat,
      on,
    });
    let templateFactory: any = createTemplate(sourceCode || ``, { strictMode: true }, scope);

    setComponentTemplate(templateFactory, this);

    return templateFactory;
  }

  // constructor(owner: object, args: Args) {
  //   super(owner, args);
  // }
}

// async function renderComponent(
//   ComponentClass: typeof EmberXComponent,
//   options: RenderComponentOptions
// ): Promise<void>;
// async function renderComponent(
//   ComponentClass: typeof EmberXComponent,
//   element: HTMLElement
// ): Promise<void>;
async function renderComponent(
  ComponentClass: typeof EmberXComponent,
  optionsOrElement: RenderComponentOptions | HTMLElement
): Promise<void> {
  const options: RenderComponentOptions =
    optionsOrElement instanceof HTMLElement ? { element: optionsOrElement } : optionsOrElement;

  traverseAndCompileAllComponents(ComponentClass);

  return glimmerRenderComponent(ComponentClass, options);
}

function service(...args: any[]) {
  const [target, key] = args;

  if (!target || !key) {
    throw new Error(
      `You attempted to use @service with an argument, you can only use it with the owners exact service name. Example: @service locale`
    );
  }

  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: false,
    get() {
      let owner = getOwner(this) as Owner;
      if (owner && owner.services) {
        return owner.services[key];
      }

      return {};
    },
  });

  return target[key];
}

function hbs(sourceCode: TemplateStringsArray): string {
  return sourceCode[0];
}

function traverseAndCompileAllComponents(ComponentClass: typeof EmberXComponent) {
  if ('compiled' in ComponentClass && !ComponentClass.compiled) {
    if (ComponentClass.template) {
      ComponentClass.setTemplate(ComponentClass.template);
    }
    ComponentClass.compiled = true;

    Object.entries(ComponentClass.includes).forEach(([_key, value]: [string, any]) =>
      traverseAndCompileAllComponents(value)
    );
  }
}

export {
  setComponentTemplate,
  getOwner,
  templateOnlyComponent,
  renderComponent,
  hbs,
  service,
  traverseAndCompileAllComponents,
};
