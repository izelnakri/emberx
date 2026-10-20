/**
 * What a page puts in the document around it: a route's `static head`, for
 * `<head>`, and `static body`, for the top and bottom of `<body>`, merged from
 * the application route down to the page, applied to the document after each
 * transition, and rendered by @emberx/ssr for the document a server sends.
 */

/** An element's attributes: `true` writes the attribute bare (`async`), and `false` or `undefined` leaves it out. */
export interface HeadAttributes {
  [attribute: string]: string | number | boolean | undefined;
}

export interface HeadScript extends HeadAttributes {
  /** The script's text: `JSON.stringify(...)` for a `type: 'application/ld+json'` one. */
  children?: string;
}

/** An element at the top or the bottom of `<body>`: a `<script>`, a `<noscript>`, a `<div>` for a widget. */
export interface BodyElement extends HeadAttributes {
  tag: string;
  /** The element's text. */
  children?: string;
  /** The element's markup, written as it is: only ever markup the app wrote itself, never a user's input. */
  innerHTML?: string;
}

/** What a route's `static head` returns. */
export interface Head {
  title?: string;
  /** `<meta name="description">`: what a search result shows under the title. */
  description?: string;
  /** `<meta>` elements: `{ property: 'og:image', content: url }`. A deeper route's replaces one with the same name. */
  meta?: HeadAttributes[];
  /** `<link>` elements: `{ rel: 'canonical', href }`. */
  link?: HeadAttributes[];
  /** `<script>` elements in `<head>`: structured data (`type: 'application/ld+json'`), or a script that loads early. */
  script?: HeadScript[];
}

/** What a route's `static body` returns. */
export interface Body {
  /** Elements first in `<body>`, before the page. */
  start?: BodyElement[];
  /** Elements last in `<body>`, after the page. */
  end?: BodyElement[];
}

/** One element the document gets, where it goes, and what identifies it across routes and transitions. */
export interface HeadElement {
  where: 'head' | 'bodyStart' | 'bodyEnd';
  tag: string;
  key: string;
  attributes: Record<string, string | true>;
  children?: string;
  innerHTML?: string;
}

/** What the document gets for the active routes: see collectHead. */
export interface DocumentHead {
  title?: string;
  elements: HeadElement[];
}

/** The attribute marking the elements the router manages, whose value is each one's key. */
export const MARKER = 'data-emberx-head';

const HEAD_FIELDS = ['title', 'description', 'meta', 'link', 'script'];
const BODY_FIELDS = ['start', 'end'];
/** What makes a `<meta>` the one a deeper route replaces, in the order looked for. */
const META_NAMES = ['name', 'property', 'http-equiv', 'itemprop', 'charset'];

/**
 * The title and elements of the routes in `routeInfos`, from the top: a deeper
 * route's title wins, and its elements replace the ones above it that have the
 * same key, such as a `<meta>` of the same name or the canonical `<link>`. A
 * route's `static title` wins over its own `static head`'s. Each route's head
 * and body are its own model's: `static head = (post) => ...`.
 */
export function collectHead(routeInfos: Array<{ name: string; route?: any; context?: unknown }>): DocumentHead {
  const elements = new Map<string, HeadElement>();
  let title: string | undefined;

  for (const { name, route, context } of routeInfos) {
    if (!route || (route.head === undefined && route.title === undefined && route.body === undefined)) continue;

    const head = resolve<Head>(route, route.head, context);
    const body = resolve<Body>(route, route.body, context);
    title = resolve<string>(route, route.title, context) ?? head?.title ?? title;
    for (const element of [...(head ? headElements(head, name) : []), ...(body ? bodyElements(body, name) : [])]) {
      // Deleted first, so that a replaced element takes its place in the order of the deeper route.
      elements.delete(element.key);
      elements.set(element.key, element);
    }
  }

  return { title, elements: [...elements.values()] };
}

/**
 * Brings the elements `document` has from the router to `elements`: each kept
 * as it is when it has not changed, so a script in it does not run again,
 * replaced when it has, added when it is new, and removed when it is gone.
 * The elements @emberx/ssr rendered are adopted the same way.
 */
export function applyHead(document: Document, elements: HeadElement[]): void {
  const current = new Map<string, Element>();
  document.querySelectorAll(`[${MARKER}]`).forEach((node) => current.set(node.getAttribute(MARKER)!, node));
  // bodyStart's elements go before the page, after the ones already there.
  const page = [...document.body.childNodes].find((node) => !(node as Element).hasAttribute?.(MARKER)) ?? null;

  for (const element of elements) {
    const existing = current.get(element.key);
    current.delete(element.key);
    if (existing && isSame(existing, element)) continue;

    const node = createElement(document, element);
    if (existing) existing.replaceWith(node);
    else if (element.where === 'head') document.head.append(node);
    else if (element.where === 'bodyStart') document.body.insertBefore(node, page);
    else document.body.append(node);
  }
  current.forEach((node) => node.remove());
}

