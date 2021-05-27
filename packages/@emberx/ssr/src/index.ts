import { renderToString as glimmerRenderToString } from '@glimmer/ssr';

function traverseAndCompileAllComponents(ComponentClass) {
  if ('compiled' in ComponentClass && !ComponentClass.compiled) {
    ComponentClass.setTemplate(ComponentClass.template);
    ComponentClass.compiled = true;

    Object.entries(ComponentClass.includes).forEach(([key, value]) =>
      traverseAndCompileAllComponents(value)
    );
  }
}

function renderToString(component, options) {
  traverseAndCompileAllComponents(component);

  return glimmerRenderToString(component, options);
}

export { renderToString };
