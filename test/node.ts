/**
 * Node suite entry point.
 *
 * emberx's central claim is that its packages resolve and run in node without a
 * framework-specific build system. This suite is what proves it: the package is
 * imported and exercised under plain node, no browser involved.
 *
 * Only @emberx/string is here, and the constraint is the assertion library
 * rather than emberx itself. Every other package's tests assert with
 * `assert.dom(...)` from qunit-dom, which installs onto `QUnit.assert`; under
 * node, qunitx delegates to `node:test`, where there is no such object. Those
 * suites therefore run in the browser, where they also exercise real layout and
 * event dispatch.
 *
 * Two things would widen this suite, both tracked in ROADMAP.md: giving
 * @emberx/router an injectable location strategy (it instantiates LocationBar
 * against `window` at construction), and a DOM assertion path that works under
 * node:test.
 */
import '../packages/@emberx/string/test/index';
