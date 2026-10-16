import { i as inject } from '../../../../../shared-chunks/injected_property-DqQ0XV7k.js';
import ActionHandler from '../../../runtime/lib/mixins/action_handler.js';
import Evented from '../../../../object/evented.js';
import { FrameworkObject } from '../../../../object/-internals.js';
import states from './states.js';
import { d as decorateFieldV2, i as initializeDeferredDecorator } from '../../../../../shared-chunks/runtime-CYyqkz5q-BOdRhmsS.js';

class CoreView extends FrameworkObject.extend(Evented, ActionHandler) {
  isView = true;
  _superTrigger;
  _superHas;

  /**
    If the view is currently inserted into the DOM of a parent view, this
    property will point to the parent of the view.
     @property parentView
    @type Ember.View
    @default null
    @private
  */

  init(properties) {
    super.init(properties);

    // Handle methods from Evented
    // The native class inheritance will not work for mixins. To work around this,
    // we copy the existing trigger and has methods provided by the mixin and swap in the
    // new ones from our class.
    this._superTrigger = this.trigger;
    this.trigger = this._trigger;
    this._superHas = this.has;
    this.has = this._has;
    this.parentView ??= null;
    this._state = 'preRender';
    this._currentState = this._states.preRender;
  }
  static {
    decorateFieldV2(this.prototype, "renderer", [inject('renderer', '-dom')]);
  }
  #renderer = (initializeDeferredDecorator(this, "renderer"), void 0);
  instrumentDetails(hash) {
    hash['object'] = this.toString();
    hash['containerKey'] = this._debugContainerKey;
    hash['view'] = this;
    return hash;
  }

  /**
    Override the default event firing from `Evented` to
    also call methods with the given name.
     @method trigger
    @param name {String}
    @private
  */
  // Changed to `trigger` on init
  _trigger(name, ...args) {
    this._superTrigger(name, ...args);
    let method = this[name];
    if (typeof method === 'function') {
      return method.apply(this, args);
    }
  }

  // Changed to `has` on init
  _has(name) {
    return typeof this[name] === 'function' || this._superHas(name);
  }
  static isViewFactory = true;
}

// Declare on the prototype to have a single shared value.
CoreView.prototype._states = states;

export { CoreView as default };
