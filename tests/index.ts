import setupDom from './setup-dom';

(async () => {
  await setupDom();

  console.log('before qunitx import');
  await import('qunit');
  console.log('after qunitx import');

  global.QUnit = global.window.QUnit;
  window.scrollTo = () => {};

  await import('qunit-dom/dist/qunit-dom');

  console.log('after qunit-dom import');
  // QUnit.start();

  Object.defineProperty(QUnit.assert.dom, 'rootElement', {
    get: () => document.getElementById('ember-testing'),
  });
})();
