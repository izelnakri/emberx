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

/** A page renderURL rendered, with what the document around it needs. */
export interface RenderedPage {
  /** The page's markup, for the element the browser's router renders into (`#app`). */
  html: string;
  /** The page's title, for `<title>`: see Route.title. */
  title: string | undefined;
  /** The URL the page is at: `url`, or where its redirects ended. */
  url: string;
  /**
   * The models of the routes the page is under, by route name, for the
   * browser's Router.start({ models }): its first transition takes them instead
   * of running the model hooks again. Empty for an error or loading substate.
   * Put in the document with embedToShoeboxScriptTag().
   */
  models: Record<string, unknown>;
}

/**
 * Renders the page a URL shows: a router of its own, from
 * Router.createInstance(), goes to `url`, model hooks, redirects and loading or
 * error substates included, and the page it ends on renders as renderToString()
 * renders it. Returns its HTML, with its title, its URL and its models.
 *
 * The router keeps the URL in memory, its `none` location. Each render has its
 * own router and owner, so a server renders the URLs it is asked for at once,
 * each with its own `services`.
 */
async function renderURL(url: string, options: URLRenderOptions = {}): Promise<RenderedPage> {
  if (!Owner.lookup('service:router')) {
    throw new Error('renderURL() needs Router.start() to have started a router first.');
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

  const routeInfos: Array<{ name: string; context?: unknown }> = router.state?.routeInfos ?? [];
  const isSubstate = !!Owner.routes[router.currentRouteName!]?.options?.substate;

  return {
    html: await renderToString(page.Page, { args: page.args, owner: router.owner, hydratable: options.hydratable }),
    title: router.currentTitle,
    url: router.currentURL ?? url,
    models: isSubstate ? {} : Object.fromEntries(routeInfos.map((routeInfo) => [routeInfo.name, routeInfo.context])),
  };
}

/** The HTML of the page a URL shows: renderURL()'s `html`. */
async function renderURLToString(url: string, options: URLRenderOptions = {}): Promise<string> {
  return (await renderURL(url, options)).html;
}

/**
 * `value` as JSON that is safe inside a `<script>` element: no `</script>` or
 * `<!--` in it ends the element early, and no line separator breaks it.
 *
 *   `<script type="application/json" id="models">${embedToShoeboxScriptTag(page.models)}</script>`
 */
function embedToShoeboxScriptTag(value: unknown): string {
  return JSON.stringify(value).replace(
    /[<\u2028\u2029]/g,
    (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );
}

export { embedToShoeboxScriptTag, renderToString, renderURL, renderURLToString };
