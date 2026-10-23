import Component, { renderComponent, action, tracked, didRender, loadTemplateCompiler } from '@emberx/component';
import { precompileTemplate, precompileTemplates } from '@emberx/component/precompile';
import { module, test } from 'qunitx';
import { setupRenderingTest } from '@emberx/test-helpers';

module('@emberx/component | Precompiled templates', function (hooks) {
  setupRenderingTest(hooks);

  test('a precompiled template renders and updates without eval', async function (assert) {
    class Badge extends Component {
      static template = bundled(precompileTemplate('<b>{{@count}}</b>'));
    }
    class Counter extends Component {
      @tracked accessor count = 1;

      static includes = { Badge };
      static template = bundled(
        precompileTemplate('<Badge @count={{this.count}} /><button {{on "click" this.increment}}>+</button>', {
          includes: ['Badge'],
        }),
      );

      @action
      increment() {
        this.count++;
      }
    }

    const element = document.getElementById('ember-testing') as HTMLElement;
    // A component's templates, its includes' among them, are made on its first render, before it awaits anything.
    await withoutEval(() => renderComponent(Counter, { element, owner: {} }));
    assert.dom('b').hasText('1');

    element.querySelector('button')!.click();
    await didRender();
    assert.dom('b').hasText('2');
  });

  test("precompileTemplates rewrites a module's hbs templates, in the scope its includes give", function (assert) {
    const code = precompileTemplates(
      [
        '// Greeting renders `hbs` templates, as prose writes it.',
        'class Greeting extends Component {',
        '  static includes = { Badge, shout: Shout };',
        '  static template = hbs`<Badge @count={{1}} />{{shout "hi"}} <p {{on "click" this.go}}></p>`;',
        '}',
        'const interpolated = hbs`Hi ${name}`;',
      ].join('\n'),
      { moduleName: 'app/greeting.ts' },
    );

    assert.notOk(code.includes('hbs`<Badge'), 'the template is compiled');
    assert.deepEqual(
      code
        .match(/\(\(\{ (.*) \}\) =>/)![1]
        .split(', ')
        .sort(),
      ['Badge', 'on', 'shout'],
    );
    assert.ok(code.includes('"moduleName":"app/greeting.ts"'));
    assert.ok(code.includes('const interpolated = hbs`Hi ${name}`;'), 'a template with ${...} is left to the runtime');
    assert.ok(code.startsWith('// Greeting renders `hbs` templates, as prose writes it.\n'), 'prose is not a template');
  });

  test('a template compiled at runtime evaluates code, which a strict CSP refuses', async function (assert) {
    class Plain extends Component {
      static template = '<b>runtime</b>';
    }
    const element = document.getElementById('ember-testing') as HTMLElement;
    // Loaded first: renderComponent compiles once it has loaded it, after withoutEval returns.
    await loadTemplateCompiler();

    await assert.rejects(
      withoutEval(() => renderComponent(Plain, { element, owner: {} })),
      /eval is not allowed/,
    );
  });

  test('a name the template does not have in scope fails the build, named', function (assert) {
    assert.throws(() => precompileTemplate('<Missing />'), /not in scope[\s\S]*Missing/);
  });
});

/** What a bundler does with a precompiled template: it is code in the bundle. */
function bundled(expression: string) {
  return new Function(`return ${expression}`)();
}

/**
 * Calls `callback` with eval and the Function constructor throwing, as a strict
 * Content Security Policy has them. Only while it runs synchronously: whatever
 * else runs on the page meanwhile keeps them.
 */
function withoutEval<T>(callback: () => T): T {
  const { eval: originalEval, Function: OriginalFunction } = globalThis;
  const refuse = () => {
    throw new EvalError('eval is not allowed here');
  };
  globalThis.eval = refuse;
  globalThis.Function = new Proxy(OriginalFunction, { apply: refuse, construct: refuse });

  try {
    return callback();
  } finally {
    globalThis.eval = originalEval;
    globalThis.Function = OriginalFunction;
  }
}
