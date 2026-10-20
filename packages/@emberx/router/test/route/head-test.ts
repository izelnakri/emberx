import { module, test } from 'qunitx';
import Router, { Route, hbs } from '@emberx/router';
import { visit } from '@emberx/test-helpers';
import { applyHead, collectHead, MARKER } from '../../src/head.ts';
import setupTest from '../helpers/index.ts';

const POSTS = {
  1: { id: 1, title: 'Compilers are the New Frameworks', summary: 'Frameworks are becoming compilers.' },
};

class ApplicationRoute extends Route {
  static title = 'Blog';
  static head = {
    description: 'Essays on web frameworks.',
    meta: [{ property: 'og:site_name', content: 'Blog' }],
    link: [{ rel: 'canonical', href: 'https://blog.example/' }],
  };
  static body = { end: [{ tag: 'script', src: '/analytics.js', async: true }] };
}

class PostRoute extends Route {
  static head(post) {
    return {
      title: `${post.title} | Blog`,
      description: post.summary,
      meta: [{ property: 'og:title', content: post.title }],
      link: [{ rel: 'canonical', href: `https://blog.example/posts/${post.id}` }],
    };
  }

  static model({ post_id }) {
    if (!POSTS[post_id]) throw new Error(`No post ${post_id}`);

    return POSTS[post_id];
  }

  static template = hbs`<h1>{{this.model.title}}</h1>`;
}

class AboutRoute extends Route {
  static template = hbs`<h1>About</h1>`;
}

class PostErrorRoute extends Route {
  static head = { title: 'Not found | Blog', meta: [{ name: 'robots', content: 'noindex' }] };
  static template = hbs`<h1>{{this.model.message}}</h1>`;
}

