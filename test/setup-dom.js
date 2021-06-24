// TODO: qunit-dom needs to be runnable in node.js, axios needs navigator access
if (!globalThis.window) {
  let setupDom = await import('@memserver/server/dist/setup-dom.js');
  setupDom.default();
  // window.scrollTo = () => {};
  // global.HTMLElement = global.window.HTMLElement;
  //   Object.defineProperty(QUnit.assert.dom, 'rootElement', {
  //     get: () => document.getElementById('ember-testing'),
  //   });
}
