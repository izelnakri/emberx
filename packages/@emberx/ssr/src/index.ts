import { renderSettled } from '@emberx/vendor/@ember/renderer';
import { serializeBuilder } from '@emberx/vendor/@glimmer/node';
import { clientBuilder } from '@emberx/vendor/@glimmer/runtime';
import createDocument from '@simple-dom/document';
import HTMLSerializer from '@simple-dom/serializer';
import voidMap from '@simple-dom/void-map';
import { compileTemplates, renderWithBuilder, type EmberXComponentClass } from '@emberx/component';
import Router, { Owner, type HeadElement, type RouteDefinition } from '@emberx/router';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const VOID_ELEMENTS = new Set(['meta', 'link', 'base', 'br', 'hr', 'img', 'input', 'source']);
/** The empty element the browser's router renders the page into. */
const APP_ELEMENT = /<div id="app">\s*<\/div>/;
const TITLE_ELEMENT = /<title>[\s\S]*?<\/title>\s*/;
const BODY_ELEMENT = /<body[^>]*>/;

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
  await compileTemplates(component);

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
  /**
   * What goes in `<head>`: the `<title>`, then the `<meta>`, `<link>` and
   * `<script>` elements of the routes' `static head`, escaped, and marked so
   * the browser's router adopts them rather than adding them again.
   */
  head: string;
  /** The elements first in `<body>`, before the page: their `static body`'s `start`. */
  bodyStart: string;
  /** The elements last in `<body>`, after the page: their `static body`'s `end`. */
  bodyEnd: string;
  /** The URL the page is at: `url`, or where its redirects ended. */
  url: string;
  /**
   * The HTTP status the page is answered with: 404 for a catch-all route's
   * page, the not-found route's or one the app declared, 500 for an error
   * substate's, and 200 for any other.
   */
  status: 200 | 404 | 500;
  /**
   * The models of the routes the page is under, by route name, for the
   * browser's Router.start({ models }): its first transition takes them instead
   * of running the model hooks again. Empty for an error or loading substate.
   * renderBaseHTMLToString() leaves them in the #shoebox that Router.start() reads.
   */
  models: Record<string, unknown>;
}

/**
 * Renders the page a URL shows: a router of its own, from
 * Router.createInstance(), goes to `url`, model hooks, redirects and loading or
 * error substates included, and the page it ends on renders as renderToString()
 * renders it. Returns its HTML, with what the document around it needs: its
 * title and head elements, its URL and its models.
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
  const route = Owner.routes[router.currentRouteName!];
  const isSubstate = !!route?.options?.substate;

  return {
    html: await renderToString(page.Page, { args: page.args, owner: router.owner, hydratable: options.hydratable }),
    title: router.currentTitle,
    head:
      (router.currentTitle === undefined ? '' : `<title>${escapeText(router.currentTitle)}</title>`) +
      elementsHTML(router.currentHead, 'head'),
    bodyStart: elementsHTML(router.currentHead, 'bodyStart'),
    bodyEnd: elementsHTML(router.currentHead, 'bodyEnd'),
    url: router.currentURL ?? url,
    status: statusOf(route),
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
 *   `<script type="application/json" id="shoebox">${embedToShoeboxScriptTag(page.models)}</script>`
 */
function embedToShoeboxScriptTag(value: unknown): string {
  return JSON.stringify(value).replace(
    /[<\u2028\u2029]/g,
    (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );
}

/**
 * The document a server sends for a page renderURL() rendered, as HTML: the
 * app's base HTML, its index.html, with the page's `<title>` in place of its
 * own, the page's head elements last in `<head>`, its body elements first and
 * last in `<body>`, its markup in the empty `<div id="app"></div>`, and its
 * models after that, in the #shoebox the browser's Router.start() reads.
 *
 *   const rendered = await renderURL(url);
 *   return new Response(renderBaseHTMLToString(baseHTML, rendered), { status: rendered.status });
 */
function renderBaseHTMLToString(baseHTML: string, rendered: RenderedPage): string {
  // Every place is found in the base HTML, never in the rendered markup, which is neither scanned, where a
  // `</body>` of its own would be taken for the document's, nor copied more than once.
  const headEnd = baseHTML.indexOf('</head>');
  const bodyElement = BODY_ELEMENT.exec(baseHTML);
  const app = APP_ELEMENT.exec(baseHTML);
  const bodyEnd = baseHTML.lastIndexOf('</body>');
  if (headEnd === -1 || !bodyElement || !app || bodyEnd === -1) {
    throw new Error(
      'renderBaseHTMLToString() needs the base HTML to have a </head>, a <body> and </body>, and an empty <div id="app"></div> to put the page in.',
    );
  }

  const bodyStart = bodyElement.index + bodyElement[0].length;
  // The base HTML's own <title>, in its head: an <svg>'s <title> in its body is not one. The page's replaces it.
  const title = rendered.title === undefined ? null : TITLE_ELEMENT.exec(baseHTML.slice(0, headEnd));
  const beforeHeadEnd = title
    ? baseHTML.slice(0, title.index) + baseHTML.slice(title.index + title[0].length, headEnd)
    : baseHTML.slice(0, headEnd);
  const shoebox = `<script type="application/json" id="shoebox">${embedToShoeboxScriptTag(rendered.models)}</script>`;

  return (
    beforeHeadEnd +
    rendered.head +
    baseHTML.slice(headEnd, bodyStart) +
    rendered.bodyStart +
    baseHTML.slice(bodyStart, app.index) +
    `<div id="app">${rendered.html}</div>${shoebox}` +
    baseHTML.slice(app.index + app[0].length, bodyEnd) +
    rendered.bodyEnd +
    baseHTML.slice(bodyEnd)
  );
}

export { embedToShoeboxScriptTag, renderBaseHTMLToString, renderToString, renderURL, renderURLToString };

/**
 * The HTML of the head elements that go `where`, each marked with its key as
 * @emberx/router's head.ts marks the ones it adds, so the browser's router
 * adopts them.
 */
function elementsHTML(elements: HeadElement[], where: HeadElement['where']): string {
  return elements
    .filter((element) => element.where === where)
    .map(({ tag, key, attributes, children, innerHTML }) => {
      const marked: Record<string, string | true> = { ...attributes, 'data-emberx-head': key };
      const written = Object.entries(marked)
        .map(([name, value]) => (value === true ? ` ${name}` : ` ${name}="${escapeAttribute(value)}"`))
        .join('');
      // A script's text comes escaped for the element (@emberx/router's head.ts), and markup as it is.
      const content = innerHTML ?? (tag === 'script' ? children : escapeText(children ?? '')) ?? '';

      return VOID_ELEMENTS.has(tag) ? `<${tag}${written}>` : `<${tag}${written}>${content}</${tag}>`;
    })
    .join('');
}

/** The status of a page `route` shows: see RenderedPage.status. */
function statusOf(route: RouteDefinition | undefined): RenderedPage['status'] {
  if (route?.options?.substate) {
    return route.name!.endsWith('error') ? 500 : 200;
  }

  return route?.options?.path?.startsWith('/*') ? 404 : 200;
}

function escapeText(text: string): string {
  return text.replace(/[&<>]/g, (character) => ESCAPES[character]);
}

function escapeAttribute(value: string): string {
  return value.replace(/[&<>"]/g, (character) => ESCAPES[character]);
}
