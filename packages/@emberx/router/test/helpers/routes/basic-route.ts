import axios from 'axios';
import { Route, hbs, action, tracked } from '@emberx/router';

export default class BasicRoute extends Route {
  @tracked count = 55;
  @tracked secretMessage: string | null;
  @tracked loadingMessage: string | null;
  @tracked user: object | null;

  static model() {
    return {
      currentRouteName: this.router.currentRouteName,
      firstName: 'Izel',
      lastName: 'Nakri',
      username: 'izelnakri',
      count: 5,
    };
  }

  static template = hbs`
    <h1 data-test-route-title>This is basic route: {{this.router.currentRouteName}}</h1>
    <p data-test-route-model-name>Route name from model is {{this.model.currentRouteName}}</p>

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

async function wait(timeout: number = 500) {
  await new Promise((resolve, reject) => {
    setTimeout(() => resolve(), timeout);
  });
}
