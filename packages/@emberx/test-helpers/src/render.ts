import Router from '@emberx/router';
import Component, { renderComponent } from '@emberx/component';
import { getContext } from './context';

interface FreeObject {
  [propName: string]: any;
}

export default async function render(templateString: string, includes: object = {}): Promise<void> {
  let context = getContext();
  if (!context.Router) {
    context.Router = Router.start([]);
  }

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
    owner: context.Router.owner,
  });
}
