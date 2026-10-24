import { Owner } from '@emberx/router';
import Component, { didRender, loadTemplateCompiler, renderComponent } from '@emberx/component';
import { getContext } from './context.ts';

interface FreeObject {
  [propName: string]: any;
}

export default async function render(templateString: string, includes: object = {}): Promise<void> {
  const context = getContext();

  class TemplateOnlyComponent<Args extends FreeObject = FreeObject> extends Component<Args> {
    static includes = includes;

    constructor(owner: object, args: Args) {
      super(owner, args);

      // TODO: maybe figure out a way to optimize this
      Object.keys(context).forEach((key) => {
        if (!['Router', 'Server', 'owner', 'pauseTest', 'resumeTest', 'element'].includes(key)) {
          Object.assign(this, { [key]: context[key] });
        }
      });
    }
  }

  await loadTemplateCompiler();
  TemplateOnlyComponent.setTemplate(templateString);

  const container = document.getElementById('ember-testing') as HTMLElement;

  await renderComponent(TemplateOnlyComponent, {
    element: container,
    owner: Owner,
  });
}

/**
  Waits for the render that changing tracked state scheduled. Renders happen
  on their own a moment after a change; input helpers such as click() already
  wait for them, so this is for state a test changes directly:

  ```ts ignore
  this.counter.count = 2;
  await rerender();
  assert.dom('p').hasText('2');
  ```
*/
export async function rerender(): Promise<void> {
  await didRender();
}

/**
  Renders nothing in place of what render() rendered, to test what a component
  leaves behind once it is gone. The component is destroyed, so its
  willDestroy and destructors run, the container is emptied, and a later
  render() starts afresh.
*/
export async function clearRender(): Promise<void> {
  await render('');
}
