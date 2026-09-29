import { renderToString as glimmerRenderToString } from '@glimmer/ssr';
import type { RenderOptions } from '@glimmer/ssr';
import type { EmberXComponentClass } from '@emberx/component';

function traverseAndCompileAllComponents(ComponentClass: EmberXComponentClass) {
  if ('compiled' in ComponentClass && !ComponentClass.compiled) {
    ComponentClass.setTemplate(ComponentClass.template);
    ComponentClass.compiled = true;

    Object.entries(ComponentClass.includes).forEach(([_key, value]: [string, any]) =>
      traverseAndCompileAllComponents(value),
    );
  }
}

function renderToString(component: EmberXComponentClass, options: RenderOptions): Promise<string> {
  traverseAndCompileAllComponents(component);

  return glimmerRenderToString(component, options);
}

export { renderToString };
