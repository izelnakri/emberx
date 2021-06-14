import Memserver from '@memserver/server';

export default function setupMemserver(hooks) {
  hooks.beforeEach(function () {
    this.lol = { cool: 'izel' };
    // debugger;
    try {
      this.Server = new Memserver({});
    } catch (error) {
      debugger;
    }
    debugger;
  });

  hooks.afterEach(function () {
    console.log('after each', this.lol);
    debugger;
    this.Server.shutdown();
  });
}
