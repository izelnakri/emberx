import { resetRendering } from '@emberx/component';
import Router, { Route, hbs, service } from '@emberx/router';
import { renderBaseHTMLToString, embedToShoeboxScriptTag, renderURL, renderURLToString } from '@emberx/ssr';
import { applyHead } from '../../router/src/head.ts';
import { module, test } from 'qunitx';

const POSTS = {
  1: { title: 'Compilers are the New Frameworks' },
  2: { title: 'Adventures in Microbenchmarking' },
};

class HomeRoute extends Route {
  static title = 'Blog';
  static template = hbs`<h1>Home</h1>`;
}

// How many times a post was fetched.
let fetches = 0;

class PostRoute extends Route {
  static title = (post) => `${post.title} | Blog`;

  static async model({ post_id }) {
    fetches++;
    await new Promise((resolve) => setTimeout(resolve, 5));
    if (!POSTS[post_id]) throw new Error(`No post ${post_id}`);

    return POSTS[post_id];
  }

  static template = hbs`<h1>{{this.model.title}}</h1><p>Post {{@params.post_id}}</p>`;
}

class OldPostRoute extends Route {
  static beforeModel() {
    return this.router.transitionTo('/posts/1');
  }
}

// Reads the session of the request it renders for, in its model hook and in its template.
class AccountRoute extends Route {
  @service session;

  static async model() {
    await new Promise((resolve) => setTimeout(resolve, this.session.delay));

    return { greeting: `Hello ${this.session.user}` };
  }

  static template = hbs`<h1>{{this.model.greeting}}</h1><p>{{this.session.user}}'s account</p>`;
}

// A head with everything in it, and text that must not break the document it goes in.
class ArticleRoute extends Route {
  static head = {
    title: 'Fish & "Chips" <live>',
    description: 'Say "hi" & <wave>',
    meta: [{ property: 'og:title', content: 'Fish & Chips' }],
    link: [{ rel: 'canonical', href: 'https://blog.example/article?a=1&b=2' }],
    script: [{ type: 'application/ld+json', children: JSON.stringify({ name: '</script><script>alert(1)</script>' }) }],
  };
  static body = {
    start: [{ tag: 'noscript', innerHTML: '<img src="/pixel.gif">' }],
    end: [{ tag: 'script', src: '/analytics.js', async: true }],
  };

  static template = hbs`<h1>Article</h1>`;
}

// An app's index.html, as its build writes it.
const INDEX_HTML = `<!doctype html>
<html>
  <head>
    <title>My app</title>
    <script type="module" src="/app.js"></script>
  </head>
  <body class="app">
    <div id="app"></div>
  </body>
</html>`;

class PostErrorRoute extends Route {
  static template = hbs`<h1>Something went wrong: {{this.model.message}}</h1>`;
}