function resolve<T>(route: object, value: T | ((model: unknown) => T) | undefined, model: unknown): T | undefined {
  return typeof value === 'function' ? (value as (model: unknown) => T).call(route, model) : value;
}

function headElements(head: Head, routeName: string): HeadElement[] {
  checkFields(head, HEAD_FIELDS, 'head', routeName);

  return [
    ...(head.description === undefined
      ? []
      : [element('head', 'meta', 'meta:description', { name: 'description', content: head.description })]),
    ...(head.meta ?? []).map((attributes, index) => {
      const name = META_NAMES.find((attribute) => attributes[attribute] !== undefined);
      return element('head', 'meta', name ? `meta:${attributes[name]}` : `meta:${routeName}#${index}`, attributes);
    }),
    ...(head.link ?? []).map((attributes) => {
      const key =
        attributes.rel === 'canonical'
          ? 'canonical'
          : `${attributes.rel}:${attributes.hreflang ?? ''}:${attributes.href}`;
      return element('head', 'link', `link:${key}`, attributes);
    }),
    ...(head.script ?? []).map(({ children, ...attributes }, index) =>
      element('head', 'script', `script:${identity(attributes, routeName, index)}`, attributes, children),
    ),
  ];
}

function bodyElements(body: Body, routeName: string): HeadElement[] {
  checkFields(body, BODY_FIELDS, 'body', routeName);

  return (['start', 'end'] as const).flatMap((field) => {
    const where = field === 'start' ? 'bodyStart' : 'bodyEnd';
    return (body[field] ?? []).map(({ tag, children, innerHTML, ...attributes }, index) =>
      element(where, tag, `${where}:${identity(attributes, routeName, index)}`, attributes, children, innerHTML),
    );
  });
}

/** Reports the fields `value` has that a head or body does not, a typo for one of its own, with the ones it does have. */
function checkFields(value: object, fields: string[], what: string, routeName: string): void {
  const unknown = Object.keys(value).filter((key) => !fields.includes(key));
  if (unknown.length > 0) {
    throw new Error(
      `${routeName}'s ${what} has ${unknown.join(', ')}, which a ${what} does not: ${fields.join(', ')}.`,
    );
  }
}

function element(
  where: HeadElement['where'],
  tag: string,
  key: string,
  attributes: HeadAttributes,
  children?: string,
  innerHTML?: string,
): HeadElement {
  const written: Record<string, string | true> = {};
  for (const [name, value] of Object.entries(attributes)) {
    if (value === true) written[name] = true;
    else if (value !== false && value !== undefined) written[name] = String(value);
  }

  // A script's text is kept escaped, which runs and parses the same: the server writes it as it is, and the
  // browser finds the server's script the same as its own.
  const text = tag === 'script' && children !== undefined ? escapeScript(children, written.type) : children;

  return { where, tag, key, attributes: written, children: text, innerHTML };
}

function createElement(document: Document, { tag, key, attributes, children, innerHTML }: HeadElement): Element {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, attributeValue(value));
  node.setAttribute(MARKER, key);
  if (innerHTML !== undefined) node.innerHTML = innerHTML;
  else if (children !== undefined) node.textContent = children;

  return node;
}

function isSame(node: Element, { tag, attributes, children, innerHTML }: HeadElement): boolean {
  const names = node.getAttributeNames().filter((name) => name !== MARKER);

  return (
    node.localName === tag &&
    names.length === Object.keys(attributes).length &&
    names.every((name) => name in attributes && attributeValue(attributes[name]) === node.getAttribute(name)) &&
    (innerHTML !== undefined ? node.innerHTML === innerHTML : node.textContent === (children ?? ''))
  );
}

/** What tells an element apart from the others of its kind: its `id`, its `src`, or its route and place in it. */
function identity(attributes: HeadAttributes, routeName: string, index: number): string | number | boolean {
  return attributes.id ?? attributes.src ?? `${routeName}#${index}`;
}

/** An attribute's value as the DOM has it: a bare one's is empty. */
function attributeValue(value: string | true): string {
  return value === true ? '' : value;
}

/**
 * A script's text, which no `</script>` or `<!--` in it ends or comments out
 * early: in JSON every `<` is `\u003c`, which reads back the same, and in
 * JavaScript, where that would break code outside a string, the two sequences
 * are escaped as a string literal reads them back.
 */
function escapeScript(text: string, type: string | true | undefined): string {
  return typeof type === 'string' && type.includes('json')
    ? text.replace(/</g, '\\u003c')
    : text.replace(/<\/(script)/gi, '<\\/$1').replace(/<!--/g, '<\\!--');
}
