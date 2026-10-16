import { context } from '../../../environment/index.js';
import { g as get } from '../../../../../shared-chunks/property_get-DuDs6rLg.js';
import { c as computed } from '../../../../../shared-chunks/computed-BNdMwGhH.js';
import Mixin from '../../../../object/mixin.js';
import { deprecateUntil, DEPRECATIONS } from '../../../deprecations/index.js';

/**
@module ember
*/


/**
`TargetActionSupport` is a mixin that can be included in a class
to add a `triggerAction` method with semantics similar to the
`{{action}}` helper. In normal Ember usage, the `{{action}}` helper is
usually the best choice. This mixin is most often useful when you are
doing more complex event handling in Components.

@class TargetActionSupport
@namespace Ember
@extends Mixin
@private
*/

const TargetActionSupport = Mixin.create({
  target: null,
  action: null,
  actionContext: null,
  actionContextObject: computed('actionContext', function () {
    let actionContext = get(this, 'actionContext');
    if (typeof actionContext === 'string') {
      let value = get(this, actionContext);
      if (value === undefined) {
        value = get(context.lookup, actionContext);
      }
      return value;
    } else {
      return actionContext;
    }
  }),
  /**
  The following is private and vestigial.
  Send an `action` with an `actionContext` to a `target`. The action, actionContext
  and target will be retrieved from properties of the object. For example:
   ```javascript
  import { alias } from '@ember/object/computed';
   App.SaveButtonView = Ember.View.extend(Ember.TargetActionSupport, {
    target: alias('controller'),
    action: 'save',
    actionContext: alias('context'),
    click() {
      this.triggerAction(); // Sends the `save` action, along with the current context
                            // to the current controller
    }
  });
  ```
   The `target`, `action`, and `actionContext` can be provided as properties of
  an optional object argument to `triggerAction` as well.
   ```javascript
  App.SaveButtonView = Ember.View.extend(Ember.TargetActionSupport, {
    click() {
      this.triggerAction({
        action: 'save',
        target: this.get('controller'),
        actionContext: this.get('context')
      }); // Sends the `save` action, along with the current context
          // to the current controller
    }
  });
  ```
   The `actionContext` defaults to the object you are mixing `TargetActionSupport` into.
  But `target` and `action` must be specified either as properties or with the argument
  to `triggerAction`, or a combination:
   ```javascript
  import { alias } from '@ember/object/computed';
   App.SaveButtonView = Ember.View.extend(Ember.TargetActionSupport, {
    target: alias('controller'),
    click() {
      this.triggerAction({
        action: 'save'
      }); // Sends the `save` action, along with a reference to `this`,
          // to the current controller
    }
  });
  ```
   @method triggerAction
  @deprecated Use a direct method call or closure action instead.
  @param opts {Object} (optional, with the optional keys action, target and/or actionContext)
  @return {Boolean} true if the action was sent successfully and did not return false
  @private
  */
  triggerAction(opts = {}) {
    deprecateUntil(`Calling \`triggerAction\` on ${this} is deprecated. Invoke the target method directly.`, DEPRECATIONS.DEPRECATE_TARGET_ACTION_SUPPORT);
    let {
      action,
      target,
      actionContext
    } = opts;
    action = action || get(this, 'action');
    target = target || getTarget(this);
    if (actionContext === undefined) {
      actionContext = get(this, 'actionContextObject') || this;
    }
    let context = Array.isArray(actionContext) ? actionContext : [actionContext];
    if (target && action) {
      let ret;
      if (isSendable(target)) {
        ret = target.send(action, ...context);
      } else {
        ret = target[action](...context);
      }
      if (ret !== false) {
        return true;
      }
    }
    return false;
  }
});
function isSendable(obj) {
  return obj != null && typeof obj === 'object' && typeof obj.send === 'function';
}
function getTarget(instance) {
  let target = get(instance, 'target');
  if (target) {
    if (typeof target === 'string') {
      let value = get(instance, target);
      if (value === undefined) {
        value = get(context.lookup, target);
      }
      return value;
    } else {
      return target;
    }
  }
  if (instance._target) {
    return instance._target;
  }
  return null;
}

export { TargetActionSupport as default };
