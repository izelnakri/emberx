import Memserver from '@memserver/server';

export default function setupMemserver(hooks) {
  hooks.beforeEach(function () {
    try {
      this.Server = new Memserver({});
    } catch (error) {
      debugger;
    }
    debugger;
  });

  hooks.afterEach(function () {
    this.Server.shutdown();
  });
}
