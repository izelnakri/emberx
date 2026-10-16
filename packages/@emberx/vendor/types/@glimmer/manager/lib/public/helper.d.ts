declare module '@glimmer/manager/lib/public/helper' {
    import type { Helper, HelperCapabilities, HelperCapabilitiesVersions, HelperDefinitionState, HelperManager, HelperManagerWithDestroyable, HelperManagerWithValue, InternalHelperManager, Owner } from "@glimmer/interfaces";
    import type { ManagerFactory } from "@glimmer/manager/lib/public/index";
    export function helperCapabilities<Version extends keyof HelperCapabilitiesVersions>(managerAPI: Version, options?: Partial<HelperCapabilities>): HelperCapabilities;
    export function hasValue(manager: HelperManager<unknown>): manager is HelperManagerWithValue<unknown>;
    export function hasDestroyable(manager: HelperManager<unknown>): manager is HelperManagerWithDestroyable<unknown>;
    export class CustomHelperManager<O extends Owner = Owner> implements InternalHelperManager<O> {
        private factory;
        constructor(factory: ManagerFactory<O | undefined, HelperManager<unknown>>);
        private helperManagerDelegates;
        private undefinedDelegate;
        private getDelegateForOwner;
        getDelegateFor(owner: O | undefined): HelperManager<unknown>;
        getHelper(definition: HelperDefinitionState): Helper;
    }
}