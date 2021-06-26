import Component, { renderComponent } from '@emberx/component';
import { getContext } from './context';

interface FreeObject {
  [propName: string]: any;
}

export default async function render(templateString: string, includes: object = {}): Promise<void> {
  let context = getContext();
  let services = context.Router ? context.Router.SERVICES : {};
  // let targetServices = context.owner ? context.owner.services : {}; // TODO: probably improve this: get resolver from QUnit.config object

  class TemplateOnlyComponent<Args extends FreeObject = {}> extends Component<Args> {
    static includes = includes;

    constructor(owner: object, args: Args) {
      // @ts-ignore
      super(owner, args);

      Object.assign(this, context); // NOTE: this isnt ideal for performance in testing, but backwards compatible with existing ember testing
    }
  }

  TemplateOnlyComponent.setTemplate(templateString);

  let container = document.getElementById('ember-testing') as HTMLElement;

  container.innerHTML = '';

  // @ts-ignore
  return await renderComponent(TemplateOnlyComponent, {
    element: container,
    owner: {
      services,
    },
  });
}
