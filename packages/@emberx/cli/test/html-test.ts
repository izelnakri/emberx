import { module, test } from 'qunitx';
import { rewritePage } from '../src/build/html.ts';

const PAGE = `<html><head><title>app</title></head><body><div id="app"></div><script type="module" src="/src/app.ts"></script></body></html>`;

module('@emberx/cli | rewritePage', function () {
  test("points the page's script at the bundle, and links what the bundle needs in its head", function (assert) {
    const page = rewritePage(PAGE, {
      root: '/app',
      htmlPath: '/app/index.html',
      entry: '/app/src/app.ts',
      script: '/assets/app-ABC.js',
      preloads: ['/assets/chunks/chunk-1.js'],
      styles: ['/assets/app-ABC.css'],
    });

    assert.equal(
      page,
      '<html><head><title>app</title><link rel="stylesheet" href="/assets/app-ABC.css"><link rel="modulepreload" href="/assets/chunks/chunk-1.js"></head><body><div id="app"></div><script type="module" src="/assets/app-ABC.js"></script></body></html>',
    );
  });

  test('a page that loads no entry gets the script, and other scripts stay', function (assert) {
    const page = rewritePage('<body><script src="/analytics.js"></script></body>', {
      root: '/app',
      htmlPath: '/app/index.html',
      entry: '/app/src/app.ts',
      script: '/assets/app.js',
    });

    assert.equal(
      page,
      '<body><script src="/analytics.js"></script><script type="module" src="/assets/app.js"></script></body>',
    );
  });
});
