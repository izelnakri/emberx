/**
 * The files `emberx generate <kind> <name>` writes: the module, and its test.
 */
import { camelize, classify } from '@emberx/string';

export const KINDS = ['component', 'route', 'helper', 'service'] as const;
export type Kind = (typeof KINDS)[number];

export interface Blueprint {
  files: Record<string, string>;
  /** For a route: the definition src/router.ts gets. */
  routeDefinition?: string;
  /** What to do next that generate does not do itself. */
  hint?: string;
}

/** `name` is a path below the kind's folder: `user-card`, or `forms/text-input`. */
export function blueprint(kind: Kind, name: string, { path }: { path?: string } = {}): Blueprint {
  const last = name.split('/').pop() as string;
  const depth = '../'.repeat(name.split('/').length + 1);

  if (kind === 'component') {
    const Name = classify(last);
    return {
      files: {
        [`src/components/${name}.ts`]: `import Component, { hbs } from '@emberx/component';

export default class ${Name} extends Component {
  static template = hbs\`
    <div data-test-${last}>{{yield}}</div>
  \`;
}
`,
        [`tests/components/${name}-test.ts`]: `import { module, test } from 'qunitx';
import { hbs, render, setupRenderingTest } from '@emberx/test-helpers';
import ${Name} from '${depth}src/components/${name}.ts';

module('Component | ${name}', function (hooks) {
  setupRenderingTest(hooks);

  test('renders what it is given', async function (assert) {
    await render(hbs\`<${Name}>hello</${Name}>\`, { ${Name} });

    assert.dom('[data-test-${last}]').hasText('hello');
  });
});
`,
      },
    };
  }

  if (kind === 'route') {
    const Name = `${classify(name.split('/').join('-'))}Route`;
    const url = path ?? `/${name}`;
    const visited = url.replace(/:[^/]+/g, '1').replace(/\*[^/]*/g, 'anything');
    return {
      files: {
        [`src/routes/${name}.ts`]: `import { Route, hbs } from '@emberx/router';

export default class ${Name} extends Route {
  static title = '${classify(last)}';

  static template = hbs\`
    <main>
      <h1 data-test-title>${classify(last)}</h1>
    </main>
  \`;
}
`,
        [`tests/routes/${name}-test.ts`]: `import { module, test } from 'qunitx';
import { currentURL, setupApplicationTest, visit } from '@emberx/test-helpers';
import startRouter from '${depth}src/router.ts';

module('Route | ${name}', function (hooks) {
  setupApplicationTest(hooks, startRouter);

  test('visiting ${visited}', async function (assert) {
    await visit('${visited}');

    assert.equal(currentURL(), '${visited}');
    assert.dom('[data-test-title]').hasText('${classify(last)}');
  });
});
`,
      },
      routeDefinition: `{ path: '${url}', route: () => import('./routes/${name}.ts') },`,
    };
  }

  if (kind === 'helper') {
    const helperName = camelize(last);
    return {
      files: {
        [`src/helpers/${name}.ts`]: `import helper from '@emberx/helper';

// {{${helperName} value}}: its positional arguments, its named ones, and the owner's services.
export default helper(([value]: readonly unknown[]) => String(value).toUpperCase());
`,
        [`tests/helpers/${name}-test.ts`]: `import { module, test } from 'qunitx';
import { hbs, render, setupRenderingTest } from '@emberx/test-helpers';
import ${helperName} from '${depth}src/helpers/${name}.ts';

module('Helper | ${name}', function (hooks) {
  setupRenderingTest(hooks);

  test('turns its value into what the template shows', async function (assert) {
    await render(hbs\`<p data-test-output>{{${helperName} "hello"}}</p>\`, { ${helperName} });

    assert.dom('[data-test-output]').hasText('HELLO');
  });
});
`,
      },
    };
  }

  const Name = classify(last);
  return {
    files: {
      [`src/services/${name}.ts`]: `import { tracked } from '@emberx/component';

// The state the pages share: \`@service ${camelize(last)}\` in a route or component reads it.
export default class ${Name} {
  @tracked accessor count = 0;

  increment(): void {
    this.count++;
  }
}
`,
      [`tests/services/${name}-test.ts`]: `import { module, test } from 'qunitx';
import ${Name} from '${depth}src/services/${name}.ts';

module('Service | ${name}', function () {
  test('increments its count', function (assert) {
    const service = new ${Name}();
    service.increment();

    assert.equal(service.count, 1);
  });
});
`,
    },
    hint: `Register it for the pages: Router.addServices({ ${camelize(last)}: new ${Name}() }), before Router.start().`,
  };
}
