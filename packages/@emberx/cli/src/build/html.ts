/**
 * The app's page as a build serves it: its script that loads the entry module loading the
 * bundle instead, and what the bundle needs linked in its head.
 */
import { dirname, resolve } from 'node:path';

const SCRIPT = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>\s*<\/script>/gi;

export interface PageAssets {
  /** The app's root, which a `src="/…"` is relative to. */
  root: string;
  /** The page's path, which any other `src` is relative to. */
  htmlPath: string;
  /** The entry module the page loads. */
  entry: string;
  /** The bundle's URL, which loads instead. */
  script: string;
  /** The chunks the bundle imports, which the browser can fetch beside it rather than after it. */
  preloads?: string[];
  /** The stylesheets the bundle imported. */
  styles?: string[];
  /** What goes last in `<body>`: `emberx dev`'s live reload. */
  bodyEnd?: string;
}

export function rewritePage(
  html: string,
  { root, htmlPath, entry, script, preloads = [], styles = [], bodyEnd = '' }: PageAssets,
): string {
  const tag = `<script type="module" src="${script}"></script>`;
  let found = false;
  const page = html.replace(SCRIPT, (whole, src: string) => {
    const path = src.startsWith('/') ? resolve(root, `.${src}`) : resolve(dirname(htmlPath), src);
    if (path !== entry) return whole;

    found = true;
    return tag;
  });
  const head = [
    ...styles.map((href) => `<link rel="stylesheet" href="${href}">`),
    ...preloads.map((href) => `<link rel="modulepreload" href="${href}">`),
  ].join('');
  const end = `${found ? '' : tag}${bodyEnd}`;

  return insertBefore(insertBefore(page, '</head>', head), '</body>', end);
}

/** `html` with `text` before its last `marker`, or at its end when it has none. */
function insertBefore(html: string, marker: string, text: string): string {
  if (!text) return html;

  const at = html.lastIndexOf(marker);
  return at === -1 ? html + text : html.slice(0, at) + text + html.slice(at);
}
