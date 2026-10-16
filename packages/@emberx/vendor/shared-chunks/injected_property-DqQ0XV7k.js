import { getOwner } from '../@ember/-internals/owner/index.js';
import { c as computed, d as defineProperty } from './computed-BNdMwGhH.js';
import { i as isElementDescriptor } from './decorator-9ikVwsjY.js';

let DEBUG_INJECTION_FUNCTIONS;

/**
 @module ember
 @private
 */

/**
  Read-only property that returns the result of a container lookup.

  @class InjectedProperty
  @namespace Ember
  @constructor
  @param {String} type The container type the property will lookup
  @param {String} nameOrDesc (optional) The name the property will lookup, defaults
         to the property's name
  @private
*/
// Decorator factory (with args)
// (Also matches non-decorator form, types may be incorrect for this.)

// Non-decorator

// Decorator (without args)

// Catch-all for service and controller injections

function inject(type, ...args) {
  let elementDescriptor;
  let name;
  if (isElementDescriptor(args)) {
    elementDescriptor = args;
  } else if (typeof args[0] === 'string') {
    name = args[0];
  }
  let getInjection = function (propertyName) {
    let owner = getOwner(this) || this.container; // fallback to `container` for backwards compat
    return owner.lookup(`${type}:${name || propertyName}`);
  };
  let decorator = computed({
    get: getInjection,
    set(keyName, value) {
      defineProperty(this, keyName, null, value);
    }
  });
  if (elementDescriptor) {
    return decorator(elementDescriptor[0], elementDescriptor[1], elementDescriptor[2]);
  } else {
    return decorator;
  }
}

export { DEBUG_INJECTION_FUNCTIONS as D, inject as i };
