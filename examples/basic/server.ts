// The basic app rendered on a server, as `npm run examples:basic` serves it: the browser's
// renderComponent (index.ts) hydrates the markup. No routes and no data, a component alone.
import { renderToString } from '@emberx/ssr';
import MyComponent from './src/MyComponent.ts';
import LocaleService from './src/services/LocaleService.ts';

const BASE_HTML = await Deno.readTextFile('public/basic.html');

export function renderPage(): Promise<string> {
  return renderToString(MyComponent, { owner: { services: { locale: new LocaleService('en_US') } } });
}

export default async function respond(url: URL): Promise<Response> {
  if (url.pathname !== '/') {
    return new Response('Not Found', { status: 404 });
  }

  const html = BASE_HTML.replace('<div id="app"></div>', `<div id="app">${await renderPage()}</div>`);
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
