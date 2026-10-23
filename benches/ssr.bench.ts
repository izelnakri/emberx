/**
 * @emberx/ssr's renderBaseHTMLToString() with a 40KB page, as a server runs it for every
 * response. Each result is encoded, so V8 builds the string in full rather than
 * leaving it an unflattened concatenation, which would look free.
 */
import { renderBaseHTMLToString, type RenderedPage } from '@emberx/ssr';

const INDEX_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My app</title>
    <link rel="stylesheet" href="/assets/app-3f9a2c.css">
    ${'<link rel="modulepreload" href="/assets/chunk.js">\n    '.repeat(10)}
    <script type="module" src="/assets/app-8b1e4d.js"></script>
  </head>
  <body class="app">
    <div id="app"></div>
  </body>
</html>`;

const RENDERED: RenderedPage = {
  html: `<article><h1>A post</h1><p>${'Some text, with <b>markup</b> in it. '.repeat(1000)}</p></article>`,
  title: 'A post | Blog',
  head: '<title>A post | Blog</title><meta name="description" content="A post" data-emberx-head="meta:description">',
  bodyStart: '',
  bodyEnd: '<script src="/analytics.js" async data-emberx-head="bodyEnd:/analytics.js"></script>',
  url: '/posts/1',
  status: 200,
  models: { application: {}, posts: {}, 'posts.post': { id: 1, title: 'A post', body: 'x'.repeat(2000) } },
};

const encoder = new TextEncoder();

// Every result is assigned here, so the optimiser cannot delete the work measured.
export let sink: unknown;

Deno.bench({
  name: 'ssr/renderBaseHTMLToString (40KB page)',
  group: 'ssr',
  fn: () => void (sink = encoder.encode(renderBaseHTMLToString(INDEX_HTML, RENDERED))),
});
