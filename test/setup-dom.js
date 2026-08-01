/**
 * Gives the node test run a DOM.
 *
 * Imported by scripts/test-node.js before the test bundle, so that @emberx
 * packages see `window`/`document` at module-eval time. In the browser suite
 * this file is not used at all.
 */
if (!globalThis.window) {
  const setupDom = await import('@memserver/server/dist/setup-dom.js');
  await setupDom.default();

  const { window } = globalThis;

  // Every DOM class jsdom provides that node does not (Element, HTMLElement,
  // KeyboardEvent, ...), plus `navigator`, which node defines itself since 21
  // but without the fields browser code reads. Node's own globals otherwise win:
  // replacing URL, Event or AbortController would change node's behaviour, not
  // just add a DOM. Node defines some globals as getter-only, so a plain
  // assignment throws; defineProperty works for both cases.
  const keys = Object.getOwnPropertyNames(window).filter(
    (key) => (/^[A-Z]/.test(key) && !(key in globalThis)) || key === 'navigator',
  );

  for (const key of keys) {
    Object.defineProperty(globalThis, key, {
      value: window[key],
      writable: true,
      configurable: true,
      enumerable: false,
    });
  }

  globalThis.Window = window.constructor;

  // jsdom implements no layout. QUnit's HTML reporter scrolls on completion,
  // which would otherwise print a "Not implemented" stack trace on every run.
  window.scrollTo = () => {};

  const qunitFixture = document.createElement('div');
  qunitFixture.id = 'qunit-fixture';
  document.body.appendChild(qunitFixture);
}
