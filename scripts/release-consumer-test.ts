/**
 * What an npm user gets: run by scripts/test-release.sh from a throwaway
 * directory where only the packed @emberx tarballs (and jsdom) are installed,
 * so every import below resolves to a published artefact, never the checkout.
 *
 * Run directly by the runtime, with no bundler and so no decorators: `tracked`
 * is applied by hand, the way the decorator would.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const PACKAGES = ['string', 'helper', 'component', 'router', 'test-helpers', 'ssr'];

test('every package imports from its tarball and exports something', async () => {
  for (const name of PACKAGES) {
    const exports = await import(`@emberx/${name}`);
    assert.ok(Object.keys(exports).length > 0, `@emberx/${name} has no exports`);
  }
});

test('@emberx/string and @emberx/helper work as plain functions', async () => {
  const { camelize, dasherize } = await import('@emberx/string');
  const { eq } = await import('@emberx/helper');

  assert.equal(camelize('ember-x'), 'emberX');
  assert.equal(dasherize('emberX'), 'ember-x');
  assert.equal(eq([1, 1]), true);
});

test('@emberx/router keeps services on its Owner', async () => {
  const { default: Router, Owner } = await import('@emberx/router');
  const locale = { current: 'en' };

  Router.addServices({ locale });

  assert.equal(Owner.lookup('service:locale'), locale);
});

test('@emberx/component renders, and re-renders on a tracked change', async () => {
  installDOM();

  const { default: Component, renderComponent, tracked, hbs, didRender } = await import('@emberx/component');

  class Counter extends Component {
    static template = hbs`<p id="label">{{@label}}: {{this.count}}</p><button id="increment" {{on "click" this.increment}}>+</button>`;

    increment = () => this.count++;
  }
  Object.defineProperty(
    Counter.prototype,
    'count',
    tracked(Counter.prototype, 'count', { configurable: true, enumerable: true, writable: true, initializer: () => 1 }),
  );

  const element = document.createElement('div');
  document.body.appendChild(element);

  await renderComponent(Counter, { element, args: { label: 'Clicks' } });
  assert.equal(element.querySelector('#label').textContent, 'Clicks: 1');

  element.querySelector('#increment').click();
  await didRender();
  assert.equal(element.querySelector('#label').textContent, 'Clicks: 2');
});

test('@emberx/ssr renders to a string', async () => {
  installDOM();

  const { default: Component, hbs } = await import('@emberx/component');
  const { renderToString } = await import('@emberx/ssr');

  class Greeting extends Component {
    static template = hbs`<p>Hello {{@name}}</p>`;
  }

  assert.equal(await renderToString(Greeting, { args: { name: 'npm' } }), '<p>Hello npm</p>');
});

/**
 * jsdom's DOM classes, `window`, `document` and `self` on globalThis, once: the
 * globals browser code reaches for, which node does not define.
 */
function installDOM() {
  if (globalThis.document) return;

  const { window } = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
  for (const key of Object.getOwnPropertyNames(window)) {
    if ((/^[A-Z]/.test(key) && !(key in globalThis)) || ['document', 'window', 'self'].includes(key)) {
      Object.defineProperty(globalThis, key, { value: window[key], writable: true, configurable: true });
    }
  }
}
