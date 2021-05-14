import { module, test } from 'qunitx';
import Route from '../../src/route';

module('Route Unit Test', () => {
  test('Route has the right actions', async (assert) => {
    assert.deepEqual(Object.keys(Route), []);

    let route = new Route();

    assert.deepEqual(Object.keys(route), ['args']);
    assert.ok(route.transitionTo);
  });
});
