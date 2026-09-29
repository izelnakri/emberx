import { renderComponent, renderSettled } from '@ember/renderer';
import createDocument from '@simple-dom/document';
import HTMLSerializer from '@simple-dom/serializer';
import voidMap from '@simple-dom/void-map';
import type { EmberXComponentClass } from '@emberx/component';

interface RenderOptions {
  args?: Record<string, unknown>;
  owner?: object;
}

function traverseAndCompileAllComponents(ComponentClass: EmberXComponentClass) {
  if ('compiled' in ComponentClass && !ComponentClass.compiled) {
    ComponentClass.setTemplate(ComponentClass.template);
    ComponentClass.compiled = true;
    Object.entries(ComponentClass.includes).forEach(([_key, value]: [string, any]) =>
      traverseAndCompileAllComponents(value),
    );
  }
}

/**
 * Renders a component to an HTML string without a browser DOM.
 *
 * @glimmer/ssr did this before and is gone with the rest of glimmer.js. This is
 * the same approach Ember's FastBoot takes: render into a simple-dom document
 * with interactivity off, then serialize it.
 */
async function renderToString(component: EmberXComponentClass, options: RenderOptions = {}): Promise<string> {
  traverseAndCompileAllComponents(component);

  const document = createDocument();
  const into = document.createElement('div');
  document.body.appendChild(into);

  // @ember/renderer checks `into instanceof Element`, which throws where there
  // is no DOM at all, plain node included. A stand-in class for that one
  // synchronous call makes the check false, which is right: `into` is a fresh,
  // empty simple-dom element with nothing to clear.
  const globals = globalThis as { Element?: unknown };
  const hadElement = 'Element' in globals;
  if (!hadElement) globals.Element = class {};

  let result;
  try {
    result = renderComponent(
      component as object,
      {
        into: into as unknown as Element,
        owner: options.owner,
        args: options.args,
        env: { document, isInteractive: false, hasDOM: false },
      } as any,
    );
  } finally {
    if (!hadElement) delete globals.Element;
  }
  await renderSettled();

  const html = new HTMLSerializer(voidMap).serializeChildren(into);
  result.destroy();

  return html;
}

export { renderToString };
