import { module, test } from 'qunitx';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { newApp, removeSandbox, startEmberx } from './helpers.ts';

module('@emberx/cli | emberx dev', function (hooks) {
  hooks.after(removeSandbox);

  test('serves the page, its bundle and the routes, and tells the page to reload after an edit', async function (assert) {
    assert.timeout(20_000);
    const app = newApp();
    const { origin, stop } = await startEmberx(['dev'], app);

    try {
      const page = await (await fetch(`${origin}/`)).text();
      assert.ok(page.includes('<script type="module" src="/assets/app.js"></script>'));
      assert.ok(page.includes("new EventSource('/__emberx/reload')"), 'and the live reload');
      assert.notOk(page.includes('<h1>'), 'which the browser renders');
      assert.equal((await fetch(`${origin}/assets/app.js`)).status, 200);
      assert.ok((await (await fetch(`${origin}/about`)).text()).includes('/assets/app.js'), 'a route path is the page');
      assert.equal((await fetch(`${origin}/missing.png`)).status, 404);
      assert.equal((await fetch(`${origin}/favicon.ico`)).status, 204);

      assert.ok(await reloadsAfter(origin, () => edit(join(app, 'src/routes/index.ts'))));
    } finally {
      stop();
    }
  });

  test('--ssr renders each page with src/server.ts, its status included, and again after an edit', async function (assert) {
    assert.timeout(20_000);
    const app = newApp('--ssr');
    const { origin, stop } = await startEmberx(['dev', '--ssr'], app);

    try {
      const response = await fetch(`${origin}/about`);
      const page = await response.text();
      assert.equal(response.status, 200);
      assert.ok(page.includes('<title>About | my-app</title>'), "the page's title");
      assert.ok(/<div id="app">[\s\S]*<h1>About<\/h1>/.test(page), 'the page, rendered');
      assert.ok(page.includes('id="shoebox"'), 'its models, for the browser to hydrate with');
      assert.ok(page.includes("new EventSource('/__emberx/reload')"), 'and the live reload');
      assert.equal(
        (await fetch(`${origin}/no-such-page`)).status,
        404,
        "a URL no route matches: the not-found page's 404",
      );

      assert.ok(await reloadsAfter(origin, () => edit(join(app, 'src/routes/index.ts'))));
      assert.ok((await (await fetch(`${origin}/`)).text()).includes('Edited'), 'rendered with the edited route');
    } finally {
      stop();
    }
  });
});

/** Whether the page is told to reload after `change`. */
async function reloadsAfter(origin: string, change: () => void): Promise<boolean> {
  const reader = (await fetch(`${origin}/__emberx/reload`)).body!.getReader();
  await reader.read(); // the stream's opening comment
  change();
  const { value } = await reader.read();
  await reader.cancel();
  return new TextDecoder().decode(value).startsWith('event: reload');
}

function edit(route: string): void {
  writeFileSync(route, readFileSync(route, 'utf8').replace('Edit src/routes/index.ts', 'Edited'));
}
