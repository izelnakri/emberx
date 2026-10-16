import { peekMeta } from '../-internals/meta/lib/meta.js';
import { h as hasListeners } from '../../shared-chunks/events-DYrYz3V8.js';
import { n as notifyPropertyChange, a as endPropertyChanges, b as beginPropertyChanges } from '../../shared-chunks/computed-BNdMwGhH.js';
import { r as removeObserver, b as addObserver } from '../../shared-chunks/observers-BmobpXAF.js';
import { g as get } from '../../shared-chunks/property_get-DuDs6rLg.js';
import { s as set } from '../../shared-chunks/property_set-BmAQ0MGK.js';
import { g as getProperties } from '../../shared-chunks/get_properties-CkJ_mhLz.js';
import { s as setProperties } from '../../shared-chunks/set_properties-DYiBfzdk.js';
import Mixin from './mixin.js';

/**
@module @ember/object/observable
*/


/**
  ## Overview

  This mixin provides properties and property observing functionality, core
  features of the Ember object model.

  Properties and observers allow one object to observe changes to a
  property on another object. This is one of the fundamental ways that
  models, controllers and views communicate with each other in an Ember
  application.

  Any object that has this mixin applied can be used in observer
  operations. That includes `EmberObject` and most objects you will
  interact with as you write your Ember application.

  Note that you will not generally apply this mixin to classes yourself,
  but you will use the features provided by this module frequently, so it
  is important to understand how to use it.

  ## Using `get()` and `set()`

  Because of Ember's support for bindings and observers, you will always
  access properties using the get method, and set properties using the
  set method. This allows the observing objects to be notified and
  computed properties to be handled properly.

  More documentation about `get` and `set` are below.

  ## Observing Property Changes

  You typically observe property changes simply by using the `observer`
  function in classes that you write.

  For example:

  ```javascript
  import { observer } from '@ember/object';
  import EmberObject from '@ember/object';

  EmberObject.extend({
    valueObserver: observer('value', function(sender, key, value, rev) {
      // Executes whenever the "value" property changes
      // See the addObserver method for more information about the callback arguments
    })
  });
  ```

  Although this is the most common way to add an observer, this capability
  is actually built into the `EmberObject` class on top of two methods
  defined in this mixin: `addObserver` and `removeObserver`. You can use
  these two methods to add and remove observers yourself if you need to
  do so at runtime.

  To add an observer for a property, call:

  ```javascript
  object.addObserver('propertyKey', targetObject, targetAction)
  ```

  This will call the `targetAction` method on the `targetObject` whenever
  the value of the `propertyKey` changes.

  Note that if `propertyKey` is a computed property, the observer will be
  called when any of the property dependencies are changed, even if the
  resulting value of the computed property is unchanged. This is necessary
  because computed properties are not computed until `get` is called.

  @class Observable
  @public
*/

const Observable = Mixin.create({
  get(keyName) {
    return get(this, keyName);
  },
  getProperties(...args) {
    return getProperties(this, ...args);
  },
  set(keyName, value) {
    return set(this, keyName, value);
  },
  setProperties(hash) {
    return setProperties(this, hash);
  },
  /**
    Begins a grouping of property changes.
     You can use this method to group property changes so that notifications
    will not be sent until the changes are finished. If you plan to make a
    large number of changes to an object at one time, you should call this
    method at the beginning of the changes to begin deferring change
    notifications. When you are done making changes, call
    `endPropertyChanges()` to deliver the deferred change notifications and end
    deferring.
     @method beginPropertyChanges
    @return {Observable}
    @private
  */
  beginPropertyChanges() {
    beginPropertyChanges();
    return this;
  },
  /**
    Ends a grouping of property changes.
     You can use this method to group property changes so that notifications
    will not be sent until the changes are finished. If you plan to make a
    large number of changes to an object at one time, you should call
    `beginPropertyChanges()` at the beginning of the changes to defer change
    notifications. When you are done making changes, call this method to
    deliver the deferred change notifications and end deferring.
     @method endPropertyChanges
    @return {Observable}
    @private
  */
  endPropertyChanges() {
    endPropertyChanges();
    return this;
  },
  notifyPropertyChange(keyName) {
    notifyPropertyChange(this, keyName);
    return this;
  },
  addObserver(key, target, method, sync) {
    addObserver(this, key, target, method, sync);
    return this;
  },
  removeObserver(key, target, method, sync) {
    removeObserver(this, key, target, method, sync);
    return this;
  },
  /**
    Returns `true` if the object currently has observers registered for a
    particular key. You can use this method to potentially defer performing
    an expensive action until someone begins observing a particular property
    on the object.
     @method hasObserverFor
    @param {String} key Key to check
    @return {Boolean}
    @private
  */
  hasObserverFor(key) {
    return hasListeners(this, `${key}:change`);
  },
  incrementProperty(keyName, increment = 1) {
    return set(this, keyName, (parseFloat(get(this, keyName)) || 0) + increment);
  },
  decrementProperty(keyName, decrement = 1) {
    return set(this, keyName, (get(this, keyName) || 0) - decrement);
  },
  toggleProperty(keyName) {
    return set(this, keyName, !get(this, keyName));
  },
  cacheFor(keyName) {
    let meta = peekMeta(this);
    return meta !== null ? meta.valueFor(keyName) : undefined;
  }
});

export { Observable as default };
