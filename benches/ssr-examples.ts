/**
 * The example apps rendered on a server, as `npm run examples:basic` and `examples:blog` serve
 * them: ssr-examples.bench.ts registers these with templates compiled at runtime, and
 * ssr-examples.precompiled.bench.ts, which scripts/check-benchmarks.ts bundles with the
 * templates compiled at build time.
 */
import { isTemplateCompilerLoaded } from '@emberx/component';
import { renderToString } from '@emberx/ssr';
import { renderPage as renderBasicPage } from '../examples/basic/server.ts';
import MyComponent from '../examples/basic/src/MyComponent.ts';
import OtherComponent from '../examples/basic/src/OtherComponent.ts';
import LocaleService from '../examples/basic/src/services/LocaleService.ts';
import respondForBlog, { renderPage as renderBlogPage } from '../examples/blog/server.ts';

// Every result is assigned here, so the optimiser cannot delete the work measured.
export let sink: unknown;

export default async function benchExamples(templates: 'runtime' | 'precompiled'): Promise<void> {
  // The blog's API, which its routes fetch their comments from over HTTP, as on its server.
  const api = Deno.serve({ hostname: 'localhost', port: 0, onListen() {} }, (request) =>
    respondForBlog(new URL(request.url)),
  );
  api.unref();
  const origin = `http://localhost:${api.addr.port}`;

  await renderBlogPage('/preview/11', origin);
  if (templates === 'precompiled' && isTemplateCompilerLoaded()) {
    throw new Error('The precompiled apps loaded Ember’s template compiler, which precompiling is to spare them.');
  }

  const group = `ssr-examples (${templates})`;
  const bench = (name: string, fn: () => Promise<unknown>) =>
    Deno.bench({ name: `ssr-examples/${name} (${templates})`, group, fn: async () => void (sink = await fn()) });

  bench('basic: a component', renderBasicPage);
  // Classes of their own each time, as a server's first request renders: a runtime template compiles first.
  bench('basic: a component, rendered first', () => {
    class Other extends OtherComponent {}
    class Page extends MyComponent {
      static includes = { ...MyComponent.includes, OtherComponent: Other };
    }
    return renderToString(Page, { owner: { services: { locale: new LocaleService('en_US') } } });
  });
  bench('blog: a routed page', () => renderBlogPage('/', origin));
  bench('blog: a routed page, with comments from the API', () => renderBlogPage('/preview/11?status=pending', origin));
  bench('blog: the response for a page, with comments from the API', async () =>
    (await respondForBlog(new URL('/preview/11', origin))).text(),
  );
}
