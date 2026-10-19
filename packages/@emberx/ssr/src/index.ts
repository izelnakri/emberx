import { renderSettled } from '@emberx/vendor/@ember/renderer';
import { serializeBuilder } from '@emberx/vendor/@glimmer/node';
import { clientBuilder } from '@emberx/vendor/@glimmer/runtime';
import createDocument from '@simple-dom/document';
import HTMLSerializer from '@simple-dom/serializer';
import voidMap from '@simple-dom/void-map';
import { renderWithBuilder, traverseAndCompileAllComponents, type EmberXComponentClass } from '@emberx/component';
import Router, { Owner } from '@emberx/router';

interface RenderOptions {
  args?: Record<string, unknown>;
  owner?: object;
  /**
   * Whether the markup carries the comments Glimmer's rehydration reads, so a
   * browser render into it adopts it rather than replacing it. On by default;
   * off for static output.
   */
  hydratable?: boolean;
}

/**
 * Renders a component to an HTML string without a browser DOM, the way Ember's
 * FastBoot does: into a simple-dom document, with modifiers and `{{on}}` off,
 * then serialized.
 *
 * The markup is hydratable: rendered into the browser's copy of it, with
 * @emberx/component's renderComponent (as @emberx/router renders each page), the
 * component adopts the server's DOM instead of rebuilding it.
 */
async function renderToString(component: EmberXComponentClass, options: RenderOptions = {}): Promise<string> {
  traverseAndCompileAllComponents(component);

  const document = createDocument();
  const into = document.createElement('div');
  document.body.appendChild(into);

  const renderer = renderWithBuilder(component, {
    into,
    args: options.args,
    owner: options.owner ?? {},
    document,
    builder: options.hydratable === false ? clientBuilder : serializeBuilder,
    interactive: false,
  });
  await renderSettled();

  const html = new HTMLSerializer(voidMap).serializeChildren(into);
  renderer.destroy();

  return html;
}

interface URLRenderOptions extends Pick<RenderOptions, 'hydratable'> {
  /**
   * Services of this render's own, beside the app's (Router.addServices()),
   * which its routes and pages find as theirs: the request's cookies or
   * session, for example. Router.createInstance() takes them.
   */
  services?: Record<string, unknown>;
}

/**
 * Renders the page a URL shows to an HTML string: a router of its own, from
 * Router.createInstance(), goes to `url`, model hooks, redirects and loading or
 * error substates included, and the page it ends on renders as renderToString()
 * renders it.
 *
 * The router keeps the URL in memory, its `none` location. Each render has its
 * own router and owner, so a server renders the URLs it is asked for at once,
 * each with its own `services`.
 */
async function renderURLToString(url: string, options: URLRenderOptions = {}): Promise<string> {
  if (!Owner.lookup('service:router')) {
    throw new Error('renderURLToString() needs Router.start() to have started a router first.');
  }

  const router = Router.createInstance({ services: options.services });
  let page: { Page: EmberXComponentClass; args: Record<string, unknown> } | undefined;
  router.renderPage = async (Page: EmberXComponentClass, args: Record<string, unknown>) => {
    page = { Page, args };
  };
  await router.visit(url);
  if (!page) {
    throw new Error(`${url} rendered no page.`);
  }

  return renderToString(page.Page, { args: page.args, owner: router.owner, hydratable: options.hydratable });
}

export { renderToString, renderURLToString };
