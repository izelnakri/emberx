import { module, test } from 'qunitx';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { emberx, newApp, removeSandbox } from './helpers.ts';

module('@emberx/cli | emberx build', function (hooks) {
  hooks.after(removeSandbox);

  test('writes dist/: the page loading the hashed bundle, its chunks preloaded, a lazy route on its own', function (assert) {
    const app = newApp();
    const { status, stdout } = emberx(['build'], { cwd: app });
    const page = readFileSync(join(app, 'dist/index.html'), 'utf8');
    const script = page.match(/<script type="module" src="\/assets\/(app-[A-Z0-9]+\.js)"><\/script>/)?.[1];

    assert.equal(status, 0);
    assert.ok(script && existsSync(join(app, 'dist/assets', script)), 'the page loads the hashed bundle');
    assert.notOk(page.includes('/src/app.ts'), 'and not the source');
    assert.ok(
      /<link rel="modulepreload" href="\/assets\/chunks\/chunk-[A-Z0-9]+\.js">/.test(page),
      'its chunks preloaded',
    );
    assert.ok(
      readdirSync(join(app, 'dist/assets/chunks')).some((file) => file.startsWith('about-')),
      'the about route, a chunk of its own',
    );
    assert.ok(/\(lazy\) dist\/assets\/chunks\/about-/.test(stdout), 'which the first page load does not download');
    assert.ok(stdout.includes('first page load'));
  });

  test('copies public/, and --base serves the app under a path', function (assert) {
    const app = newApp();
    mkdirSync(join(app, 'public'));
    writeFileSync(join(app, 'public/robots.txt'), 'User-agent: *');
    emberx(['build', '--base', 'admin'], { cwd: app });

    assert.equal(readFileSync(join(app, 'dist/robots.txt'), 'utf8'), 'User-agent: *');
    assert.ok(readFileSync(join(app, 'dist/index.html'), 'utf8').includes('src="/admin/assets/app-'));
  });

  test('--no-split builds one bundle, the template compiler in it; --ssr the server too', function (assert) {
    const app = newApp('--ssr');
    emberx(['build', '--no-split', '--no-precompile', '--ssr'], { cwd: app });

    assert.deepEqual(readdirSync(join(app, 'dist/assets')).filter((file) => file.endsWith('.js')).length, 1);
    assert.ok(existsSync(join(app, 'dist/server/server.js')));
  });

  test('without an entry module, says how to give one', function (assert) {
    const app = newApp();
    rmSync(join(app, 'src/app.ts'));
    const { status, stderr } = emberx(['build'], { cwd: app });

    assert.equal(status, 2);
    assert.ok(stderr.includes('no entry module'));
  });
});
