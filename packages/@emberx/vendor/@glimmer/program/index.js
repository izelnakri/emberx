import { aG as constants } from '../../shared-chunks/syscall-ops-CkPT1Kfx.js';
import { e as expect } from '../../shared-chunks/collections-GpG8lT2g.js';
import { u as unwrapTemplate } from '../../shared-chunks/template-BRrQR6KS.js';
import { c as capabilityFlagsFrom, m as managerHasCapability } from '../../shared-chunks/capabilities-BuVYh-vx.js';
import { g as getComponentTemplate } from '../../shared-chunks/template-Dc_cBOoX.js';
import { a as getInternalHelperManager, b as getInternalModifierManager, g as getInternalComponentManager } from '../../shared-chunks/api-DlJKfm_f.js';
import { t as templateFactory } from '../../shared-chunks/index-kwuZeaNz.js';
import { e as enumerate } from '../../shared-chunks/array-utils-CZQxrdD3.js';
import { I as InternalComponentCapabilities } from '../../shared-chunks/flags-BZxHQ0yn.js';
import { o as opcodes } from '../../shared-chunks/opcodes-DDajoGhq.js';
import { a as ProgramHeapImpl } from '../../shared-chunks/program-BAh__OXZ.js';
export { P as ProgramImpl, R as RuntimeOpImpl } from '../../shared-chunks/program-BAh__OXZ.js';

/**
 * Default component template, which is a plain yield
 */
const DEFAULT_TEMPLATE_BLOCK = [[[opcodes.Yield, 1, null]], ['&default'], []];
const DEFAULT_TEMPLATE = {
  // random uuid
  id: '1b32f5c2-7623-43d6-a0ad-9672898920a1',
  moduleName: '__default__.hbs',
  block: JSON.stringify(DEFAULT_TEMPLATE_BLOCK),
  scope: null,
  isStrictMode: true
};

const WELL_KNOWN_EMPTY_ARRAY = Object.freeze([]);
const STARTER_CONSTANTS = constants(WELL_KNOWN_EMPTY_ARRAY);
const WELL_KNOWN_EMPTY_ARRAY_POSITION = STARTER_CONSTANTS.indexOf(WELL_KNOWN_EMPTY_ARRAY);
class ConstantsImpl {
  reifiedArrs = {
    [WELL_KNOWN_EMPTY_ARRAY_POSITION]: WELL_KNOWN_EMPTY_ARRAY
  };
  defaultTemplate = templateFactory(DEFAULT_TEMPLATE)();