module('@emberx/ssr | renderURLToString', function (hooks) {
  hooks.beforeEach(function () {
    fetches = 0;
    startRouter();
  });
  hooks.afterEach(function () {
    Router.reset();
    resetRendering();
    // An #app of its own for each test, as test-helpers gives each its own #ember-testing: the
    // page an earlier test rendered into it is torn down after the next one renders there.
    document.getElementById('app')!.replaceWith(Object.assign(document.createElement('div'), { id: 'app' }));
  });

  test('renders the page a URL shows, after its model hooks', async function (assert) {
    const html = await renderURLToString('/posts/1', { hydratable: false });

    assert.equal(html, '<h1>Compilers are the New Frameworks</h1><p>Post 1</p>');
  });

  test('follows redirects to the page they end on', async function (assert) {
    assert.equal(
      await renderURLToString('/old-post', { hydratable: false }),
      '<h1>Compilers are the New Frameworks</h1><p>Post 1</p>',
    );
  });

  test('renders the error substate a failed model hook ends on', async function (assert) {
    assert.equal(
      await renderURLToString('/posts/9', { hydratable: false }),
      '<h1>Something went wrong: No post 9</h1>',
    );
  });

  test('renders URLs requested at once together, each to its own page', async function (assert) {
    const finished: string[] = [];
    const render = (url: string) =>
      renderURLToString(url, { hydratable: false }).then((html) => {
        finished.push(url);
        return html;
      });
    const pages = await Promise.all([render('/posts/1'), render('/'), render('/posts/2')]);

    assert.deepEqual(pages, [
      '<h1>Compilers are the New Frameworks</h1><p>Post 1</p>',
      '<h1>Home</h1>',
      '<h1>Adventures in Microbenchmarking</h1><p>Post 2</p>',
    ]);
    assert.equal(finished[0], '/', 'the page with no model to wait for is not held up by the ones before it');
  });

  test("each render's routes and pages find the services it was given", async function (assert) {
    const pages = await Promise.all([
      renderURLToString('/account', { hydratable: false, services: { session: { user: 'Ada', delay: 10 } } }),
      renderURLToString('/account', { hydratable: false, services: { session: { user: 'Grace', delay: 0 } } }),
    ]);

    assert.deepEqual(pages, ["<h1>Hello Ada</h1><p>Ada's account</p>", "<h1>Hello Grace</h1><p>Grace's account</p>"]);
  });

  test("the router Router.start() started is left as it was, the app's services with it", async function (assert) {
    const router = Router.owner.lookup('service:router');
    Router.addServices({ session: { user: 'Visitor', delay: 0 } });

    await renderURLToString('/account', { services: { session: { user: 'Ada', delay: 0 } } });

    assert.strictEqual(Router.owner.lookup('service:router'), router);
    assert.equal(Router.owner.lookup('service:session').user, 'Visitor');
    assert.equal(router.currentURL, undefined, 'it went nowhere');
  });

  test("the router's first render in a browser hydrates the page it rendered", async function (assert) {
    const html = await renderURLToString('/posts/2');
    // The page's container, as a browser receives it: created here unless a
    // test setup already made one with the id the router renders into.
    const router = Router.owner.lookup('service:router');
    const id = router.testing ? 'ember-testing' : 'app';
    const existing = document.getElementById(id);
    const element = existing ?? document.body.appendChild(Object.assign(document.createElement('div'), { id }));
    element.innerHTML = html;
    const heading = element.querySelector('h1');

    // The browser's own router, started on the page the server sent.
    startRouter();
    await Router.visit('/posts/2');

    assert.strictEqual(element.querySelector('h1'), heading, 'the same node, not a new one');
    assert.equal(heading!.textContent, 'Adventures in Microbenchmarking');
    assert.notOk(element.innerHTML.includes('%+b'), 'the markers are gone');
    // A container the page had already is torn down with the router; clearing
    // it here would remove nodes Ember's teardown still means to remove.
    if (!existing) element.remove();
  });

  test('renderURL gives the document what it needs: the title, the URL redirects ended on, and the models', async function (assert) {
    const page = await renderURL('/old-post', { hydratable: false });

    assert.deepEqual(page, {
      html: '<h1>Compilers are the New Frameworks</h1><p>Post 1</p>',
      title: 'Compilers are the New Frameworks | Blog',
      head: '<title>Compilers are the New Frameworks | Blog</title>',
      bodyStart: '',
      bodyEnd: '',
      url: '/posts/1',
      status: 200,
      models: { application: {}, posts: {}, 'posts.post': POSTS[1] },
    });
    assert.deepEqual((await renderURL('/')).title, 'Blog');
  });

  test('renderURL renders the head, escaped, and the elements first and last in <body>', async function (assert) {
    const page = await renderURL('/article');
    const marker = (key: string) => `data-emberx-head="${key}"`;

    assert.equal(
      page.head,
      '<title>Fish &amp; "Chips" &lt;live&gt;</title>' +
        `<meta name="description" content="Say &quot;hi&quot; &amp; &lt;wave&gt;" ${marker('meta:description')}>` +
        `<meta property="og:title" content="Fish &amp; Chips" ${marker('meta:og:title')}>` +
        `<link rel="canonical" href="https://blog.example/article?a=1&amp;b=2" ${marker('link:canonical')}>` +
        `<script type="application/ld+json" ${marker('script:article#0')}>{"name":"\\u003c/script>\\u003cscript>alert(1)\\u003c/script>"}</script>`,
    );
    assert.equal(page.bodyStart, `<noscript ${marker('bodyStart:article#0')}><img src="/pixel.gif"></noscript>`);
    assert.equal(page.bodyEnd, `<script src="/analytics.js" async ${marker('bodyEnd:/analytics.js')}></script>`);
  });

  test("the browser's router adopts the head the server rendered, rather than adding it again", async function (assert) {
    const page = await renderURL('/article');
    const browser = document.implementation.createHTMLDocument('');
    browser.head.innerHTML = page.head;
    browser.body.innerHTML = `${page.bodyStart}<div id="app">${page.html}</div>${page.bodyEnd}`;
    const before = [...browser.querySelectorAll('[data-emberx-head]')];

    // The browser's router, on the page the server sent: only its head is looked at here, so it renders nothing.
    const router = Router.createInstance();
    router.renderPage = async () => {};
    await router.visit('/article');
    applyHead(browser, router.currentHead);

    const after = [...browser.querySelectorAll('[data-emberx-head]')];
    assert.equal(before.length, 6);
    assert.true(
      after.length === before.length && after.every((node, index) => node === before[index]),
      'every one the same node',
    );
    assert.equal(
      JSON.parse(browser.querySelector('script[type="application/ld+json"]')!.textContent!).name,
      '</script><script>alert(1)</script>',
      'the JSON reads back as it was',
    );
  });

  test("the page's status: 200 for a route's page, 404 for a URL no route matches, 500 for an error substate", async function (assert) {
    assert.equal((await renderURL('/posts/1')).status, 200);
    assert.equal((await renderURL('/old-post')).status, 200, 'a redirect ends on a page');

    const notFound = await renderURL('/no/such/page', { hydratable: false });
    assert.equal(notFound.status, 404);
    assert.equal(notFound.title, 'Page not found');
    assert.ok(notFound.html.includes('There is no page at /no/such/page.'));

    assert.equal((await renderURL('/posts/9')).status, 500);
  });

  test('renders a route loaded when it is first entered', async function (assert) {
    Router.start([{ path: '/lazy', route: () => Promise.resolve({ default: HomeRoute }) }], { location: 'none' });

    const rendered = await renderURL('/lazy', { hydratable: false });
    assert.equal(rendered.html, '<h1>Home</h1>');
    assert.equal(rendered.title, 'Blog');
  });

  test('a catch-all the app declares is answered with a 404 too', async function (assert) {
    class LostRoute extends Route {
      static template = hbs`<h1>Lost</h1>`;
    }
    Router.start([{ path: '/docs/*path', route: LostRoute }], { location: 'none' });

    const page = await renderURL('/docs/a/b', { hydratable: false });
    assert.equal(page.html, '<h1>Lost</h1>');
    assert.equal(page.status, 404);
  });

  test('an error substate gives no models, which the browser would take for the page it failed to show', async function (assert) {
    assert.deepEqual((await renderURL('/posts/9')).models, {});
  });

  test("the browser's first transition takes the models the server rendered with, and only that one", async function (assert) {
    const { models } = await renderURL('/posts/2');
    assert.equal(fetches, 1);

    startRouter({ models: JSON.parse(embedToShoeboxScriptTag(models)) });
    await Router.visit('/posts/2');
    assert.equal(fetches, 1, 'the browser did not fetch the post again');
    assert.equal(Router.owner.lookup('service:router').currentTitle, 'Adventures in Microbenchmarking | Blog');

    await Router.visit('/posts/1');
    await Router.visit('/posts/2');
    assert.equal(fetches, 3, 'later transitions run the model hook');
  });

  test("without models, the browser's router reads them from the shoebox the server left", async function (assert) {
    const { models } = await renderURL('/posts/2');
    const shoebox = Object.assign(document.createElement('script'), {
      id: 'shoebox',
      type: 'application/json',
      textContent: embedToShoeboxScriptTag(models),
    });
    document.body.append(shoebox);

    startRouter();
    assert.notOk(shoebox.isConnected, 'the shoebox is read once, and removed');

    await Router.visit('/posts/2');
    assert.equal(fetches, 1, 'the browser did not fetch the post again');
  });

  test('embedToShoeboxScriptTag keeps a script element whole', function (assert) {
    const json = embedToShoeboxScriptTag({ bio: '</script><script>alert(1)</script><!--\u2028' });

    assert.notOk(/<|\u2028/.test(json));
    assert.deepEqual(JSON.parse(json), { bio: '</script><script>alert(1)</script><!--\u2028' });
  });

  test("renderBaseHTMLToString puts the page in the base HTML, its title in place of the base HTML's", async function (assert) {
    const rendered = await renderURL('/article', { hydratable: false });

    assert.equal(
      renderBaseHTMLToString(INDEX_HTML, rendered),
      `<!doctype html>
<html>
  <head>
    <script type="module" src="/app.js"></script>
  ${rendered.head}</head>
  <body class="app">${rendered.bodyStart}
    <div id="app"><h1>Article</h1></div><script type="application/json" id="shoebox">{"application":{},"article":{}}</script>
  ${rendered.bodyEnd}</body>
</html>`,
    );
  });

  test("renderBaseHTMLToString keeps the base HTML's title for a page without one, and a page's $ as it is", async function (assert) {
    const rendered = {
      ...(await renderURL('/', { hydratable: false })),
      title: undefined,
      head: '',
      html: "<p>$& $' $1</p>",
    };
    const html = renderBaseHTMLToString(INDEX_HTML, rendered);

    assert.ok(html.includes('<title>My app</title>'));
    assert.ok(html.includes(`<div id="app"><p>$& $' $1</p></div>`));
  });

  test("renderBaseHTMLToString places everything by the base HTML's markup, whatever the page's holds", async function (assert) {
    const rendered = {
      ...(await renderURL('/article', { hydratable: false })),
      html: '<pre>&lt;/body&gt;</pre></body><p>after</p>',
    };
    const html = renderBaseHTMLToString(
      INDEX_HTML.replace('<div id="app">', '<svg><title>Logo</title></svg><div id="app">'),
      rendered,
    );

    assert.ok(html.includes('<pre>&lt;/body&gt;</pre></body><p>after</p></div>'), "the page's markup is as it was");
    assert.ok(
      html.endsWith(`${rendered.bodyEnd}</body>\n</html>`),
      "the page's body elements end the base HTML's <body>",
    );
    assert.ok(html.includes('<svg><title>Logo</title></svg>'), "an <svg>'s <title> in the body stays");
    assert.equal(html.match(/<title>/g)!.length, 2, "the page's title replaces the head's; the <svg>'s stays");
  });

  test('renderBaseHTMLToString needs a head, a body and an empty #app to put the page in', async function (assert) {
    const rendered = await renderURL('/');

    assert.throws(
      () => renderBaseHTMLToString('<html><head></head><body></body></html>', rendered),
      /empty <div id="app"><\/div>/,
    );
    assert.throws(
      () => renderBaseHTMLToString('<div id="app"></div>', rendered),
      /needs the base HTML to have a <\/head>, a <body>/,
    );
  });

  test('needs a started router', async function (assert) {
    Router.reset();

    await assert.rejects(renderURLToString('/'), /needs Router.start\(\) to have started a router first/);
  });
});

/** The app's router, started the same way on the server and in the browser. */
function startRouter(options = {}) {
  return Router.start(
    [
      { path: '/', route: HomeRoute },
      { path: '/posts/:post_id', route: PostRoute, errorRoute: PostErrorRoute },
      { path: '/old-post', route: OldPostRoute },
      { path: '/account', route: AccountRoute },
      { path: '/article', route: ArticleRoute },
    ],
    { location: 'none', ...options },
  );
}
