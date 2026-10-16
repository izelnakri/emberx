/**
@module @ember/engine
*/

const ENGINE_PARENT = Symbol('ENGINE_PARENT');

/**
  `getEngineParent` retrieves an engine instance's parent instance.

  @method getEngineParent
  @param {EngineInstance} engine An engine instance.
  @return {EngineInstance} The parent engine instance.
  @for @ember/engine
  @static
  @private
*/
function getEngineParent(engine) {
  return engine[ENGINE_PARENT];
}

/**
  `setEngineParent` sets an engine instance's parent instance.

  @method setEngineParent
  @param {EngineInstance} engine An engine instance.
  @param {EngineInstance} parent The parent engine instance.
  @private
*/
function setEngineParent(engine, parent) {
  engine[ENGINE_PARENT] = parent;
}

export { ENGINE_PARENT, getEngineParent, setEngineParent };
