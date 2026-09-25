import Memserver from '@memserver/server';

export default function setupMemserver(hooks) {
  hooks.beforeEach(function () {
    // Deliberately unguarded. This used to be a try/catch whose handler was a
    // bare `debugger`, so a failure to boot was discarded and only surfaced
    // later as "Cannot read properties of undefined (reading 'shutdown')" in
    // afterEach, with the real cause gone.
    this.Server = new Memserver({});
  });

  hooks.afterEach(function () {
    this.Server?.shutdown();
  });
}
