import { _instrumentStart } from '../@ember/instrumentation/index.js';
import { c as capabilityFlagsFrom } from './capabilities-BuVYh-vx.js';
import { v as valueForRef, U as UNDEFINED_REFERENCE } from './reference-CG0yPgLy.js';
import { E as EMPTY_ARGS } from './arguments-Carzx7C4.js';
import { u as unwrapTemplate } from './curly-xbTtts9R.js';
import { t as templateFactory } from './index-kwuZeaNz.js';

function instrumentationPayload(def) {
  // "main" used to be the outlet name, keeping it around for compatibility
  return {
    object: `${def.name}:main`
  };
}
const CAPABILITIES = {
  dynamicLayout: false,
  dynamicTag: false,
  prepareArgs: false,
  createArgs: false,
  attributeHook: false,
  elementHook: false,
  createCaller: false,
  dynamicScope: true,
  updateHook: false,
  createInstance: true,
  wrapped: false,
  willDestroy: false,
  hasSubOwner: false
};
const CAPABILITIES_MASK = /*@__PURE__*/capabilityFlagsFrom(CAPABILITIES);
class OutletComponentManager {
  create(_owner, definition, _args, env, dynamicScope) {
    let parentStateRef = dynamicScope.get('outletState');
    let currentStateRef = definition.ref;

    // This is the actual primary responsibility of the outlet component –
    // it represents the switching from one route component/template into
    // the next. The rest only exists to support the debug render tree and
    // the old-school (and unreliable) instrumentation.
    dynamicScope.set('outletState', currentStateRef);
    let state = {
      finalize: _instrumentStart('render.outlet', instrumentationPayload, definition)
    };
    if (env.debugRenderTree !== undefined) {
      let parentState = valueForRef(parentStateRef);
      let parentOwner = parentState?.render?.owner;
      let currentState = valueForRef(currentStateRef);
      let currentOwner = currentState?.render?.owner;
      if (parentOwner && parentOwner !== currentOwner) {
        let engineInstance = currentOwner;
        let {
          mountPoint
        } = engineInstance;
        if (mountPoint) {
          state.engine = {
            mountPoint,
            instance: engineInstance
          };
        }
      }
    }
    return state;
  }
  getDebugName({
    name
  }) {
    return `{{outlet}} for ${name}`;
  }
  getDebugCustomRenderTree(_definition, state) {
    let nodes = [];
    nodes.push({
      bucket: state,
      type: 'outlet',
      // "main" used to be the outlet name, keeping it around for compatibility
      name: 'main',
      args: EMPTY_ARGS,
      instance: undefined
    });
    if (state.engine) {
      nodes.push({
        bucket: state.engine,
        type: 'engine',
        name: state.engine.mountPoint,
        args: EMPTY_ARGS,
        instance: state.engine.instance
      });
    }
    return nodes;
  }
  getCapabilities() {
    return CAPABILITIES;
  }
  getSelf() {
    return UNDEFINED_REFERENCE;
  }
  didCreate() {}
  didUpdate() {}
  didRenderLayout(state) {
    state.finalize();
  }
  didUpdateLayout() {}
  getDestroyable() {
    return null;
  }
}
const OUTLET_MANAGER = /*@__PURE__*/new OutletComponentManager();
const OUTLET_COMPONENT_TEMPLATE = templateFactory(
/*
  <@Component @controller={{@controller}} @model={{@model}} />
*/
{
  "id": null,
  "block": "[[[8,[30,1],null,[[\"@controller\",\"@model\"],[[30,2],[30,3]]],null]],[\"@Component\",\"@controller\",\"@model\"],[]]",
  "moduleName": "(unknown template module)",
  "isStrictMode": true
});
class OutletComponent {
  // handle is not used by this custom definition
  handle = -1;
  resolvedName = null;
  manager = OUTLET_MANAGER;
  capabilities = CAPABILITIES_MASK;
  compilable;
  constructor(owner, state) {
    this.state = state;
    this.compilable = unwrapTemplate(OUTLET_COMPONENT_TEMPLATE(owner)).asLayout();
  }
}
function createRootOutlet(outletView) {
  return new OutletComponent(outletView.owner, outletView.state);
}

export { OutletComponent as O, createRootOutlet as c };
