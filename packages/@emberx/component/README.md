# @emberx/component - Ember/Glimmer Components for node.js and browser

This fully tested library allows you to build advanced and very fast browser UI components:

```ts
import assert from 'node:assert/strict';
import Component, { hbs, renderComponent, action, tracked } from '@emberx/component';

class UserDisplay extends Component {
  @tracked accessor count = 55;
  @tracked accessor loadingMessage: string | null;
  @tracked accessor user: object | null;

  static template = hbs`
    <h1>This is basic route</h1>

    <span id="counter">Counter: {{this.count}}</span>

    {{#if this.loadingMessage}}
      <p id="loading-user">{{this.loadingMessage}}</p>
    {{/if}}

    {{#if this.user}}
      <p id="user-details" class="text-center">Testing it: {{this.user.firstName}} {{this.user.lastName}}</p>
    {{else}}
      <button type="button" {{on "click" (fn this.fetchUserWithFetch "izelnakri")}} id="fetch-user-with-fetch">Fetch user with fetch</button>
    {{/if}}

    <button type="button" {{on "click" this.increaseCounter}} id="increase-counter">Increase counter</button>
  `;

  @action
  increaseCounter() {
    this.count++;
  }

  @action
  async fetchUserWithFetch(username: string): Promise<void> {
    this.user = null;
    this.loadingMessage = 'Fetching user...';

    try {
      let response = await fetch(`/users?username=${username}`);
      this.user = await response.json();
    } finally {
      this.loadingMessage = null;
    }
  }
}

// Usage:

await renderComponent(UserDisplay, { element: document.getElementById('app') });

assert.equal(document.querySelector('#counter').textContent, 'Counter: 55');
```

EmberX Components are composable, they allow embedding other EmberX components, helpers and modifiers:

```ts
import assert from 'node:assert/strict';
import Component, { hbs, renderComponent, action, tracked } from '@emberx/component';

interface User {
  firstName: string;
  lastName: string;
  createdAt: string;
}

class Table extends Component<{ headRows: object }> {
  static template = hbs`
    <table class="my-table">
      <thead>
        {{#each @headRows as |headRow|}}
          <tr>
            {{#each headRow as |rowData|}}
              <th scope="row">{{rowData}}</th>
            {{/each}}
          </tr>
        {{/each}}
      </thead>
      {{yield}}
    </table>
  `;
}

class UserTable extends Component<{ users: User[] }> {
  @tracked accessor sortDirection = 'desc';
  @tracked accessor sortedUsers: User[] | null = null;

  static includes = { Table };

  static template = hbs`
    <Table @headRows={{this.head}}>
      <tbody>
        {{#each this.users as |user|}}
          <tr {{on "click" (fn this.sortUsersByCreatedAt "createdAt")}}>
            <td>{{user.firstName}}</td>
            <td>{{user.lastName}}</td>
            <td>{{user.createdAt}}</td>
          </tr>
        {{/each}}
      </tbody>
    </Table>
  `;

  get users() {
    return this.sortedUsers ?? this.args.users;
  }

  get head() {
    return [['List of users'], ['First name', 'Last name', 'Created at']];
  }

  @action
  sortUsersByCreatedAt(sortProperty) {
    let direction = this.sortDirection === 'desc' ? -1 : 1;

    this.sortedUsers = [...this.args.users].sort((a, b) => (a[sortProperty] > b[sortProperty] ? 1 : -1) * direction);
    this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
  }
}

// Usage:

await renderComponent(UserTable, {
  element: document.getElementById('app'),
  args: { users: [{ firstName: 'Izel', lastName: 'Nakri', createdAt: '2021-05-01' }] },
});

assert.equal(document.querySelector('.my-table tbody td').textContent, 'Izel');
```

## Compiling templates at build time

A template compiles in the browser on its component's first render: that is what lets emberx
run with no build step. A production build can compile them ahead of time instead, so the
browser only builds each template from Ember's wire format, which saves the compile on every
cold load and evaluates no code, so a Content Security Policy needs no `'unsafe-eval'`.
`precompileTemplates` rewrites a module's `hbs` templates, against the helpers every template
has and the module's `static includes`:

```ts
import assert from 'node:assert/strict';
import { precompileTemplates } from '@emberx/component/precompile';

const code = precompileTemplates(`
  class Greeting extends Component {
    static includes = { Badge };
    static template = hbs\`<p {{on "click" this.wave}}>Hello <Badge @name={{@name}} /></p>\`;
  }
`);

assert.ok(code.includes('static template = (({ on, Badge }) => ({'));
```

In a build, run it over each module, for instance with an esbuild plugin:

```ts ignore
import * as esbuild from 'esbuild';
import { readFile } from 'node:fs/promises';
import { precompileTemplates } from '@emberx/component/precompile';

await esbuild.build({
  entryPoints: ['src/app.ts'],
  bundle: true,
  outdir: 'dist',
  plugins: [
    {
      name: 'emberx-precompile',
      setup(build) {
        build.onLoad({ filter: /\/src\/.*\.ts$/ }, async ({ path }) => ({
          contents: precompileTemplates(await readFile(path, 'utf8'), { moduleName: path }),
          loader: 'ts',
        }));
      },
    },
  ],
});
```

A template that names something neither the helpers nor the module's `includes` have fails
the build, naming it. Any template left alone still compiles at runtime, so the build can
cover some modules and not others. The @emberx packages' own templates, `<LinkTo>`'s and
`Route`'s, are compiled when they are published.

Ember's runtime compiler is imported only when a component about to render has a template as a
string: `renderComponent` loads it then. A page whose templates are all compiled never loads it,
and a bundler that splits code (esbuild's `--splitting`) keeps it out of the page's bundle, about
half of what emberx ships minified. Code that compiles a template itself, with `createTemplate`
or `setTemplate`, awaits `loadTemplateCompiler()` first; `isTemplateCompilerLoaded()` tells
whether anything has.
