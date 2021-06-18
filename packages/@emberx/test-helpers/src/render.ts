import Component, { renderComponent } from '@emberx/component';
import { getContext } from './context';
import { fn, hash, array, get, concat, on } from '@glimmer/runtime';

interface FreeObject {
  [propName: string]: any;
}

export default async function render(templateString: string, includes: object = {}): Promise<void> {
  let context = getContext();
  let services = context.Router ? context.Router.SERVICES : {};
  // let targetServices = context.owner ? context.owner.services : {}; // TODO: probably improve this: get resolver from QUnit.config object

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

      Object.assign(this, context); // NOTE: this isnt ideal for performance in testing, but backwards compatible with existing ember testing
    }
  }

  TemplateOnlyComponent.setTemplate(templateString);

  return await renderComponent(TemplateOnlyComponent, {
    element: document.getElementById('ember-testing') as HTMLElement,
    owner: {
      services,
    },
  });
}
