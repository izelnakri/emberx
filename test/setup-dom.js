/**
 * Gives the node test run a DOM.
 *
 * Loaded via `qunitx --before=test/setup-dom.js`, before any test module is
 * imported, so that @emberx packages see `window`/`document` at module-eval
 * time. In the browser suite this file is not used at all.
 */
if (!globalThis.window) {
  const setupDom = await import('@memserver/server/dist/setup-dom.js');
  setupDom.default();

  const DOM_GLOBALS = [
    'Blob',
    'File',
    'HTMLElement',
    'HTMLTextAreaElement',
    'HTMLInputElement',
    'Node',
    'navigator',
    'NodeList',
    'SVGElement',
  ];

  // Node defines some of these itself (`navigator` since Node 21), as
  // getter-only properties on globalThis. A plain assignment throws, so define
  // the property instead — jsdom's implementation is the one the tests need.
  for (const key of DOM_GLOBALS) {
    const value = globalThis.window[key];
    if (value === undefined) continue;

    Object.defineProperty(globalThis, key, {
      value,
      writable: true,
      configurable: true,
      enumerable: false,
    });
  }

  globalThis.Window = globalThis.window.constructor;

  const qunitFixture = document.createElement('div');
  qunitFixture.id = 'qunit-fixture';
  document.body.appendChild(qunitFixture);
}
