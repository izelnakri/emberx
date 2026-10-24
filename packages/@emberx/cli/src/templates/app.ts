/**
 * The files `emberx new` writes, by path: an app with a router, two routes, a component and
 * their tests, and with `--ssr`, a server that renders each page and the browser hydrates.
 */
import { VERSION } from '../version.ts';

/** The line in src/router.ts before which `emberx generate route` adds a route. */
export const ROUTES_MARKER = '// emberx generate route adds its routes above this line.';

export function appFiles(name: string, { ssr = false }: { ssr?: boolean } = {}): Record<string, string> {
  const emberx = `^${VERSION}`;
  const manifest = {
    name,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'emberx dev',
      build: ssr ? 'emberx build --ssr' : 'emberx build',
      test: 'emberx test',
      ...(ssr ? { start: 'node dist/server/server.js' } : {}),
    },
    dependencies: {
      '@emberx/component': emberx,
      '@emberx/helper': emberx,
      '@emberx/router': emberx,
      ...(ssr ? { '@emberx/ssr': emberx } : {}),
    },
    devDependencies: {
      '@emberx/cli': emberx,
      '@emberx/test-helpers': emberx,
      qunitx: '^1.4.0',
      'qunitx-cli': '^0.39.0',
    },
  };

  return {
    'package.json': `${JSON.stringify(manifest, null, 2)}\n`,
    'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${name}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/app.ts"></script>
  </body>
</html>
`,
    'src/app.ts': `import startRouter from './router.ts';

// Hydrates the page a server rendered, with the models it left in #shoebox, or renders it.
await startRouter().visit(\`\${location.pathname}\${location.search}\`);
`,
    'src/router.ts': `import Router, { type StartOptions } from '@emberx/router';
import IndexRoute from './routes/index.ts';

// The browser's router, and with --ssr the server's: each page is a route. A route given as
// \`() => import(...)\` is a chunk of its own, downloaded when it is first visited.
export default function startRouter(options: StartOptions = {}): typeof Router {
  return Router.start(
    [
      { path: '/', route: IndexRoute },
      { path: '/about', route: () => import('./routes/about.ts') },
      ${ROUTES_MARKER}
    ],
    options,
  );
}
`,
    'src/routes/index.ts': `import { Route, LinkTo, hbs } from '@emberx/router';
import Counter from '../components/counter.ts';

export default class IndexRoute extends Route {
  static title = '${name}';

  static includes = { Counter, LinkTo };
  static template = hbs\`
    <main>
      <h1>${name}</h1>
      <p>Edit src/routes/index.ts, and the page reloads with it.</p>
      <Counter @start={{1}} />
      <LinkTo @route="about">About</LinkTo>
    </main>
  \`;
}
`,
    'src/routes/about.ts': `import { Route, LinkTo, hbs } from '@emberx/router';

export default class AboutRoute extends Route {
  static title = 'About | ${name}';

  static includes = { LinkTo };
  static template = hbs\`
    <main>
      <h1>About</h1>
      <LinkTo @route="index">Home</LinkTo>
    </main>
  \`;
}
`,
    'src/components/counter.ts': `import Component, { action, hbs, tracked } from '@emberx/component';

export default class Counter extends Component<{ start?: number }> {
  @tracked accessor count = this.args.start ?? 0;

  static template = hbs\`
    <button type="button" {{on "click" this.increment}} data-test-counter>Clicked {{this.count}} times</button>
  \`;

  @action increment(): void {
    this.count++;
  }
}
`,
    'tests/components/counter-test.ts': `import { module, test } from 'qunitx';
import { click, hbs, render, setupRenderingTest } from '@emberx/test-helpers';
import Counter from '../../src/components/counter.ts';

module('Component | Counter', function (hooks) {
  setupRenderingTest(hooks);

  test('counts the clicks', async function (assert) {
    await render(hbs\`<Counter @start={{1}} />\`, { Counter });
    // A data-test- attribute rather than 'button': in a browser, QUnit's toolbar has buttons too.
    assert.dom('[data-test-counter]').hasText('Clicked 1 times');

    await click('[data-test-counter]');
    assert.dom('[data-test-counter]').hasText('Clicked 2 times');
  });
});
`,
    'tests/routes/index-test.ts': `import { module, test } from 'qunitx';
import { currentURL, setupApplicationTest, visit } from '@emberx/test-helpers';
import startRouter from '../../src/router.ts';

module('Route | index', function (hooks) {
  setupApplicationTest(hooks, startRouter);

  test('shows the front page, and links to the about page', async function (assert) {
    await visit('/');
    assert.equal(currentURL(), '/');
    assert.dom('h1').hasText('${name}');

    await visit('/about');
    assert.dom('h1').hasText('About');
  });
});
`,
    'tsconfig.json': `${JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          lib: ['ES2023', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          noEmit: true,
          strict: true,
          noImplicitOverride: true,
          skipLibCheck: true,
          types: [],
        },
        include: ['src', 'tests'],
      },
      null,
      2,
    )}\n`,
    '.gitignore': 'node_modules/\ndist/\ntmp/\n.emberx-dev/\n',
    'README.md': `# ${name}

An [emberx](https://github.com/izelnakri/emberx) app.

\`\`\`sh
npm run dev     # http://localhost:4200, rebuilt and reloaded on every change
npm test        # the tests in tests/, with QUnitX
npm run build   # dist/, for production${ssr ? '\nnpm start       # the server dist/server/server.js, rendering each page' : ''}
\`\`\`

\`npx emberx generate route posts\` adds a route, \`npx emberx generate component post-card\` a
component, each with its test. \`npx emberx help\` lists every command.
`,
    ...(ssr ? { 'src/server.ts': serverFile() } : {}),
  };
}

function serverFile(): string {
  return `// Renders each page on the server, which the browser hydrates: \`npm run build && npm start\`.
// It serves what \`emberx build --ssr\` wrote: dist/, and itself as dist/server/server.js.
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderBaseHTMLToString, renderURL } from '@emberx/ssr';
import startRouter from './router.ts';

const DIST = fileURLToPath(new URL('../', import.meta.url));
const PORT = Number(process.env.PORT ?? 3000);
const TYPES: Record<string, string> = {
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const baseHTML = await readFile(join(DIST, 'index.html'), 'utf8');
startRouter({ location: 'none' });

createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', \`http://\${request.headers.host ?? 'localhost'}\`);
  const file = join(DIST, normalize(url.pathname));
  if (extname(url.pathname) && file.startsWith(DIST) && !file.startsWith(join(DIST, 'server'))) {
    const contents = await readFile(file).catch(() => null);
    response.writeHead(contents ? 200 : 404, { 'content-type': TYPES[extname(file)] ?? 'text/plain' });
    return response.end(contents ?? 'Not Found');
  }

  const rendered = await renderURL(url.pathname + url.search);
  if (rendered.url !== url.pathname + url.search) {
    response.writeHead(302, { location: rendered.url });
    return response.end();
  }
  response.writeHead(rendered.status, { 'content-type': 'text/html; charset=utf-8' });
  response.end(renderBaseHTMLToString(baseHTML, rendered));
}).listen(PORT, () => console.log(\`http://localhost:\${PORT}\`));
`;
}
