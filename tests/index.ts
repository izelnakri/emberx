import 'qunit/qunit/qunit.css';

import 'qunit';
import 'qunit-dom/dist/qunit-dom';

QUnit.start();

Object.defineProperty(QUnit.assert.dom, 'rootElement', {
  get: () => document.getElementById('ember-testing'),
});

import './e2e/index.ts';
import './rendering/index.ts';
import './unit/index.ts';
