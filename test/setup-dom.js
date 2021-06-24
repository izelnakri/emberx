if (!globalThis.window) {
  let setupDom = await import('@memserver/server/dist/setup-dom.js');
  setupDom.default();

  [
    'Blob', 'File', 'HTMLElement', 'HTMLTextAreaElement', 'HTMLInputElement', 'Node', 'navigator', 'NodeList',
    'SVGElement'
  ].forEach((key) => global[key] = global.window[key]);

  global.Window = global.window.constructor;

  let qunitFixtureDiv = document.createElement('div');
  qunitFixtureDiv.id = 'qunit-fixture';
  document.querySelector('body').appendChild(qunitFixtureDiv);
  // window.scrollTo = () => {};
  //   Object.defineProperty(QUnit.assert.dom, 'rootElement', {
  //     get: () => document.getElementById('ember-testing'),
  //   });
}
