/**
 * Types setupTest()'s `assert.dom` on QUnitX's Assert, where qunit-dom types it
 * on QUnit's only. A module of its own, which scripts/build-jsr.ts empties: JSR
 * publishes no module augmentation.
 */
import type { Assert as DOMAssert } from 'qunit-dom';
import type {} from 'qunitx/assert';

declare module 'qunitx/assert' {
  export default interface Assert extends DOMAssert {}
}
