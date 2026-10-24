import { module, test } from 'qunitx';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { emberx, newApp, removeSandbox, sandbox } from './helpers.ts';
import { VERSION } from '../src/version.ts';

module('@emberx/cli | emberx', function (hooks) {
  hooks.after(removeSandbox);

  test("--version prints the version, and the version is the package's", function (assert) {
    const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

    assert.equal(emberx(['--version']).stdout.trim(), VERSION);
    assert.equal(VERSION, manifest.version, "src/version.ts is stamped with package.json's version");
  });

  test('@emberx/cli exports what it promises, and nothing else: its public API', async function (assert) {
    assert.deepEqual(Object.keys(await import('@emberx/cli')).sort(), [
      'TEMPLATE_MODULES',
      'VERSION',
      'buildApp',
      'formatReport',
      'precompilePlugin',
    ]);
  });

  test('help lists the commands, and each command has its own', function (assert) {
    const { stdout, status } = emberx(['help']);
    assert.equal(status, 0);
    for (const command of ['new', 'generate', 'dev', 'build', 'serve', 'test', 'upgrade']) {
      assert.ok(stdout.includes(`  ${command} `), `lists ${command}`);
      assert.equal(emberx([command, '--help']).status, 0, `${command} --help`);
    }
    for (const [alias, command] of Object.entries({
      n: 'new',
      g: 'generate',
      d: 'dev',
      b: 'build',
      s: 'serve',
      server: 'serve',
      t: 'test',
      up: 'upgrade',
    })) {
      assert.ok(emberx([alias, '--help']).stdout.startsWith(`Usage: emberx ${command}`), `${alias} is ${command}`);
    }
    assert.equal(emberx([]).stdout, stdout, 'emberx alone is help');
  });

  test('an unknown command, or flag, exits 2 and says where the help is', function (assert) {
    const unknown = emberx(['deploy']);
    assert.equal(unknown.status, 2);
    assert.ok(unknown.stderr.includes('there is no "deploy" command'));

    const flag = emberx(['build', '--minfy']);
    assert.equal(flag.status, 2);
    assert.ok(flag.stderr.includes("Unknown option '--minfy'"));
    assert.ok(flag.stderr.includes('`emberx help build`'));
  });
});

module('@emberx/cli | emberx new', function (hooks) {
  hooks.after(removeSandbox);

  test('writes an app that names itself after its directory', function (assert) {
    const app = newApp();
    const manifest = JSON.parse(readFileSync(join(app, 'package.json'), 'utf8'));

    assert.equal(manifest.name, 'my-app');
    assert.deepEqual(manifest.scripts, {
      dev: 'emberx dev',
      build: 'emberx build',
      serve: 'emberx serve',
      test: 'emberx test',
    });
    assert.equal(manifest.dependencies['@emberx/router'], `^${VERSION}`);
    for (const file of [
      'index.html',
      'src/app.ts',
      'src/router.ts',
      'src/routes/index.ts',
      'tests/routes/index-test.ts',
      'tsconfig.json',
      '.gitignore',
    ]) {
      assert.ok(existsSync(join(app, file)), file);
    }
    assert.notOk(existsSync(join(app, 'src/server.ts')), 'a server only with --ssr');
  });

  test('--ssr adds a server, and the scripts that build and start it', function (assert) {
    const app = newApp('--ssr');
    const manifest = JSON.parse(readFileSync(join(app, 'package.json'), 'utf8'));

    assert.ok(existsSync(join(app, 'src/server.ts')));
    assert.equal(manifest.scripts.dev, 'emberx dev --ssr');
    assert.equal(manifest.scripts.build, 'emberx build --ssr');
    assert.equal(manifest.scripts.start, 'node dist/server/server.js');
    assert.equal(manifest.dependencies['@emberx/ssr'], `^${VERSION}`);
  });

  test('refuses a directory with files in it, and a package manager it does not know', function (assert) {
    const directory = sandbox();
    writeFileSync(join(directory, 'notes.txt'), 'mine');
    assert.equal(emberx(['new', directory, '--skip-install']).status, 2);
    assert.deepEqual(readdirSync(directory), ['notes.txt'], 'nothing written');

    const manager = emberx(['new', join(directory, 'app'), '--package-manager', 'gradle']);
    assert.equal(manager.status, 2);
    assert.ok(manager.stderr.includes('one of npm, pnpm, yarn, bun'));
  });
});

