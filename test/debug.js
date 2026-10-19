/**
 * Turns the development checks of emberx's component base class on
 * (CONTRIBUTING.md, EMBERX_DEBUG), so every suite runs with them. Its own
 * module, imported first: an import runs before the body of the file importing it.
 */
globalThis.EMBERX_DEBUG = true;
