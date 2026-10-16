import { h as hasListeners, r as removeListener, s as sendEvent, a as addListener } from '../../shared-chunks/events-DYrYz3V8.js';
export { o as on } from '../../shared-chunks/events-DYrYz3V8.js';
import Mixin from './mixin.js';

/**
@module @ember/object/evented
*/

/**
  This mixin allows for Ember objects to subscribe to and emit events.

  ```app/utils/person.js
  import EmberObject from '@ember/object';
  import Evented from '@ember/object/evented';

  export default class Person extends EmberObject.extend(Evented) {
    greet() {
      // ...
      this.trigger('greet');
    }
  }
  ```

  ```javascript
  var person = Person.create();

  person.on('greet', function() {
    console.log('Our person has greeted');
  });

  person.greet();

  // outputs: 'Our person has greeted'
  ```

  You can also chain multiple event subscriptions:

  ```javascript
  person.on('greet', function() {
    console.log('Our person has greeted');
  }).one('greet', function() {
    console.log('Offer one-time special');
  }).off('event', this, forgetThis);
  ```

  @class Evented
  @public
 */

const Evented = Mixin.create({
  on(name, target, method) {
    addListener(this, name, target, method);
    return this;
  },
  one(name, target, method) {
    addListener(this, name, target, method, true);
    return this;
  },
  trigger(name, ...args) {
    sendEvent(this, name, args);
  },
  off(name, target, method) {
    removeListener(this, name, target, method);
    return this;
  },
  has(name) {
    return hasListeners(this, name);
  }
});

export { Evented as default };
