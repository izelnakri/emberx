import { Route } from '@emberx/router';

let record: (step: string) => void = () => {};

/**
 * Sends the steps of every LoggedRoute to the running test's `assert.step`, so
 * the test can check the exact order hooks ran in with `assert.verifySteps`.
 */
export function setupHookSteps(hooks) {
  hooks.beforeEach(function (assert) {
    record = (step) => assert.step(step);
  });
  hooks.afterEach(function () {
    record = () => {};
  });
}

/** Records a step from route code, as the logged hooks do. */
export function step(name: string) {
  record(name);
}

/**
 * A Route whose every router_js hook records "<routeName>: <hook>" before doing
 * what Route does. Extend it and call super from any hook you override.
 */
export default function LoggedRoute(routeName: string) {
  return class LoggedRoute extends Route {
    static beforeModel(_transition) {
      step(`${routeName}: beforeModel`);
    }

    static model(params, transition) {
      step(`${routeName}: model`);

      return super.model(params, transition);
    }

    static afterModel(_model, _transition) {
      step(`${routeName}: afterModel`);
    }

    static redirect(_model, _transition) {
      step(`${routeName}: redirect`);
    }

    static enter() {
      step(`${routeName}: enter`);
    }

    static exit() {
      step(`${routeName}: exit`);
    }

    static setup(model, transition) {
      step(`${routeName}: setup`);

      return super.setup(model, transition);
    }
  };
}
