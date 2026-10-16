import { g as get } from '../../../../../shared-chunks/property_get-DuDs6rLg.js';
import Mixin from '../../../../object/mixin.js';
import { deprecateUntil, DEPRECATIONS } from '../../../deprecations/index.js';

/**
 @module ember
*/

/**
 @class ActionSupport
 @namespace Ember
 @private
*/

const ActionSupport = Mixin.create({
  send(actionName, ...args) {
    deprecateUntil(`Calling \`.send()\` on ${this} is deprecated. Invoke the corresponding method directly.`, DEPRECATIONS.DEPRECATE_TARGET_ACTION_SUPPORT);
    let action = this.actions && this.actions[actionName];
    if (action) {
      let shouldBubble = action.apply(this, args) === true;
      if (!shouldBubble) {
        return;
      }
    }
    let target = get(this, 'target');
    if (target) {
      target.send(...arguments);
    }
  }
});

export { ActionSupport as default };
