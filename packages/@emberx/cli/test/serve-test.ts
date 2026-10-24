import { module, test } from 'qunitx';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { emberx, newApp, removeSandbox, startEmberx } from './helpers.ts';

module('@emberx/cli | emberx serve', function (hooks) {
  hooks.after(removeSandbox);

  test('serves dist/: its files, the hashed ones cached forever, and index.html for every route', async function (assert) {
    assert.timeout(20_000);
    const app = newApp();
    emberx(['build'], { cwd: app });
    const { origin, stop } = await startEmberx(['serve'], app);

    try {
      const bundle = readdirSync(join(app, 'dist/assets')).find((file) => /^app-.+\.js$/.test(file));
      const asset = await fetch(`${origin}/assets/${bundle}`);
      assert.equal(asset.status, 200);
      assert.equal(asset.headers.get('cache-control'), 'public, max-age=31536000, immutable');
      assert.ok((await (await fetch(`${origin}/about`)).text()).includes(`/assets/${bundle}`), 'a route is the page');
      assert.equal((await fetch(`${origin}/missing.png`)).status, 404);
    } finally {
      stop();
    }
  });

  test('renders each page with the server a build --ssr built, which it does not serve', async function (assert) {
    assert.timeout(20_000);
    const app = newApp('--ssr');
    emberx(['build', '--ssr'], { cwd: app });
    const { origin, stop } = await startEmberx(['serve'], app);

    try {
      const page = await (await fetch(`${origin}/about`)).text();
      assert.ok(/<div id="app">[\s\S]*<h1>About<\/h1>/.test(page), 'the page, rendered');
      assert.notOk(page.includes('__emberx/reload'), 'with no live reload');
      assert.equal((await fetch(`${origin}/no-such-page`)).status, 404);
      assert.equal((await fetch(`${origin}/server/server.js`)).status, 404, 'the server stays private');
    } finally {
      stop();
    }
  });

  test('says to build first, when there is no build', function (assert) {
    const { status, stderr } = emberx(['serve'], { cwd: newApp() });

    assert.equal(status, 2);
    assert.ok(stderr.includes('`emberx build` builds the app first'));
  });
});
