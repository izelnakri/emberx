import { module, test } from 'qunitx';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { newApp, removeSandbox, startEmberx } from './helpers.ts';

module('@emberx/cli | emberx dev', function (hooks) {
  hooks.after(removeSandbox);

  test('serves the page, its bundle and the routes, and tells the page to reload after an edit', async function (assert) {
    const app = newApp();
    const port = 4800 + Math.floor(Math.random() * 400);
    const dev = startEmberx(['dev', '--port', String(port)], app);
    const origin = `http://localhost:${port}`;

    try {
      await new Promise<void>((resolve, reject) => {
        dev.stdout.on('data', (chunk) => String(chunk).includes(origin) && resolve());
        dev.on('exit', () => reject(new Error('emberx dev exited')));
      });

      const page = await (await fetch(`${origin}/`)).text();
      assert.ok(page.includes('<script type="module" src="/assets/app.js"></script>'));
      assert.ok(page.includes("new EventSource('/__emberx/reload')"), 'and the live reload');
      assert.equal((await fetch(`${origin}/assets/app.js`)).status, 200);
      assert.ok((await (await fetch(`${origin}/about`)).text()).includes('/assets/app.js'), 'a route path is the page');
      assert.equal((await fetch(`${origin}/missing.png`)).status, 404);
      assert.equal((await fetch(`${origin}/favicon.ico`)).status, 204);

      const events = await fetch(`${origin}/__emberx/reload`);
      const reader = events.body!.getReader();
      await reader.read(); // the stream's opening comment
      const route = join(app, 'src/routes/index.ts');
      writeFileSync(route, readFileSync(route, 'utf8').replace('Edit src/routes/index.ts', 'Edited'));
      const { value } = await reader.read();

      assert.ok(new TextDecoder().decode(value).startsWith('event: reload'));
      await reader.cancel();
    } finally {
      dev.kill('SIGINT');
    }
  });
});
