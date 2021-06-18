import { module, test } from 'qunitx';
import Router, { Route, RouterService } from '@emberx/router';
import BasicRoute from './helpers/routes/basic-route';
import { visit, click, currentURL, waitFor } from '@emberx/test-helpers';
import setupTest from './helpers/index';
import setupMemserver from './helpers/setup-memserver';

module('@emberx/router | Route Unit Test', function (hooks) {
  setupTest(hooks, () => {
    return Router.start([
      {
        path: '/',
        name: 'home',
        route: BasicRoute,
      },
    ]);
  });
  setupMemserver(hooks);

  test('Route has the initial properties', async function (assert) {
    let route = new Route();

    assert.ok('includes' in Route);
    assert.ok('template' in Route);
    assert.deepEqual(Object.keys(route), ['args']);
    assert.ok(route.router);
  });

  test('Route has a router service, routeName and model with correct rendering when resolved', async function (assert) {
    await visit('/');

    assert.dom('[data-test-route-title]').hasText('This is basic route: home');
    assert.dom('[data-test-route-model-name]').hasText('Route name from model is home');

    assert.dom('#counter').hasText('Counter: 55');

    await click('#increase-counter');

    assert.dom('#counter').hasText('Counter: 56');
  });

  test('simple async non-network action gets awaited correctly', async function (assert) {
    await visit('/');

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
    await visit('/');

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
    await visit('/');

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
