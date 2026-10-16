import '../../../shared-chunks/property_get-DuDs6rLg.js';

/**
 @module @ember/routing
*/

/**
  Generates a controller factory

  @for Ember
  @method generateControllerFactory
  @private
*/

/* eslint-disable @typescript-eslint/no-empty-object-type */
function generateControllerFactory(owner, controllerName) {
  /* eslint-enable @typescript-eslint/no-empty-object-type */
  let factoryManager = owner.factoryFor('controller:basic');
  // `assert()` below after altering *tests*. It is left in this state for the
  // moment in the interest of keeping type-only changes separate from changes
  // to the runtime behavior of the system, even for tests.
  let Factory = factoryManager.class;
  // assert(
  //   '[BUG] factory for `controller:main` is unexpectedly not a Controller',
  //   ((factory): factory is typeof Controller => factory === Controller)(Factory)
  // );

  Factory = class extends Factory {
    toString() {
      return `(generated ${controllerName} controller)`;
    }
  };
  let fullName = `controller:${controllerName}`;
  owner.register(fullName, Factory);

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  return owner.factoryFor(fullName);
}

/**
  Generates and instantiates a controller extending from `controller:basic`
  if present, or `Controller` if not.

  @for Ember
  @method generateController
  @private
  @since 1.3.0
*/
function generateController(owner, controllerName) {
  generateControllerFactory(owner, controllerName);
  let fullName = `controller:${controllerName}`;
  let instance = owner.lookup(fullName);
  return instance;
}

export { generateController as default, generateControllerFactory };
