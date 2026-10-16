// Vendored from @glimmer/component@2.1.1 (MIT) by scripts/build-emberx-vendor.ts. Do not edit:
// bump @glimmer/component in package.json and run `npm run vendor`.
/// <reference path="../../../types/index.d.ts" />
import BaseComponentManager from './base-component-manager.js';
import { type default as GlimmerComponent } from './component.js';
import type { Arguments } from '@glimmer/interfaces';
/**
 * This component manager runs in Ember.js environments and extends the base component manager to:
 *
 * 1. Properly destroy the component's associated `meta` data structure
 * 2. Schedule destruction using Ember's runloop
 */
declare class EmberGlimmerComponentManager extends BaseComponentManager<GlimmerComponent> {
    capabilities: any;
    destroyComponent(component: GlimmerComponent): void;
}
interface EmberGlimmerComponentManager {
    updateComponent?: (component: GlimmerComponent, args: Arguments) => void;
}
export default EmberGlimmerComponentManager;
