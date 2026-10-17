/**
 * Gives the node test run a DOM.
 *
 * Loaded before the suite (node's `--import`, Deno's `--preload`), so that the
 * @emberx packages see `window`/`document` when they are evaluated. In the
 * browser suite this file is not used at all.
 */
if (!globalThis.window) {
  // qunitx first, while there is no window: its Deno build carries QUnit twice,
  // and with a window present the second copy throws "QUnit has already been
  // defined". Every later `import 'qunitx'` reuses this instance.
  await import('qunitx');

  const { JSDOM } = await import('jsdom');
  const { window } = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
    url: 'http://localhost',
  });

  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.location = window.location;
  globalThis.self ??= globalThis;

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
  // jsdom fires focus and blur events as a focused browser window does, but its
  // hasFocus() is false until something has focus. Input helpers that see an
  // unfocused window fire those events themselves, so each would fire twice.
  document.hasFocus = () => true;
  // Nor does jsdom implement isContentEditable, which fillIn and typeIn check.
  Object.defineProperty(window.HTMLElement.prototype, 'isContentEditable', {
    get() {
      const editable = this.closest('[contenteditable]');
      return editable !== null && editable.getAttribute('contenteditable') !== 'false';
    },
  });

  const qunitFixture = document.createElement('div');
  qunitFixture.id = 'qunit-fixture';
  document.body.appendChild(qunitFixture);
}
