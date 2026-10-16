import { getOwner } from '../../../owner/index.js';
import { g as guidFor } from '../../../../../shared-chunks/guid-Cbq2sNV_.js';

/**
@module ember
*/

function isSimpleClick(event) {
  if (!(event instanceof MouseEvent)) {
    return false;
  }
  let modifier = event.shiftKey || event.metaKey || event.altKey || event.ctrlKey;
  let secondaryClick = event.button !== 0;
  return !modifier && !secondaryClick;
}
function constructStyleDeprecationMessage(affectedStyle) {
  return '' + 'Binding style attributes may introduce cross-site scripting vulnerabilities; ' + 'please ensure that values being bound are properly escaped. For more information, ' + 'including how to disable this warning, see ' + 'https://deprecations.emberjs.com/v1.x/#toc_binding-style-attributes. ' + 'Style affected: "' + affectedStyle + '"';
}

/**
  @private
  @method getRootViews
  @param {Object} owner
*/
function getRootViews(owner) {
  let registry = owner.lookup('-view-registry:main');
  let rootViews = [];
  Object.keys(registry).forEach(id => {
    let view = registry[id];
    if (view.parentView === null) {
      rootViews.push(view);
    }
  });
  return rootViews;
}

/**
  @private
  @method getViewId
  @param {Ember.View} view
 */
function getViewId(view) {
  if (view.tagName !== '' && view.elementId) {
    return view.elementId;
  } else {
    return guidFor(view);
  }
}
const ELEMENT_VIEW = new WeakMap();
const VIEW_ELEMENT = new WeakMap();
function getElementView(element) {
  return ELEMENT_VIEW.get(element) || null;
}

/**
  @private
  @method getViewElement
  @param {Ember.View} view
 */
function getViewElement(view) {
  return VIEW_ELEMENT.get(view) || null;
}
function setElementView(element, view) {
  ELEMENT_VIEW.set(element, view);
}
function setViewElement(view, element) {
  VIEW_ELEMENT.set(view, element);
}

// These are not needed for GC, but for correctness. We want to be able to
// null-out these links while the objects are still live. Specifically, in
// this case, we want to prevent access to the element (and vice verse) during
// destruction.

function clearElementView(element) {
  ELEMENT_VIEW.delete(element);
}
function clearViewElement(view) {
  VIEW_ELEMENT.delete(view);
}
const CHILD_VIEW_IDS = new WeakMap();

/**
  @private
  @method getChildViews
  @param {Ember.View} view
*/
function getChildViews(view) {
  let owner = getOwner(view);
  let registry = owner.lookup('-view-registry:main');
  return collectChildViews(view, registry);
}
function initChildViews(view) {
  let childViews = new Set();
  CHILD_VIEW_IDS.set(view, childViews);
  return childViews;
}
function addChildView(parent, child) {
  let childViews = CHILD_VIEW_IDS.get(parent);
  if (childViews === undefined) {
    childViews = initChildViews(parent);
  }
  childViews.add(getViewId(child));
}
function collectChildViews(view, registry) {
  let views = [];
  let childViews = CHILD_VIEW_IDS.get(view);
  if (childViews !== undefined) {
    childViews.forEach(id => {
      let view = registry[id];
      if (view && !view.isDestroying && !view.isDestroyed) {
        views.push(view);
      }
    });
  }
  return views;
}

/**
  @private
  @method getViewBounds
  @param {Ember.View} view
*/
function getViewBounds(view) {
  return view.renderer.getBounds(view);
}

/**
  @private
  @method getViewRange
  @param {Ember.View} view
*/
function getViewRange(view) {
  let bounds = getViewBounds(view);
  let range = document.createRange();
  range.setStartBefore(bounds.firstNode);
  range.setEndAfter(bounds.lastNode);
  return range;
}

/**
  `getViewClientRects` provides information about the position of the border
  box edges of a view relative to the viewport.

  It is only intended to be used by development tools like the Ember Inspector.

  @private
  @method getViewClientRects
  @param {Ember.View} view
*/
function getViewClientRects(view) {
  let range = getViewRange(view);
  return range.getClientRects();
}

/**
  `getViewBoundingClientRect` provides information about the position of the
  bounding border box edges of a view relative to the viewport.

  It is only intended to be used by development tools like the Ember Inspector.

  @private
  @method getViewBoundingClientRect
  @param {Ember.View} view
*/
function getViewBoundingClientRect(view) {
  let range = getViewRange(view);
  return range.getBoundingClientRect();
}

export { addChildView, clearElementView, clearViewElement, constructStyleDeprecationMessage, getChildViews, getElementView, getRootViews, getViewBoundingClientRect, getViewBounds, getViewClientRects, getViewElement, getViewId, isSimpleClick, setElementView, setViewElement };