module('@emberx/cli | emberx generate', function (hooks) {
  hooks.after(removeSandbox);

  test('a component, a helper and a service, each with its test', function (assert) {
    const app = newApp();
    assert.equal(
      emberx(['generate', 'component', 'forms/text-input'], { cwd: join(app, 'src') }).status,
      0,
      'from any folder of the app',
    );
    assert.equal(emberx(['g', 'helper', 'shout'], { cwd: app }).status, 0);
    const service = emberx(['g', 'service', 'session'], { cwd: app });

    for (const file of [
      'src/components/forms/text-input.ts',
      'tests/components/forms/text-input-test.ts',
      'src/helpers/shout.ts',
      'tests/helpers/shout-test.ts',
      'src/services/session.ts',
      'tests/services/session-test.ts',
    ]) {
      assert.ok(existsSync(join(app, file)), file);
    }
    assert.ok(
      readFileSync(join(app, 'src/components/forms/text-input.ts'), 'utf8').includes('export default class TextInput'),
    );
    assert.ok(
      readFileSync(join(app, 'tests/components/forms/text-input-test.ts'), 'utf8').includes(
        "from '../../../src/components/forms/text-input.ts'",
      ),
    );
    assert.ok(
      service.stdout.includes('Router.addServices({ session: new Session() })'),
      'says how to register the service',
    );
  });

  test('a route, registered in src/router.ts to be imported when it is first visited', function (assert) {
    const app = newApp();
    emberx(['g', 'route', 'posts/post', '--path', '/posts/:post_id'], { cwd: app });
    const router = readFileSync(join(app, 'src/router.ts'), 'utf8');

    assert.ok(
      router.includes(
        "      { path: '/posts/:post_id', route: () => import('./routes/posts/post.ts') },\n      // emberx generate route",
      ),
    );
    assert.ok(readFileSync(join(app, 'tests/routes/posts/post-test.ts'), 'utf8').includes("await visit('/posts/1');"));

    emberx(['g', 'route', 'posts/post', '--path', '/posts/:post_id', '--force'], { cwd: app });
    assert.equal(readFileSync(join(app, 'src/router.ts'), 'utf8'), router, 'registered once');
  });

  test('refuses to write over files without --force, and names that are not names', function (assert) {
    const app = newApp();
    emberx(['g', 'component', 'card'], { cwd: app });
    writeFileSync(join(app, 'src/components/card.ts'), '// mine');

    const again = emberx(['g', 'component', 'card'], { cwd: app });
    assert.equal(again.status, 2);
    assert.ok(again.stderr.includes('--force writes over them'));
    assert.equal(readFileSync(join(app, 'src/components/card.ts'), 'utf8'), '// mine');
    assert.equal(emberx(['g', 'component', 'card', '--force'], { cwd: app }).status, 0);
    assert.notEqual(readFileSync(join(app, 'src/components/card.ts'), 'utf8'), '// mine');

    assert.equal(emberx(['g', 'component', 'UserCard'], { cwd: app }).status, 2);
    assert.equal(emberx(['g', 'model', 'user'], { cwd: app }).status, 2);
    assert.equal(emberx(['g', 'helper', 'x', '--path', '/x'], { cwd: app }).status, 2);
  });
});

module('@emberx/cli | emberx test', function () {
  test('without qunitx-cli, says how to install it', function (assert) {
    // Outside the repository, where no node_modules has qunitx.
    const app = mkdtempSync(join(tmpdir(), 'emberx-test-'));
    writeFileSync(join(app, 'package.json'), '{}');
    mkdirSync(join(app, 'tests'));

    const { status, stderr } = emberx(['test'], { cwd: app, env: { PATH: '' } });
    assert.equal(status, 1);
    assert.ok(stderr.includes('npm install --save-dev qunitx qunitx-cli'));
  });
});

module('@emberx/cli | emberx upgrade', function () {
  test('refuses what is no version', function (assert) {
    const { status, stderr } = emberx(['upgrade', 'latest-please']);

    assert.equal(status, 2);
    assert.ok(stderr.includes('give one as 0.6.0'));
  });
});
