# @emberx/component - Ember/Glimmer Components for node.js and browser

This fully tested library allows you to build advanced and very fast browser UI components:

```ts
import Component, { hbs, renderComponent, action, tracked } from '@emberx/component';

class UserDisplay extends Component {
  @tracked count = 55;
  @tracked loadingMessage: string | null;
  @tracked user: object | null;

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

renderComponent(UserDisplay, { element: document.getElementById('app') });
```

EmberX Components are composable, they allow embedding other EmberX components, helpers and modifiers:

```ts
import Component, { hbs, renderComponent, action, tracked } from '@emberx/component';

class Table extends Component<{ headRows: object }> {
  static template = hbs`
    <table class="my-table">
      <thead>
        {{#each @headRows as |headRow|}}
          <tr>
            {{#each headRow as |rowData|}}
              <th scope="row">{{headRow[0]}}</th>
            {{/each}}
          </tr>
        {{/each}}
      </thead>
      {{yield}}
    </table>
  `
}

class UserTable extends Component<{ users: User[] }>{
  static includes = { Table };

  static template = hbs`
    <Table @headRows={{this.head}}>
      <tbody>
        {{#each @users as |user|}}
          <tr {{on "click" (fn this.sortUsersByCreatedAt "createdAt")}}>
            <td>{{user.firstname}}</td>
            <td>{{user.lastName}}</td>
            <td>{{user.createdAt}}</td>
          </tr>
        {{/each}}
      </tbody>
    </Table>
  `

  @tracked sortDirection = 'desc';
  @tracked sortedUsers: User[] | null = null;

  get head() {
    return [
      ['List of users'],
      ['First name', 'Last name', 'Created at']
    ];
  }

  @action
  sortUsersByCreatedAt(sortProperty) {
    this.users = this.users.sortBy(sortProperty, this.sortDirection);
    this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
  }
}

// Usage:

renderComponent(UserTable, { element: document.getElementById('app') });
```