module('@emberx/router | Head', function (hooks) {
  setupTest(hooks, () =>
    Router.start([
      { name: 'application', route: ApplicationRoute },
      { path: '/about', route: AboutRoute },
      { path: '/posts/:post_id', route: PostRoute, errorRoute: PostErrorRoute },
    ]),
  );

  module('merging the routes from the top', function () {
    test("a page's elements replace the application's with the same identity, and the rest stay", function (assert) {
      const { title, elements } = collectHead([
        { name: 'application', route: ApplicationRoute },
        { name: 'posts', route: PostRoute, context: POSTS[1] },
      ]);

      assert.equal(title, 'Compilers are the New Frameworks | Blog', "the deepest route's");
      assert.deepEqual(
        elements.map(({ where, tag, attributes }) => [where, tag, attributes]),
        [
          ['head', 'meta', { property: 'og:site_name', content: 'Blog' }],
          ['bodyEnd', 'script', { src: '/analytics.js', async: true }],
          ['head', 'meta', { name: 'description', content: 'Frameworks are becoming compilers.' }],
          ['head', 'meta', { property: 'og:title', content: 'Compilers are the New Frameworks' }],
          ['head', 'link', { rel: 'canonical', href: 'https://blog.example/posts/1' }],
        ],
      );
    });

    test("a route's static title wins over its head's, and a function of the model runs with the route as `this`", function (assert) {
      class TitledRoute extends Route {
        static title = 'From title';
        static head() {
          return { title: `From ${this.name}` };
        }
      }
      class HeadOnlyRoute extends Route {
        static head() {
          return { title: `From ${this.name}` };
        }
      }

      assert.equal(collectHead([{ name: 'a', route: TitledRoute }]).title, 'From title');
      assert.equal(collectHead([{ name: 'a', route: HeadOnlyRoute }]).title, 'From HeadOnlyRoute');
    });

    test('elements with nothing to identify them add up, and attributes set to false or undefined are left out', function (assert) {
      class ThemeRoute extends Route {
        static head = { meta: [{ content: 'a' }, { content: 'b', hidden: false, lang: undefined }] };
      }

      assert.deepEqual(
        collectHead([
          { name: 'application', route: ThemeRoute },
          { name: 'page', route: ThemeRoute },
        ]).elements.map(({ key, attributes }) => [key, attributes]),
        [
          ['meta:application#0', { content: 'a' }],
          ['meta:application#1', { content: 'b' }],
          ['meta:page#0', { content: 'a' }],
          ['meta:page#1', { content: 'b' }],
        ],
      );
    });

    test('a head or a body with a field it does not have is reported, with the fields it has', function (assert) {
      class HeadTypoRoute extends Route {
        static head = { metas: [] };
      }
      class BodyTypoRoute extends Route {
        static body = { bottom: [] };
      }

      assert.throws(
        () => collectHead([{ name: 'typo', route: HeadTypoRoute }]),
        /typo's head has metas, which a head does not: title, description, meta, link, script\./,
      );
      assert.throws(
        () => collectHead([{ name: 'typo', route: BodyTypoRoute }]),
        /typo's body has bottom, which a body does not: start, end\./,
      );
    });

    test("a body is a function of the route's model too, and merges as a head does", function (assert) {
      class PageRoute extends Route {
        static body = (post) => ({
          start: [{ tag: 'div', id: 'banner', children: `Reading ${post.title}` }],
          end: [{ tag: 'script', src: '/analytics.js', async: true, defer: true }],
        });
      }

      assert.deepEqual(
        collectHead([
          { name: 'application', route: ApplicationRoute },
          { name: 'posts', route: PageRoute, context: POSTS[1] },
        ]).elements.filter(({ where }) => where !== 'head'),
        [
          {
            where: 'bodyStart',
            tag: 'div',
            key: 'bodyStart:banner',
            attributes: { id: 'banner' },
            children: 'Reading Compilers are the New Frameworks',
            innerHTML: undefined,
          },
          {
            where: 'bodyEnd',
            tag: 'script',
            key: 'bodyEnd:/analytics.js',
            attributes: { src: '/analytics.js', async: true, defer: true },
            children: undefined,
            innerHTML: undefined,
          },
        ],
        "the page's analytics script replaces the application's, which has the same src",
      );
    });
  });

  module('the router', function () {
    test('keeps the head of the routes it ends on, error substates included', async function (assert) {
      const router = Router.owner.lookup('service:router');
      const describe = () =>
        Object.fromEntries(
          router.currentHead.map(({ key, attributes }) => [
            key,
            attributes.content ?? attributes.href ?? attributes.src,
          ]),
        );

      await visit('/about');
      assert.equal(router.currentTitle, 'Blog');
      assert.deepEqual(describe(), {
        'meta:description': 'Essays on web frameworks.',
        'meta:og:site_name': 'Blog',
        'link:canonical': 'https://blog.example/',
        'bodyEnd:/analytics.js': '/analytics.js',
      });

      await visit('/posts/1');
      assert.equal(router.currentTitle, 'Compilers are the New Frameworks | Blog');
      assert.equal(describe()['link:canonical'], 'https://blog.example/posts/1');

      await visit('/posts/9');
      assert.equal(router.currentTitle, 'Not found | Blog');
      assert.equal(describe()['meta:robots'], 'noindex');
    });

    test("a browser's router outside a test puts the head in the document after each transition", async function (assert) {
      const title = document.title;
      const router = Router.createInstance({ location: 'history' });
      // A browser's router as an app has it, minus what would change this test page's URL and content.
      router.testing = false;
      router.renderPage = async () => {};
      router.updateURL = router.replaceURL = () => {};

      try {
        await router.visit('/posts/1');
        assert.equal(document.title, 'Compilers are the New Frameworks | Blog');
        assert.equal(
          document.head.querySelector(`[${MARKER}="link:canonical"]`)!.getAttribute('href'),
          'https://blog.example/posts/1',
        );
        assert.ok(document.body.lastElementChild!.matches(`script[src="/analytics.js"][${MARKER}]`));

        await router.visit('/about');
        assert.equal(document.title, 'Blog');
        assert.equal(
          document.head.querySelector(`[${MARKER}="link:canonical"]`)!.getAttribute('href'),
          'https://blog.example/',
        );
        assert.notOk(document.querySelector('meta[property="og:title"]'), "the post's own is gone");
      } finally {
        router.stopListening();
        applyHead(document, []);
        document.title = title;
      }
    });

    test('under test, it leaves the document alone', async function (assert) {
      const before = document.head.innerHTML;

      await visit('/posts/1');

      assert.equal(document.head.innerHTML, before);
      assert.notOk(document.querySelector(`[${MARKER}]`));
    });
  });

  module('applying it to a document', function () {
    test('puts each element where it goes: in <head>, first in <body> before the page, or last', function (assert) {
      const page = documentWithPage();

      applyHead(page, [
        element('head', 'meta', 'meta:description', { name: 'description', content: 'Essays' }),
        element('bodyStart', 'div', 'bodyStart:a', { id: 'consent' }, { innerHTML: '<b>Cookies</b>' }),
        element('bodyStart', 'div', 'bodyStart:b', { id: 'banner' }, { children: 'Hello <you>' }),
        element('bodyEnd', 'script', 'bodyEnd:/analytics.js', { src: '/analytics.js', async: true }),
      ]);

      assert.equal(
        page.head.innerHTML,
        `<title>Blog</title><meta name="description" content="Essays" ${MARKER}="meta:description">`,
      );
      assert.equal(
        page.body.innerHTML,
        `<div id="consent" ${MARKER}="bodyStart:a"><b>Cookies</b></div>` +
          `<div id="banner" ${MARKER}="bodyStart:b">Hello &lt;you&gt;</div>` +
          `<div id="app">page</div>` +
          `<script src="/analytics.js" async="" ${MARKER}="bodyEnd:/analytics.js"></script>`,
      );
    });

    test('keeps what did not change, so a script does not run again, and replaces, adds and removes the rest', function (assert) {
      const page = documentWithPage();
      const analytics = element('bodyEnd', 'script', 'bodyEnd:/analytics.js', { src: '/analytics.js', async: true });
      applyHead(page, [
        element('head', 'meta', 'meta:description', { name: 'description', content: 'Essays' }),
        element('head', 'link', 'link:canonical', { rel: 'canonical', href: '/' }),
        analytics,
      ]);
      const [description, canonical, script] = page.querySelectorAll(`[${MARKER}]`);

      applyHead(page, [
        element('head', 'meta', 'meta:description', { name: 'description', content: 'Essays' }),
        element('head', 'link', 'link:canonical', { rel: 'canonical', href: '/posts/1' }),
        element('head', 'meta', 'meta:og:title', { property: 'og:title', content: 'Compilers' }),
        analytics,
      ]);

      assert.strictEqual(page.querySelector('meta[name="description"]'), description, 'unchanged: the same node');
      assert.strictEqual(page.querySelector('script'), script, 'the script is not added again');
      assert.notOk(canonical.isConnected, 'changed: replaced');
      assert.equal(page.querySelector('link[rel="canonical"]')!.getAttribute('href'), '/posts/1');
      assert.ok(page.querySelector('meta[property="og:title"]'), 'new: added');

      applyHead(page, []);
      assert.equal(page.querySelectorAll(`[${MARKER}]`).length, 0, 'gone: removed');
      assert.equal(page.head.innerHTML, '<title>Blog</title>', 'what the router did not add stays');
    });
  });
});

function documentWithPage(): Document {
  const page = document.implementation.createHTMLDocument('Blog');
  page.body.innerHTML = '<div id="app">page</div>';

  return page;
}

function element(where, tag, key, attributes, content: { children?: string; innerHTML?: string } = {}) {
  return { where, tag, key, attributes, ...content };
}
