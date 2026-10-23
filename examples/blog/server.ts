// The blog rendered on a server, as `npm run examples:blog` serves it: each URL through its router,
// with its comments fetched from its own /comments API, which the browser's router then hydrates.
import { renderBaseHTMLToString, renderURL, type RenderedPage } from '@emberx/ssr';
import findComments from './comments.ts';
import API from './services/api.ts';
import startRouter from './start-router.ts';

const BASE_HTML = await Deno.readTextFile('public/index.html');

startRouter();

/** The page at `url`, its routes fetching from the API at `origin`. */
export function renderPage(url: string, origin: string): Promise<RenderedPage> {
  return renderURL(url, { services: { api: new API(origin) } });
}

export default async function respond(url: URL): Promise<Response> {
  if (url.pathname === '/comments') {
    return Response.json(findComments(Object.fromEntries(url.searchParams)));
  }

  const path = url.pathname + url.search;
  // The API is this server's own, which it asks at localhost, whatever host the request named.
  const rendered = await renderPage(path, `http://localhost:${url.port}`);
  if (rendered.url !== path) {
    return Response.redirect(new URL(rendered.url, url), 302);
  }

  return new Response(renderBaseHTMLToString(BASE_HTML, rendered), {
    status: rendered.status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
