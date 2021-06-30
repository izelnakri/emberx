import { Owner } from '@emberx/router';
import Component, { renderComponent } from '@emberx/component';
import { getContext } from './context';

interface FreeObject {
  [propName: string]: any;
}

export default async function render(templateString: string, includes: object = {}): Promise<void> {
  let context = getContext();

  class TemplateOnlyComponent<Args extends FreeObject = {}> extends Component<Args> {
    static includes = includes;

    constructor(owner: object, args: Args) {
      // @ts-ignore
      super(owner, args);

      // TODO: maybe figure out a way to optimize this
      Object.keys(context).forEach((key) => {
        if (!['Router', 'Server', 'owner', 'pauseTest', 'resumeTest', 'element'].includes(key)) {
          Object.assign(this, { [key]: context[key] });
        }
      });
    }
  }

  TemplateOnlyComponent.setTemplate(templateString);

  let container = document.getElementById('ember-testing') as HTMLElement;

  container.innerHTML = '';

  // @ts-ignore
  return await renderComponent(TemplateOnlyComponent, {
    element: container,
    owner: Owner,
  });
}
