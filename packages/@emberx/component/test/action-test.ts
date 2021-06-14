import Component, { hbs, renderComponent, action, tracked } from '@emberx/component';
import { module, test } from 'qunitx';
import axios from 'axios';
import { click, wait, waitFor } from '@emberx/test-helpers';
import { setupRenderingTest } from './helpers/index';
import setupMemserver from './helpers/setup-memserver';

module('@emberx/component | Action tests', function (hooks) {
  setupRenderingTest(hooks);
  setupMemserver(hooks);

  class SomeComponent extends Component {
    @tracked count = 55;
    @tracked secretMessage: string | null;
    @tracked loadingMessage: string | null;
    @tracked user: object | null;

    static template = hbs`
      <h1>This is basic route</h1>

      <span id="counter">Counter: {{this.count}}</span>

      {{#if this.secretMessage}}
        <p id="secret-message">{{this.secretMessage}}</p>
      {{else}}
        <button type="button" id="show-secret-message" {{on "click" this.waitAndDisplaySecretMessage}}>Show secret message</button>
      {{/if}}

      {{#if this.loadingMessage}}
        <p id="loading-user">{{this.loadingMessage}}</p>
      {{/if}}

      {{#if this.user}}
        <p id="user-details" class="text-center">Testing it: {{this.user.firstName}} {{this.user.lastName}}</p>
      {{else}}
        <button type="button" id="fetch-user-with-fetch" {{on "click" (fn this.fetchUserWithFetch "izelnakri")}}>Fetch user with fetch</button>
        <button type="button" id="fetch-user-with-xhr" {{on "click" (fn this.fetchUserWithXHR "izelnakri")}}>Fetch user with xhr</button>
      {{/if}}

      <button type="button" {{on "click" this.increaseCounter}} id="increase-counter">Increase counter</button>
    `;

    @action
    increaseCounter() {
      this.count++;
    }

    @action
    async waitAndDisplaySecretMessage() {
      await wait(100);

      this.secretMessage = 'This is secret message';
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

    @action
    async fetchUserWithXHR(username: string): Promise<void> {
      this.user = null;
      this.loadingMessage = 'Loading user...';

      try {
        let response = await axios.get(`/users?username=${username}`);
        this.user = response.data;
      } finally {
        this.loadingMessage = null;
      }
    }
  }

  test('simple render mutation gets awaited automatically', async function (assert) {
    await renderComponent(SomeComponent, { element: document.getElementById('ember-testing') });

    assert.dom('#counter').hasText('Counter: 55');

    await click('#increase-counter');

    assert.dom('#counter').hasText('Counter: 56');
  });

  test('simple async non-network action gets awaited correctly', async function (assert) {
    await renderComponent(SomeComponent, { element: document.getElementById('ember-testing') });

    assert.dom('#counter').hasText('Counter: 55');
    assert.dom('#secret-message').doesNotExist();
    assert.dom('#show-secret-message').hasText('Show secret message');

    let promise = click('#show-secret-message');

    assert.dom('#secret-message').doesNotExist();
    assert.dom('#show-secret-message').hasText('Show secret message');

    await promise;

    assert.dom('#secret-message').hasText('This is secret message');
    assert.dom('#show-secret-message').doesNotExist();
  });

  test('simple async fetch network action gets awaited correctly', async function (assert) {
    await renderComponent(SomeComponent, { element: document.getElementById('ember-testing') });

    assert.dom('#user-details').doesNotExist();
    assert.dom('#loading-user').doesNotExist();
    assert.dom('#fetch-user-with-fetch').hasText('Fetch user with fetch');

    this.Server.get('/users', () => {
      return { firstName: 'Izel', lastName: 'Nakri' };
    });

    let promise = click('#fetch-user-with-fetch');

    await waitFor('#loading-user');

    assert.dom('#loading-user').hasText('Fetching user...');
    assert.dom('#user-details').doesNotExist();

    await promise;

    assert.dom('#loading-user').doesNotExist();
    assert.dom('#user-details').hasText('Testing it: Izel Nakri');
  });

  test('simple async xhr network action gets awaited correctly', async function (assert) {
    await renderComponent(SomeComponent, { element: document.getElementById('ember-testing') });

    assert.dom('#user-details').doesNotExist();
    assert.dom('#loading-user').doesNotExist();
    assert.dom('#fetch-user-with-xhr').hasText('Fetch user with xhr');

    this.Server.get('/users', () => {
      return { firstName: 'Izel', lastName: 'Nakri' };
    });

    let promise = click('#fetch-user-with-xhr');

    await waitFor('#loading-user');

    assert.dom('#loading-user').hasText('Loading user...');
    assert.dom('#user-details').doesNotExist();

    await promise;

    assert.dom('#loading-user').doesNotExist();
    assert.dom('#user-details').hasText('Testing it: Izel Nakri');
  });
});
