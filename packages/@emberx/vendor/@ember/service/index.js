import { FrameworkObject } from '../object/-internals.js';
import { deprecateUntil, DEPRECATIONS } from '../-internals/deprecations/index.js';
import { i as inject$1 } from '../../shared-chunks/injected_property-DqQ0XV7k.js';

/**
 @module @ember/service
 @public
 */

/**
  @method inject
  @static
  @since 1.10.0
  @for @ember/service
  @param {String} name (optional) name of the service to inject, defaults to
         the property's name
  @return {ComputedDecorator} injection decorator instance
  @public
  @deprecated Please import `service` instead.
*/

function inject(...args) {
  deprecateUntil('Importing `inject` from `@ember/service` is deprecated. Please import `service` instead.', DEPRECATIONS.DEPRECATE_IMPORT_INJECT);
  return inject$1('service', ...args);
}

/**
  Creates a property that lazily looks up a service in the container. There are
  no restrictions as to what objects a service can be injected into.

  Example:

  ```app/routes/application.js
  import Route from '@ember/routing/route';
  import { service } from '@ember/service';

  export default class ApplicationRoute extends Route {
    @service('auth') authManager;

    model() {
      return this.authManager.findCurrentUser();
    }
  }
  ```

  Classic Class Example:

  ```app/routes/application.js
  import Route from '@ember/routing/route';
  import { service } from '@ember/service';

  export default class ApplicationRoute extends Route {
    @service('auth') authManager;

    model() {
      return this.authManager.findCurrentUser();
    }
  }
  ```

  This example will create an `authManager` property on the application route
  that looks up the `auth` service in the container, making it easily accessible
  in the `model` hook.

  @method service
  @static
  @since 4.1.0
  @for @ember/service
  @param {String} name (optional) name of the service to inject, defaults to
         the property's name
  @return {ComputedDecorator} injection decorator instance
  @public
*/

function service(...args) {
  return inject$1('service', ...args);
}

/**
  @class Service
  @extends EmberObject
  @since 1.10.0
  @public
*/
class Service extends FrameworkObject {
  static isServiceFactory = true;
}

/**
  A type registry for Ember `Service`s. Meant to be declaration-merged so string
  lookups resolve to the correct type.

  Blueprints should include such a declaration merge for TypeScript:

  ```ts
  import Service from '@ember/service';

  export default class ExampleService extends Service {
    // ...
  }

  declare module '@ember/service' {
    export interface Registry {
      example: ExampleService;
    }
  }
  ```

  Then `@service` can check that the service is registered correctly, and APIs
  like `owner.lookup('service:example')` can return `ExampleService`.
 */
// NOTE: this cannot be `Record<string, Service | undefined>`, convenient as
// that would be for end users, because there is no actual contract to that
// effect with Ember -- and in the future this choice would allow us to have
// registered services which have no base class.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type

export { Service as default, inject, service };