  // Used for tests and debugging purposes, and to be able to analyze large apps
  // This is why it's enabled even in production
  helperDefinitionCount = 0;
  modifierDefinitionCount = 0;
  componentDefinitionCount = 0;
  values = STARTER_CONSTANTS.slice();
  indexMap = new Map(this.values.map((value, index) => [value, index]));
  helperDefinitionCache = new WeakMap();
  modifierDefinitionCache = new WeakMap();
  componentDefinitionCache = new WeakMap();
  value(value) {
    let indexMap = this.indexMap;
    let index = indexMap.get(value);
    if (index === undefined) {
      index = this.values.push(value) - 1;
      indexMap.set(value, index);
    }
    return index;
  }
  array(values) {
    if (values.length === 0) {
      return WELL_KNOWN_EMPTY_ARRAY_POSITION;
    }
    let handles = new Array(values.length);
    for (let i = 0; i < values.length; i++) {
      handles[i] = this.value(values[i]);
    }
    return this.value(handles);
  }
  toPool() {
    return this.values;
  }
  hasHandle(handle) {
    return this.values.length > handle;
  }
  helper(definitionState,
  // TODO: Add a way to expose resolved name for debugging
  _resolvedName = null, isOptional) {
    let handle = this.helperDefinitionCache.get(definitionState);
    if (handle === undefined) {
      let managerOrHelper = getInternalHelperManager(definitionState, isOptional);
      if (managerOrHelper === null) {
        this.helperDefinitionCache.set(definitionState, null);
        return null;
      }
      let helper = typeof managerOrHelper === 'function' ? managerOrHelper : managerOrHelper.getHelper(definitionState);
      handle = this.value(helper);
      this.helperDefinitionCache.set(definitionState, handle);
      this.helperDefinitionCount++;
    }
    return handle;
  }
  modifier(definitionState, resolvedName = null, isOptional) {
    let handle = this.modifierDefinitionCache.get(definitionState);
    if (handle === undefined) {
      let manager = getInternalModifierManager(definitionState);
      if (manager === null) {
        this.modifierDefinitionCache.set(definitionState, null);
        return null;
      }
      let definition = {
        resolvedName,
        manager,
        state: definitionState
      };
      handle = this.value(definition);
      this.modifierDefinitionCache.set(definitionState, handle);
      this.modifierDefinitionCount++;
    }
    return handle;
  }
  component(definitionState, owner, isOptional, debugName) {
    let definition = this.componentDefinitionCache.get(definitionState);
    if (definition === undefined) {
      let manager = getInternalComponentManager(definitionState);
      if (manager === null) {
        this.componentDefinitionCache.set(definitionState, null);
        return null;
      }
      let capabilities = capabilityFlagsFrom(manager.getCapabilities(definitionState));
      let templateFactory = getComponentTemplate(definitionState);
      let compilable = null;
      let template;
      if (!managerHasCapability(manager, capabilities, InternalComponentCapabilities.dynamicLayout)) {
        template = templateFactory?.(owner) ?? this.defaultTemplate;
      } else {
        template = templateFactory?.(owner);
      }
      if (template !== undefined) {
        template = unwrapTemplate(template);
        compilable = managerHasCapability(manager, capabilities, InternalComponentCapabilities.wrapped) ? template.asWrappedLayout() : template.asLayout();
      }
      definition = {
        resolvedName: null,
        handle: -1,
        // replaced momentarily
        manager,
        capabilities,
        state: definitionState,
        compilable
      };
      definition.handle = this.value(definition);
      if (debugName) {
        definition.debugName = debugName;
      }
      this.componentDefinitionCache.set(definitionState, definition);
      this.componentDefinitionCount++;
    }
    return definition;
  }
  resolvedComponent(resolvedDefinition, resolvedName) {
    let definition = this.componentDefinitionCache.get(resolvedDefinition);
    if (definition === undefined) {
      let {
        manager,
        state,
        template
      } = resolvedDefinition;
      let capabilities = capabilityFlagsFrom(manager.getCapabilities(resolvedDefinition));
      let compilable = null;
      if (!managerHasCapability(manager, capabilities, InternalComponentCapabilities.dynamicLayout)) {
        template = template ?? this.defaultTemplate;
      }
      if (template !== null) {
        template = unwrapTemplate(template);
        compilable = managerHasCapability(manager, capabilities, InternalComponentCapabilities.wrapped) ? template.asWrappedLayout() : template.asLayout();
      }
      definition = {
        resolvedName,
        handle: -1,
        // replaced momentarily
        manager,
        capabilities,
        state,
        compilable
      };
      definition.handle = this.value(definition);
      this.componentDefinitionCache.set(resolvedDefinition, definition);
      this.componentDefinitionCount++;
    }
    return expect(definition);
  }
  getValue(index) {
    return this.values[index];
  }
  getArray(index) {
    let reifiedArrs = this.reifiedArrs;
    let reified = reifiedArrs[index];
    if (reified === undefined) {
      let names = this.getValue(index);
      reified = new Array(names.length);
      for (const [i, name] of enumerate(names)) {
        reified[i] = this.getValue(name);
      }
      reifiedArrs[index] = reified;
    }
    return reified;
  }
}

function artifacts() {
  return {
    constants: new ConstantsImpl(),
    heap: new ProgramHeapImpl()
  };
}

export { ConstantsImpl, ProgramHeapImpl, artifacts };
